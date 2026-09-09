package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type StatsRepository struct {
	db *pgxpool.Pool
}

func NewStatsRepository(db *pgxpool.Pool) *StatsRepository {
	return &StatsRepository{db: db}
}

type ExpenseSaverStats struct {
	TotalSaved            float64 `json:"total_saved"`
	CompletedTransactions int     `json:"completed_transactions"`
}

// GetExpenseSaver memanggil fungsi SQL get_expense_saver_total() yang sudah
// ada di database -- satu sumber kebenaran untuk formula ini, sesuai ARCH.md
func (r *StatsRepository) GetExpenseSaver(ctx context.Context) (*ExpenseSaverStats, error) {
	var stats ExpenseSaverStats

	err := r.db.QueryRow(ctx, `SELECT * FROM get_expense_saver_total()`).
		Scan(&stats.TotalSaved, &stats.CompletedTransactions)
	if err != nil {
		return nil, err
	}

	return &stats, nil
}
