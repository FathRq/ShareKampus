package handler

import (
	"net/http"

	"github.com/FathRq/ShareKampus/backend/internal/middleware"
	"github.com/FathRq/ShareKampus/backend/internal/repository"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userRepo *repository.UserRepository
}

func NewUserHandler(userRepo *repository.UserRepository) *UserHandler {
	return &UserHandler{userRepo: userRepo}
}

// Me menangani GET /users/me -- mengembalikan profil user yang sedang login
func (h *UserHandler) Me(c *gin.Context) {
	// Ambil user_id yang sudah "dititip" oleh AuthMiddleware sebelumnya
	userID, exists := c.Get(string(middleware.UserIDContextKey))
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "UNAUTHORIZED",
				"message": "Token akses tidak valid",
			},
		})
		return
	}

	profile, err := h.userRepo.GetByID(c.Request.Context(), userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "USER_NOT_FOUND",
				"message": "Profil pengguna tidak ditemukan",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    profile,
	})
}

// TrustScore menangani GET /users/:id/trust-score
func (h *UserHandler) TrustScore(c *gin.Context) {
	userID := c.Param("id")

	breakdown, err := h.userRepo.GetTrustScoreBreakdown(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "USER_NOT_FOUND",
				"message": "Pengguna tidak ditemukan",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    breakdown,
	})
}
