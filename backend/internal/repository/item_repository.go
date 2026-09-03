package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ItemRepository struct {
	db *pgxpool.Pool
}

func NewItemRepository(db *pgxpool.Pool) *ItemRepository {
	return &ItemRepository{db: db}
}

// CreateItemInput menampung data yang dibutuhkan untuk membuat listing barang baru
type CreateItemInput struct {
	OwnerID         string
	Title           string
	Description     string
	Category        string
	TransactionType string
	MarketPrice     float64
	PhotoURLs       []string // bisa lebih dari satu foto
	Latitude        float64
	Longitude       float64
	MaxLoanDays     int
}

// Create menyimpan listing barang baru BESERTA semua fotonya sekaligus,
// dibungkus dalam satu transaksi database (Begin...Commit). Kalau ada
// bagian yang gagal, SEMUA perubahan dibatalkan (Rollback) -- gak akan
// ada barang "setengah jadi" tanpa foto.
func (r *ItemRepository) Create(ctx context.Context, input CreateItemInput) (string, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(ctx)

	var itemID string

	itemQuery := `
		INSERT INTO items (
			owner_id, title, description, category, transaction_type,
			market_price, location, max_loan_days
		)
		VALUES (
			$1, $2, $3, $4, $5,
			$6, ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography, $9
		)
		RETURNING id
	`

	err = tx.QueryRow(ctx, itemQuery,
		input.OwnerID, input.Title, input.Description, input.Category, input.TransactionType,
		input.MarketPrice, input.Longitude, input.Latitude, input.MaxLoanDays,
	).Scan(&itemID)
	if err != nil {
		return "", err
	}

	photoQuery := `INSERT INTO item_photos (item_id, photo_url, sort_order) VALUES ($1, $2, $3)`
	for i, url := range input.PhotoURLs {
		_, err = tx.Exec(ctx, photoQuery, itemID, url, i)
		if err != nil {
			return "", err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return "", err
	}

	return itemID, nil
}
