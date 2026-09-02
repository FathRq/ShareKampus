package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

// NewPostgresPool membuka "kolam koneksi" (connection pool) ke database Supabase.
// Dipanggil sekali saja waktu aplikasi start, lalu dipakai berulang-ulang
// oleh seluruh handler tanpa perlu buka koneksi baru tiap request.
func NewPostgresPool(databaseURL string) (*pgxpool.Pool, error) {
	pool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat connection pool: %w", err)
	}

	// Ping untuk memastikan koneksi beneran nyambung, bukan cuma "siap nyoba nanti"
	if err := pool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("gagal ping database: %w", err)
	}

	return pool, nil
}
