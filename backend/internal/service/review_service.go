package service

import (
	"context"
	"errors"

	"github.com/FathRq/ShareKampus/backend/internal/repository"
)

var ErrInvalidRating = errors.New("rating harus antara 1 sampai 5")

type ReviewService struct {
	reviewRepo *repository.ReviewRepository
}

func NewReviewService(reviewRepo *repository.ReviewRepository) *ReviewService {
	return &ReviewService{reviewRepo: reviewRepo}
}

type CreateReviewInput struct {
	TransactionID string
	ReviewerID    string
	Rating        int
	Comment       *string
}

func (s *ReviewService) CreateReview(ctx context.Context, input CreateReviewInput) (string, error) {
	if input.Rating < 1 || input.Rating > 5 {
		return "", ErrInvalidRating
	}

	return s.reviewRepo.Create(ctx, repository.CreateReviewInput{
		TransactionID: input.TransactionID,
		ReviewerID:    input.ReviewerID,
		Rating:        input.Rating,
		Comment:       input.Comment,
	})
}
