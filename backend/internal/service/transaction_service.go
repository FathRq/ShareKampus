package service

import (
	"context"
	"errors"
	"time"

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
	ItemID             string
	BorrowerID         string
	MeetingScheduledAt *time.Time
	MeetingLatitude    *float64
	MeetingLongitude   *float64
	Notes              *string
}

func (s *TransactionService) CreateTransaction(ctx context.Context, input CreateTransactionInput) (string, error) {
	return s.transactionRepo.Create(ctx, repository.CreateTransactionInput{
		ItemID:             input.ItemID,
		BorrowerID:         input.BorrowerID,
		MeetingScheduledAt: input.MeetingScheduledAt,
		MeetingLatitude:    input.MeetingLatitude,
		MeetingLongitude:   input.MeetingLongitude,
		Notes:              input.Notes,
	})
}

type UpdateStatusInput struct {
	TransactionID      string
	RequesterID        string
	NewStatus          string
	MeetingScheduledAt *time.Time
	MeetingLatitude    *float64
	MeetingLongitude   *float64
}

func (s *TransactionService) UpdateStatus(ctx context.Context, input UpdateStatusInput) error {
	if !validTransactionStatuses[input.NewStatus] {
		return ErrInvalidStatusValue
	}
	return s.transactionRepo.UpdateStatus(ctx, repository.UpdateStatusInput{
		TransactionID:      input.TransactionID,
		RequesterID:        input.RequesterID,
		NewStatus:          input.NewStatus,
		MeetingScheduledAt: input.MeetingScheduledAt,
		MeetingLatitude:    input.MeetingLatitude,
		MeetingLongitude:   input.MeetingLongitude,
	})
}

func (s *TransactionService) ListByUser(ctx context.Context, userID string) ([]repository.TransactionSummary, error) {
	return s.transactionRepo.ListByUser(ctx, userID)
}

func (s *TransactionService) GetDetail(ctx context.Context, transactionID, requesterID string) (*repository.TransactionDetail, error) {
	detail, err := s.transactionRepo.GetDetail(ctx, transactionID)
	if err != nil {
		return nil, err
	}
	if requesterID != detail.BorrowerID && requesterID != detail.LenderID {
		return nil, repository.ErrNotAuthorizedForAction
	}
	return detail, nil
}
