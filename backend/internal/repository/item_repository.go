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
	PhotoURL        string
	Latitude        float64
	Longitude       float64
	MaxLoanDays     int
}

// Create menyimpan listing barang baru, memakai titik lokasi user saat itu
// sebagai lokasi barang (lewat ST_MakePoint, sama polanya dengan campus_locations)
func (r *ItemRepository) Create(ctx context.Context, input CreateItemInput) (string, error) {
	var id string

	query := `
		INSERT INTO items (
			owner_id, title, description, category, transaction_type,
			market_price, photo_url, location, max_loan_days
		)
		VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, ST_SetSRID(ST_MakePoint($8, $9), 4326)::geography, $10
		)
		RETURNING id
	`

	err := r.db.QueryRow(ctx, query,
		input.OwnerID, input.Title, input.Description, input.Category, input.TransactionType,
		input.MarketPrice, input.PhotoURL, input.Longitude, input.Latitude, input.MaxLoanDays,
	).Scan(&id)

	return id, err
}
