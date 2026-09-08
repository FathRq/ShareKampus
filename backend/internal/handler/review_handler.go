package handler

import (
	"errors"
	"net/http"

	"github.com/FathRq/ShareKampus/backend/internal/middleware"
	"github.com/FathRq/ShareKampus/backend/internal/repository"
	"github.com/FathRq/ShareKampus/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	reviewService *service.ReviewService
}

func NewReviewHandler(reviewService *service.ReviewService) *ReviewHandler {
	return &ReviewHandler{reviewService: reviewService}
}

type createReviewRequest struct {
	TransactionID string  `json:"transaction_id" binding:"required"`
	Rating        int     `json:"rating" binding:"required"`
	Comment       *string `json:"comment"`
}

// Create menangani POST /reviews
func (h *ReviewHandler) Create(c *gin.Context) {
	var req createReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   gin.H{"code": "VALIDATION_ERROR", "message": err.Error()},
		})
		return
	}

	reviewerID, _ := c.Get(string(middleware.UserIDContextKey))

	reviewID, err := h.reviewService.CreateReview(c.Request.Context(), service.CreateReviewInput{
		TransactionID: req.TransactionID,
		ReviewerID:    reviewerID.(string),
		Rating:        req.Rating,
		Comment:       req.Comment,
	})

	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidRating):
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		case errors.Is(err, repository.ErrTransactionNotFound):
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "TRANSACTION_NOT_FOUND", "message": err.Error()}})
		case errors.Is(err, repository.ErrTransactionNotReturned):
			c.JSON(http.StatusConflict, gin.H{"success": false, "error": gin.H{"code": "TRANSACTION_NOT_RETURNED", "message": err.Error()}})
		case errors.Is(err, repository.ErrNotPartOfTransaction):
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": gin.H{"code": "FORBIDDEN", "message": err.Error()}})
		case errors.Is(err, repository.ErrReviewAlreadyExists):
			c.JSON(http.StatusConflict, gin.H{"success": false, "error": gin.H{"code": "REVIEW_ALREADY_EXISTS", "message": err.Error()}})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": gin.H{"code": "INTERNAL_SERVER_ERROR", "message": "Gagal menyimpan ulasan"}})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    gin.H{"review_id": reviewID},
	})
}
