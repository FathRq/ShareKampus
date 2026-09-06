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

// NearbyItem merepresentasikan satu baris hasil dari fungsi get_nearby_items di database
type NearbyItem struct {
	ItemID          string  `json:"item_id"`
	ResourceCode    *string `json:"resource_code"`
	Title           string  `json:"title"`
	Category        string  `json:"category"`
	TransactionType string  `json:"transaction_type"`
	MarketPrice     float64 `json:"market_price"`
	CoverPhotoURL   *string `json:"cover_photo_url"`
	Status          string  `json:"status"`
	OwnerID         string  `json:"owner_id"`
	OwnerName       string  `json:"owner_name"`
	OwnerTrustScore float64 `json:"owner_trust_score"`
	DistanceMeter   float64 `json:"distance_meter"`
}

// FindNearby memanggil fungsi PostGIS get_nearby_items untuk mencari barang
// dalam radius tertentu dari titik koordinat pengguna
func (r *ItemRepository) FindNearby(ctx context.Context, lat, lng float64, radiusMeter int, category *string) ([]NearbyItem, error) {
	query := `SELECT * FROM get_nearby_items($1, $2, $3, $4)`

	rows, err := r.db.Query(ctx, query, lat, lng, radiusMeter, category)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []NearbyItem
	for rows.Next() {
		var item NearbyItem
		if err := rows.Scan(
			&item.ItemID, &item.ResourceCode, &item.Title, &item.Category, &item.TransactionType,
			&item.MarketPrice, &item.CoverPhotoURL, &item.Status, &item.OwnerID,
			&item.OwnerName, &item.OwnerTrustScore, &item.DistanceMeter,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, rows.Err()
}
