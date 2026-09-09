package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrItemNotFound            = errors.New("barang tidak ditemukan")
	ErrItemNotAvailable        = errors.New("barang sedang tidak tersedia")
	ErrCannotBorrowOwnItem     = errors.New("tidak bisa meminjam barang milik sendiri")
	ErrTransactionNotFound     = errors.New("transaksi tidak ditemukan")
	ErrInvalidStatusTransition = errors.New("perubahan status tidak valid untuk kondisi transaksi saat ini")
	ErrNotAuthorizedForAction  = errors.New("kamu tidak berwenang melakukan aksi ini")
)

type TransactionRepository struct {
	db *pgxpool.Pool
}

func NewTransactionRepository(db *pgxpool.Pool) *TransactionRepository {
	return &TransactionRepository{db: db}
}

type CreateTransactionInput struct {
	ItemID     string
	BorrowerID string
}

// Create membuat transaksi baru berstatus 'pending'.
// Barang DIKUNCI SEMENTARA (row lock) selama proses pengecekan untuk mencegah
// race condition, tapi status barang TIDAK diubah -- tetap 'available',
// sesuai desain: boleh ada banyak request pending untuk barang yang sama.
func (r *TransactionRepository) Create(ctx context.Context, input CreateTransactionInput) (string, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(ctx)

	var ownerID, itemStatus string
	var maxLoanDays int

	err = tx.QueryRow(ctx,
		`SELECT owner_id, status, max_loan_days FROM items WHERE id = $1 FOR UPDATE`,
		input.ItemID,
	).Scan(&ownerID, &itemStatus, &maxLoanDays)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", ErrItemNotFound
		}
		return "", err
	}

	if itemStatus != "available" {
		return "", ErrItemNotAvailable
	}

	if ownerID == input.BorrowerID {
		return "", ErrCannotBorrowOwnItem
	}

	agreedReturnDate := time.Now().AddDate(0, 0, maxLoanDays)

	var transactionID string
	err = tx.QueryRow(ctx,
		`INSERT INTO transactions (item_id, borrower_id, lender_id, status, agreed_return_date)
		 VALUES ($1, $2, $3, 'pending', $4)
		 RETURNING id`,
		input.ItemID, input.BorrowerID, ownerID, agreedReturnDate,
	).Scan(&transactionID)
	if err != nil {
		return "", err
	}

	if err := tx.Commit(ctx); err != nil {
		return "", err
	}

	return transactionID, nil
}

type transactionRow struct {
	ItemID     string
	BorrowerID string
	LenderID   string
	Status     string
}

// UpdateStatus menangani approve/reject/cancel/returned dalam satu fungsi,
// aturan siapa-boleh-apa dicek di dalam sini, dibungkus satu transaksi DB.
func (r *TransactionRepository) UpdateStatus(ctx context.Context, transactionID, requesterID, newStatus string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var row transactionRow
	err = tx.QueryRow(ctx,
		`SELECT item_id, borrower_id, lender_id, status FROM transactions WHERE id = $1 FOR UPDATE`,
		transactionID,
	).Scan(&row.ItemID, &row.BorrowerID, &row.LenderID, &row.Status)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrTransactionNotFound
		}
		return err
	}

	switch newStatus {
	case "active":
		if row.Status != "pending" {
			return ErrInvalidStatusTransition
		}
		if requesterID != row.LenderID {
			return ErrNotAuthorizedForAction
		}
		var itemStatus string
		if err := tx.QueryRow(ctx, `SELECT status FROM items WHERE id = $1 FOR UPDATE`, row.ItemID).Scan(&itemStatus); err != nil {
			return err
		}
		if itemStatus != "available" {
			return ErrItemNotAvailable
		}
		if _, err := tx.Exec(ctx, `UPDATE items SET status = 'on_transaction' WHERE id = $1`, row.ItemID); err != nil {
			return err
		}

	case "rejected":
		if row.Status != "pending" {
			return ErrInvalidStatusTransition
		}
		if requesterID != row.LenderID {
			return ErrNotAuthorizedForAction
		}

	case "cancelled":
		if row.Status != "pending" {
			return ErrInvalidStatusTransition
		}
		if requesterID != row.BorrowerID {
			return ErrNotAuthorizedForAction
		}

	case "returned":
		if row.Status != "active" {
			return ErrInvalidStatusTransition
		}
		if requesterID != row.BorrowerID && requesterID != row.LenderID {
			return ErrNotAuthorizedForAction
		}
		if _, err := tx.Exec(ctx, `UPDATE items SET status = 'available' WHERE id = $1`, row.ItemID); err != nil {
			return err
		}
	}

	// Update status transaksi -- HARUS dieksekusi SEBELUM recalculate_trust_score,
	// supaya fungsi hitung itu "melihat" status terbaru transaksi ini.
	if newStatus == "returned" {
		_, err = tx.Exec(ctx, `UPDATE transactions SET status = $1, returned_at = now() WHERE id = $2`, newStatus, transactionID)
	} else {
		_, err = tx.Exec(ctx, `UPDATE transactions SET status = $1 WHERE id = $2`, newStatus, transactionID)
	}
	if err != nil {
		return err
	}

	// Baru sekarang recalculate -- setelah status 'returned' sudah tersimpan
	if newStatus == "returned" {
		if _, err := tx.Exec(ctx, `SELECT recalculate_trust_score($1)`, row.BorrowerID); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `SELECT recalculate_trust_score($1)`, row.LenderID); err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}
