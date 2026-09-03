package service

import (
	"context"
	"errors"

	"github.com/FathRq/ShareKampus/backend/internal/repository"
)

var (
	ErrInvalidCategory        = errors.New("kategori barang tidak valid")
	ErrInvalidTransactionType = errors.New("tipe transaksi tidak valid")
)

// Daftar nilai yang sah, HARUS sama persis dengan ENUM di ERD.sql
var validCategories = map[string]bool{
	"buku":       true,
	"alat_lab":   true,
	"elektronik": true,
	"lainnya":    true,
}

var validTransactionTypes = map[string]bool{
	"pinjam":   true,
	"barter":   true,
	"keduanya": true,
}

type CreateItemInput struct {
	OwnerID         string
	Title           string
	Description     string
	Category        string
	TransactionType string
	MarketPrice     float64
	PhotoURLs       []string
	Latitude        float64
	Longitude       float64
	MaxLoanDays     int
}

type ItemService struct {
	itemRepo *repository.ItemRepository
}

func NewItemService(itemRepo *repository.ItemRepository) *ItemService {
	return &ItemService{itemRepo: itemRepo}
}

func (s *ItemService) CreateItem(ctx context.Context, input CreateItemInput) (string, error) {
	if !validCategories[input.Category] {
		return "", ErrInvalidCategory
	}

	if !validTransactionTypes[input.TransactionType] {
		return "", ErrInvalidTransactionType
	}

	// Kalau max_loan_days gak diisi (0), pakai default 7 hari
	maxLoanDays := input.MaxLoanDays
	if maxLoanDays == 0 {
		maxLoanDays = 7
	}

	return s.itemRepo.Create(ctx, repository.CreateItemInput{
		OwnerID:         input.OwnerID,
		Title:           input.Title,
		Description:     input.Description,
		Category:        input.Category,
		TransactionType: input.TransactionType,
		MarketPrice:     input.MarketPrice,
		PhotoURLs:       input.PhotoURLs,
		Latitude:        input.Latitude,
		Longitude:       input.Longitude,
		MaxLoanDays:     maxLoanDays,
	})
}
