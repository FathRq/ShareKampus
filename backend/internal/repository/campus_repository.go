package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ErrCampusNotFound dikembalikan kalau domain email tidak cocok dengan kampus manapun
var ErrCampusNotFound = errors.New("domain email tidak terdaftar sebagai kampus resmi")

// Campus merepresentasikan satu baris dari tabel campuses
type Campus struct {
	ID          string
	Name        string
	EmailDomain string
}

type CampusRepository struct {
	db *pgxpool.Pool
}

func NewCampusRepository(db *pgxpool.Pool) *CampusRepository {
	return &CampusRepository{db: db}
}

// FindByEmailDomain mencari kampus berdasarkan domain email (contoh: "unesa.ac.id")
func (r *CampusRepository) FindByEmailDomain(ctx context.Context, domain string) (*Campus, error) {
	var c Campus

	query := `SELECT id, name, email_domain FROM campuses WHERE email_domain = $1`

	err := r.db.QueryRow(ctx, query, domain).Scan(&c.ID, &c.Name, &c.EmailDomain)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrCampusNotFound
		}
		return nil, err
	}

	return &c, nil
}
