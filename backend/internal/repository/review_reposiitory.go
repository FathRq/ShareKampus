package repository

import (
	"context"
	"errors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrTransactionNotReturned = errors.New("transaksi belum selesai (returned), belum bisa diberi ulasan")
	ErrNotPartOfTransaction   = errors.New("kamu bukan bagian dari transaksi ini")
	ErrReviewAlreadyExists    = errors.New("kamu sudah pernah memberi ulasan untuk transaksi ini")
)

type ReviewRepository struct {
	db *pgxpool.Pool
}

func NewReviewRepository(db *pgxpool.Pool) *ReviewRepository {
	return &ReviewRepository{db: db}
}

type CreateReviewInput struct {
	TransactionID string
	ReviewerID    string
	Rating        int
	Comment       *string
}

func (r *ReviewRepository) Create(ctx context.Context, input CreateReviewInput) (string, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(ctx)

	var borrowerID, lenderID, status string
	err = tx.QueryRow(ctx,
		`SELECT borrower_id, lender_id, status FROM transactions WHERE id = $1 FOR UPDATE`,
		input.TransactionID,
	).Scan(&borrowerID, &lenderID, &status)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", ErrTransactionNotFound
		}
		return "", err
	}

	if status != "returned" {
		return "", ErrTransactionNotReturned
	}

	var revieweeID string
	switch input.ReviewerID {
	case borrowerID:
		revieweeID = lenderID
	case lenderID:
		revieweeID = borrowerID
	default:
		return "", ErrNotPartOfTransaction
	}

	var reviewID string
	err = tx.QueryRow(ctx,
		`INSERT INTO reviews (transaction_id, reviewer_id, reviewee_id, rating, comment)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id`,
		input.TransactionID, input.ReviewerID, revieweeID, input.Rating, input.Comment,
	).Scan(&reviewID)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" { // unique_violation
			return "", ErrReviewAlreadyExists
		}
		return "", err
	}

	// Panggil fungsi SQL yang sudah ada -- hitung ulang & update trust_score reviewee
	if _, err := tx.Exec(ctx, `SELECT recalculate_trust_score($1)`, revieweeID); err != nil {
		return "", err
	}

	if err := tx.Commit(ctx); err != nil {
		return "", err
	}

	return reviewID, nil
}
