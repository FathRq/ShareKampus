package service

import (
	"context"
	"errors"

	"github.com/FathRq/ShareKampus/backend/internal/repository"
)

var ErrInvalidStatusValue = errors.New("nilai status tidak valid, harus salah satu dari: active, rejected, cancelled, returned")

var validTransactionStatuses = map[string]bool{
	"active":    true,
	"rejected":  true,
	"cancelled": true,
	"returned":  true,
}

type TransactionService struct {
	transactionRepo *repository.TransactionRepository
}

func NewTransactionService(transactionRepo *repository.TransactionRepository) *TransactionService {
	return &TransactionService{transactionRepo: transactionRepo}
}

type CreateTransactionInput struct {
	ItemID     string
	BorrowerID string
}

func (s *TransactionService) CreateTransaction(ctx context.Context, input CreateTransactionInput) (string, error) {
	return s.transactionRepo.Create(ctx, repository.CreateTransactionInput{
		ItemID:     input.ItemID,
		BorrowerID: input.BorrowerID,
	})
}

func (s *TransactionService) UpdateStatus(ctx context.Context, transactionID, requesterID, newStatus string) error {
	if !validTransactionStatuses[newStatus] {
		return ErrInvalidStatusValue
	}
	return s.transactionRepo.UpdateStatus(ctx, transactionID, requesterID, newStatus)
}
