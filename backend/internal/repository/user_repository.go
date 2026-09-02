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
