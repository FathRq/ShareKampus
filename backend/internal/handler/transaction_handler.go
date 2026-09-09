package handler

import (
	"errors"
	"net/http"
	"time"

	"github.com/FathRq/ShareKampus/backend/internal/middleware"
	"github.com/FathRq/ShareKampus/backend/internal/repository"
	"github.com/FathRq/ShareKampus/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type TransactionHandler struct {
	transactionService *service.TransactionService
}

func NewTransactionHandler(transactionService *service.TransactionService) *TransactionHandler {
	return &TransactionHandler{transactionService: transactionService}
}

type createTransactionRequest struct {
	ItemID             string   `json:"item_id" binding:"required"`
	MeetingScheduledAt *string  `json:"meeting_scheduled_at"` // format ISO8601, contoh: "2026-09-15T14:00:00+07:00"
	MeetingLatitude    *float64 `json:"meeting_latitude"`
	MeetingLongitude   *float64 `json:"meeting_longitude"`
	Notes              *string  `json:"notes"`
}

// Create menangani POST /transactions
func (h *TransactionHandler) Create(c *gin.Context) {
	var req createTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   gin.H{"code": "VALIDATION_ERROR", "message": err.Error()},
		})
		return
	}

	var meetingTime *time.Time
	if req.MeetingScheduledAt != nil {
		parsed, err := time.Parse(time.RFC3339, *req.MeetingScheduledAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "VALIDATION_ERROR",
					"message": "Format meeting_scheduled_at tidak valid, gunakan format ISO8601 (contoh: 2026-09-15T14:00:00+07:00)",
				},
			})
			return
		}
		meetingTime = &parsed
	}

	borrowerID, _ := c.Get(string(middleware.UserIDContextKey))

	transactionID, err := h.transactionService.CreateTransaction(c.Request.Context(), service.CreateTransactionInput{
		ItemID:             req.ItemID,
		BorrowerID:         borrowerID.(string),
		MeetingScheduledAt: meetingTime,
		MeetingLatitude:    req.MeetingLatitude,
		MeetingLongitude:   req.MeetingLongitude,
		Notes:              req.Notes,
	})

	if err != nil {
		switch {
		case errors.Is(err, repository.ErrItemNotFound):
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "ITEM_NOT_FOUND", "message": err.Error()}})
		case errors.Is(err, repository.ErrItemNotAvailable):
			c.JSON(http.StatusConflict, gin.H{"success": false, "error": gin.H{"code": "ITEM_NOT_AVAILABLE", "message": err.Error()}})
		case errors.Is(err, repository.ErrCannotBorrowOwnItem):
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": gin.H{"code": "INTERNAL_SERVER_ERROR", "message": "Gagal membuat permintaan transaksi, silakan coba lagi"}})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    gin.H{"transaction_id": transactionID},
	})
}

type updateTransactionStatusRequest struct {
	Status             string   `json:"status" binding:"required"`
	MeetingScheduledAt *string  `json:"meeting_scheduled_at"` // opsional, cuma dipakai saat status: "active"
	MeetingLatitude    *float64 `json:"meeting_latitude"`
	MeetingLongitude   *float64 `json:"meeting_longitude"`
}

// UpdateStatus menangani PATCH /transactions/:id/status
func (h *TransactionHandler) UpdateStatus(c *gin.Context) {
	transactionID := c.Param("id")

	var req updateTransactionStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   gin.H{"code": "VALIDATION_ERROR", "message": err.Error()},
		})
		return
	}

	var meetingTime *time.Time
	if req.MeetingScheduledAt != nil {
		parsed, err := time.Parse(time.RFC3339, *req.MeetingScheduledAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "VALIDATION_ERROR",
					"message": "Format meeting_scheduled_at tidak valid, gunakan format ISO8601 (contoh: 2026-09-15T14:00:00+07:00)",
				},
			})
			return
		}
		meetingTime = &parsed
	}

	requesterID, _ := c.Get(string(middleware.UserIDContextKey))

	err := h.transactionService.UpdateStatus(c.Request.Context(), service.UpdateStatusInput{
		TransactionID:      transactionID,
		RequesterID:        requesterID.(string),
		NewStatus:          req.Status,
		MeetingScheduledAt: meetingTime,
		MeetingLatitude:    req.MeetingLatitude,
		MeetingLongitude:   req.MeetingLongitude,
	})

	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidStatusValue):
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		case errors.Is(err, repository.ErrTransactionNotFound):
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "TRANSACTION_NOT_FOUND", "message": err.Error()}})
		case errors.Is(err, repository.ErrInvalidStatusTransition):
			c.JSON(http.StatusConflict, gin.H{"success": false, "error": gin.H{"code": "INVALID_TRANSITION", "message": err.Error()}})
		case errors.Is(err, repository.ErrNotAuthorizedForAction):
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": gin.H{"code": "FORBIDDEN", "message": err.Error()}})
		case errors.Is(err, repository.ErrItemNotAvailable):
			c.JSON(http.StatusConflict, gin.H{"success": false, "error": gin.H{"code": "ITEM_NOT_AVAILABLE", "message": err.Error()}})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": gin.H{"code": "INTERNAL_SERVER_ERROR", "message": "Gagal memperbarui status transaksi"}})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    gin.H{"message": "Status transaksi berhasil diperbarui"},
	})
}
