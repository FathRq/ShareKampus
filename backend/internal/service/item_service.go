package service

import (
	"context"
	"errors"

	"github.com/FathRq/ShareKampus/backend/internal/repository"
)

var ErrInvalidCategory = errors.New("kategori tidak valid")
var ErrInvalidTransactionType = errors.New("tipe transaksi tidak valid")

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

type ItemService struct {
	itemRepo *repository.ItemRepository
}

func NewItemService(itemRepo *repository.ItemRepository) *ItemService {
	return &ItemService{itemRepo: itemRepo}
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

func (s *ItemService) CreateItem(ctx context.Context, input CreateItemInput) (string, error) {
	if !validCategories[input.Category] {
		return "", ErrInvalidCategory
	}
	if !validTransactionTypes[input.TransactionType] {
		return "", ErrInvalidTransactionType
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
		MaxLoanDays:     input.MaxLoanDays,
	})
}

type FindNearbyInput struct {
	Latitude    float64
	Longitude   float64
	RadiusMeter int
	Category    *string
	SearchQuery *string
}

func (s *ItemService) FindNearby(ctx context.Context, input FindNearbyInput) ([]repository.NearbyItem, error) {
	radius := input.RadiusMeter
	if radius <= 0 {
		radius = 2500
	}
	if input.Category != nil {
		if !validCategories[*input.Category] {
			return nil, ErrInvalidCategory
		}
	}
	return s.itemRepo.FindNearby(ctx, input.Latitude, input.Longitude, radius, input.Category, input.SearchQuery)
}

func (s *ItemService) DeleteItem(ctx context.Context, itemID, requesterID string) (string, error) {
	return s.itemRepo.Delete(ctx, itemID, requesterID)
}
