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
	ItemID             string
	BorrowerID         string
	MeetingScheduledAt *time.Time
	MeetingLatitude    *float64
	MeetingLongitude   *float64
	Notes              *string
}

// Create membuat transaksi baru berstatus 'pending'.
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
		`INSERT INTO transactions (
			item_id, borrower_id, lender_id, status, agreed_return_date,
			meeting_scheduled_at, meeting_point, notes
		)
		VALUES (
			$1, $2, $3, 'pending', $4,
			$5,
			CASE WHEN $6::double precision IS NOT NULL AND $7::double precision IS NOT NULL
				THEN ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography
				ELSE NULL END,
			$8
		)
		RETURNING id`,
		input.ItemID, input.BorrowerID, ownerID, agreedReturnDate,
		input.MeetingScheduledAt,
		input.MeetingLongitude, input.MeetingLatitude,
		input.Notes,
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

type UpdateStatusInput struct {
	TransactionID      string
	RequesterID        string
	NewStatus          string
	MeetingScheduledAt *time.Time // opsional -- override waktu, cuma dipakai kalau NewStatus == "active"
	MeetingLatitude    *float64
	MeetingLongitude   *float64
}

// UpdateStatus menangani approve/reject/cancel/returned dalam satu fungsi.
func (r *TransactionRepository) UpdateStatus(ctx context.Context, input UpdateStatusInput) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var row transactionRow
	err = tx.QueryRow(ctx,
		`SELECT item_id, borrower_id, lender_id, status FROM transactions WHERE id = $1 FOR UPDATE`,
		input.TransactionID,
	).Scan(&row.ItemID, &row.BorrowerID, &row.LenderID, &row.Status)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrTransactionNotFound
		}
		return err
	}

	switch input.NewStatus {
	case "active":
		if row.Status != "pending" {
			return ErrInvalidStatusTransition
		}
		if input.RequesterID != row.LenderID {
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
		if input.RequesterID != row.LenderID {
			return ErrNotAuthorizedForAction
		}

	case "cancelled":
		if row.Status != "pending" {
			return ErrInvalidStatusTransition
		}
		if input.RequesterID != row.BorrowerID {
			return ErrNotAuthorizedForAction
		}

	case "returned":
		if row.Status != "active" {
			return ErrInvalidStatusTransition
		}
		if input.RequesterID != row.BorrowerID && input.RequesterID != row.LenderID {
			return ErrNotAuthorizedForAction
		}
		if _, err := tx.Exec(ctx, `UPDATE items SET status = 'available' WHERE id = $1`, row.ItemID); err != nil {
			return err
		}
	}

	// Update status transaksi. Kalau NewStatus == "active" dan pemilik kasih
	// override waktu/lokasi, ikut di-update di sini juga -- kalau tidak
	// dikasih (nil), COALESCE/CASE menjaga nilai lama (usulan peminjam) tetap.
	if input.NewStatus == "returned" {
		_, err = tx.Exec(ctx,
			`UPDATE transactions SET status = $1, returned_at = now() WHERE id = $2`,
			input.NewStatus, input.TransactionID,
		)
	} else {
		_, err = tx.Exec(ctx,
			`UPDATE transactions SET
				status = $1,
				meeting_scheduled_at = COALESCE($3, meeting_scheduled_at),
				meeting_point = CASE
					WHEN $4::double precision IS NOT NULL AND $5::double precision IS NOT NULL
					THEN ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography
					ELSE meeting_point
				END
			WHERE id = $2`,
			input.NewStatus, input.TransactionID,
			input.MeetingScheduledAt,
			input.MeetingLongitude, input.MeetingLatitude,
		)
	}
	if err != nil {
		return err
	}

	if input.NewStatus == "returned" {
		if _, err := tx.Exec(ctx, `SELECT recalculate_trust_score($1)`, row.BorrowerID); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `SELECT recalculate_trust_score($1)`, row.LenderID); err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

type TransactionSummary struct {
	TransactionID      string     `json:"transaction_id"`
	Status             string     `json:"status"`
	Role               string     `json:"role"` // "borrower" atau "lender" -- relatif ke user yang login
	ItemID             string     `json:"item_id"`
	ItemTitle          string     `json:"item_title"`
	ItemCoverPhotoURL  *string    `json:"item_cover_photo_url"`
	CounterpartID      string     `json:"counterpart_id"` // pihak lawan (kalau saya borrower, ini lender, dst)
	CounterpartName    string     `json:"counterpart_name"`
	AgreedReturnDate   *time.Time `json:"agreed_return_date"`
	ReturnedAt         *time.Time `json:"returned_at"`
	MeetingScheduledAt *time.Time `json:"meeting_scheduled_at"`
	CreatedAt          time.Time  `json:"created_at"`
}

// ListByUser mengambil semua transaksi milik user (baik sebagai borrower maupun lender)
func (r *TransactionRepository) ListByUser(ctx context.Context, userID string) ([]TransactionSummary, error) {
	query := `
		SELECT
			t.id, t.status,
			CASE WHEN t.borrower_id = $1 THEN 'borrower' ELSE 'lender' END AS role,
			t.item_id, i.title,
			(SELECT ip.photo_url FROM item_photos ip WHERE ip.item_id = i.id ORDER BY ip.sort_order ASC LIMIT 1),
			CASE WHEN t.borrower_id = $1 THEN t.lender_id ELSE t.borrower_id END AS counterpart_id,
			CASE WHEN t.borrower_id = $1 THEN lu.full_name ELSE bu.full_name END AS counterpart_name,
			t.agreed_return_date, t.returned_at, t.meeting_scheduled_at, t.created_at
		FROM transactions t
		JOIN items i ON i.id = t.item_id
		JOIN users bu ON bu.id = t.borrower_id
		JOIN users lu ON lu.id = t.lender_id
		WHERE t.borrower_id = $1 OR t.lender_id = $1
		ORDER BY t.created_at DESC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []TransactionSummary
	for rows.Next() {
		var s TransactionSummary
		if err := rows.Scan(
			&s.TransactionID, &s.Status, &s.Role, &s.ItemID, &s.ItemTitle, &s.ItemCoverPhotoURL,
			&s.CounterpartID, &s.CounterpartName,
			&s.AgreedReturnDate, &s.ReturnedAt, &s.MeetingScheduledAt, &s.CreatedAt,
		); err != nil {
			return nil, err
		}
		results = append(results, s)
	}
	if results == nil {
		results = []TransactionSummary{}
	}
	return results, nil
}

type TransactionDetail struct {
	TransactionID      string     `json:"transaction_id"`
	Status             string     `json:"status"`
	ItemID             string     `json:"item_id"`
	ItemTitle          string     `json:"item_title"`
	ItemMarketPrice    float64    `json:"item_market_price"`
	BorrowerID         string     `json:"borrower_id"`
	BorrowerName       string     `json:"borrower_name"`
	LenderID           string     `json:"lender_id"`
	LenderName         string     `json:"lender_name"`
	AgreedReturnDate   *time.Time `json:"agreed_return_date"`
	ReturnedAt         *time.Time `json:"returned_at"`
	MeetingScheduledAt *time.Time `json:"meeting_scheduled_at"`
	MeetingPointText   *string    `json:"meeting_point_text"` // format "POINT(lng lat)", dikonversi lebih lanjut kalau perlu
	Notes              *string    `json:"notes"`
	CreatedAt          time.Time  `json:"created_at"`
}

// GetDetail mengambil detail 1 transaksi -- authorization (borrower/lender) dicek di service layer
func (r *TransactionRepository) GetDetail(ctx context.Context, transactionID string) (*TransactionDetail, error) {
	var d TransactionDetail
	query := `
		SELECT
			t.id, t.status, t.item_id, i.title, i.market_price,
			t.borrower_id, bu.full_name,
			t.lender_id, lu.full_name,
			t.agreed_return_date, t.returned_at, t.meeting_scheduled_at,
			ST_AsText(t.meeting_point), t.notes, t.created_at
		FROM transactions t
		JOIN items i ON i.id = t.item_id
		JOIN users bu ON bu.id = t.borrower_id
		JOIN users lu ON lu.id = t.lender_id
		WHERE t.id = $1
	`
	err := r.db.QueryRow(ctx, query, transactionID).Scan(
		&d.TransactionID, &d.Status, &d.ItemID, &d.ItemTitle, &d.ItemMarketPrice,
		&d.BorrowerID, &d.BorrowerName, &d.LenderID, &d.LenderName,
		&d.AgreedReturnDate, &d.ReturnedAt, &d.MeetingScheduledAt,
		&d.MeetingPointText, &d.Notes, &d.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTransactionNotFound
		}
		return nil, err
	}
	return &d, nil
}
