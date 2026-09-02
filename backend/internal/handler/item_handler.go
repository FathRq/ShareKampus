package handler

import (
	"errors"
	"net/http"

	"github.com/FathRq/ShareKampus/backend/internal/middleware"
	"github.com/FathRq/ShareKampus/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type ItemHandler struct {
	itemService *service.ItemService
}

func NewItemHandler(itemService *service.ItemService) *ItemHandler {
	return &ItemHandler{itemService: itemService}
}

// createItemRequest merepresentasikan bentuk JSON yang dikirim frontend untuk membuat listing
type createItemRequest struct {
	Title           string  `json:"title" binding:"required"`
	Description     string  `json:"description"`
	Category        string  `json:"category" binding:"required"`
	TransactionType string  `json:"transaction_type" binding:"required"`
	MarketPrice     float64 `json:"market_price" binding:"required,gte=0"`
	PhotoURL        string  `json:"photo_url"`
	Latitude        float64 `json:"latitude" binding:"required"`
	Longitude       float64 `json:"longitude" binding:"required"`
	MaxLoanDays     int     `json:"max_loan_days"`
}

// Create menangani POST /items
func (h *ItemHandler) Create(c *gin.Context) {
	var req createItemRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "VALIDATION_ERROR",
				"message": err.Error(),
			},
		})
		return
	}

	// Ambil user_id dari token (dititip AuthMiddleware) -- inilah pemilik barangnya
	ownerID, _ := c.Get(string(middleware.UserIDContextKey))

	itemID, err := h.itemService.CreateItem(c.Request.Context(), service.CreateItemInput{
		OwnerID:         ownerID.(string),
		Title:           req.Title,
		Description:     req.Description,
		Category:        req.Category,
		TransactionType: req.TransactionType,
		MarketPrice:     req.MarketPrice,
		PhotoURL:        req.PhotoURL,
		Latitude:        req.Latitude,
		Longitude:       req.Longitude,
		MaxLoanDays:     req.MaxLoanDays,
	})

	if err != nil {
		if errors.Is(err, service.ErrInvalidCategory) || errors.Is(err, service.ErrInvalidTransactionType) {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "VALIDATION_ERROR",
					"message": err.Error(),
				},
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_SERVER_ERROR",
				"message": "Gagal membuat listing barang, silakan coba lagi",
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data": gin.H{
			"item_id": itemID,
		},
	})
}
