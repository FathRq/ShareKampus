package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/FathRq/ShareKampus/backend/internal/middleware"
	"github.com/FathRq/ShareKampus/backend/internal/repository"
	"github.com/FathRq/ShareKampus/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type ItemHandler struct {
	itemService *service.ItemService
}

func NewItemHandler(itemService *service.ItemService) *ItemHandler {
	return &ItemHandler{itemService: itemService}
}

type createItemRequest struct {
	Title           string   `json:"title" binding:"required"`
	Description     string   `json:"description"`
	Category        string   `json:"category" binding:"required"`
	TransactionType string   `json:"transaction_type" binding:"required"`
	MarketPrice     float64  `json:"market_price" binding:"required,gte=0"`
	PhotoURLs       []string `json:"photo_urls"`
	Latitude        float64  `json:"latitude" binding:"required"`
	Longitude       float64  `json:"longitude" binding:"required"`
	MaxLoanDays     int      `json:"max_loan_days"`
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

	ownerID, _ := c.Get(string(middleware.UserIDContextKey))

	itemID, err := h.itemService.CreateItem(c.Request.Context(), service.CreateItemInput{
		OwnerID:         ownerID.(string),
		Title:           req.Title,
		Description:     req.Description,
		Category:        req.Category,
		TransactionType: req.TransactionType,
		MarketPrice:     req.MarketPrice,
		PhotoURLs:       req.PhotoURLs,
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

// FindNearby menangani GET /items/nearby
func (h *ItemHandler) FindNearby(c *gin.Context) {
	lat, err := strconv.ParseFloat(c.Query("lat"), 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "VALIDATION_ERROR",
				"message": "Parameter 'lat' wajib diisi dan harus berupa angka",
			},
		})
		return
	}

	lng, err := strconv.ParseFloat(c.Query("lng"), 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "VALIDATION_ERROR",
				"message": "Parameter 'lng' wajib diisi dan harus berupa angka",
			},
		})
		return
	}

	radius, _ := strconv.Atoi(c.Query("radius"))

	var category *string
	if val := c.Query("category"); val != "" {
		category = &val
	}

	var searchQuery *string
	if val := c.Query("q"); val != "" {
		searchQuery = &val
	}

	items, err := h.itemService.FindNearby(c.Request.Context(), service.FindNearbyInput{
		Latitude:    lat,
		Longitude:   lng,
		RadiusMeter: radius,
		Category:    category,
		SearchQuery: searchQuery,
	})

	if err != nil {
		if errors.Is(err, service.ErrInvalidCategory) {
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
				"message": "Gagal mengambil daftar barang terdekat",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    items,
	})
}

// Delete menangani DELETE /items/:id
func (h *ItemHandler) Delete(c *gin.Context) {
	itemID := c.Param("id")
	requesterID, _ := c.Get(string(middleware.UserIDContextKey))

	action, err := h.itemService.DeleteItem(c.Request.Context(), itemID, requesterID.(string))

	if err != nil {
		switch {
		case errors.Is(err, repository.ErrItemNotFound):
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "ITEM_NOT_FOUND", "message": err.Error()}})
		case errors.Is(err, repository.ErrNotAuthorizedForAction):
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": gin.H{"code": "FORBIDDEN", "message": err.Error()}})
		case errors.Is(err, repository.ErrItemCurrentlyOnLoan):
			c.JSON(http.StatusConflict, gin.H{"success": false, "error": gin.H{"code": "ITEM_ON_LOAN", "message": err.Error()}})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": gin.H{"code": "INTERNAL_SERVER_ERROR", "message": "Gagal menghapus barang"}})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"action": action,
		},
	})
}
