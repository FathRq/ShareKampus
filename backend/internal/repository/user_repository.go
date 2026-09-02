package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

// CreateProfile menyimpan baris profil baru ke tabel users.
// WAJIB dipanggil SETELAH Supabase Auth berhasil bikin akunnya,
// karena `id` di sini harus sama persis dengan ID dari auth.users.
func (r *UserRepository) CreateProfile(ctx context.Context, id, campusID, campusLocationID, fullName, email string) error {
	query := `
		INSERT INTO users (id, campus_id, campus_location_id, full_name, email)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err := r.db.Exec(ctx, query, id, campusID, campusLocationID, fullName, email)
	return err
}

// UserProfile menampung data profil lengkap seorang user
type UserProfile struct {
	ID           string  `json:"id"`
	FullName     string  `json:"full_name"`
	Email        string  `json:"email"`
	TrustScore   float64 `json:"trust_score"`
	CampusName   string  `json:"campus_name"`
	LocationName *string `json:"campus_location_name"`
}

// GetByID mengambil profil lengkap satu user berdasarkan ID
func (r *UserRepository) GetByID(ctx context.Context, id string) (*UserProfile, error) {
	var p UserProfile

	query := `
		SELECT
			u.id,
			u.full_name,
			u.email,
			u.trust_score,
			c.name AS campus_name,
			cl.name AS campus_location_name
		FROM users u
		JOIN campuses c ON c.id = u.campus_id
		LEFT JOIN campus_locations cl ON cl.id = u.campus_location_id
		WHERE u.id = $1
	`

	err := r.db.QueryRow(ctx, query, id).Scan(
		&p.ID, &p.FullName, &p.Email, &p.TrustScore, &p.CampusName, &p.LocationName,
	)
	if err != nil {
		return nil, err
	}

	return &p, nil
}
