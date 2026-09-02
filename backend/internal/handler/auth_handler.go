package handler

import (
	"errors"
	"github.com/FathRq/ShareKampus/backend/internal/repository"
	"github.com/FathRq/ShareKampus/backend/internal/service"
	"github.com/gin-gonic/gin"
	"net/http"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// registerRequest merepresentasikan bentuk JSON yang dikirim frontend,
// sesuai yang sudah kita tulis di API_CONTRACT.md
type registerRequest struct {
	FullName         string `json:"full_name" binding:"required"`
	Email            string `json:"email" binding:"required,email"`
	Password         string `json:"password" binding:"required,min=8"`
	CampusLocationID string `json:"campus_location_id" binding:"required"`
}

// Register menangani POST /auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest

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

	result, err := h.authService.Register(c.Request.Context(), service.RegisterInput{
		FullName:         req.FullName,
		Email:            req.Email,
		Password:         req.Password,
		CampusLocationID: req.CampusLocationID,
	})

	if err != nil {

		if errors.Is(err, service.ErrInvalidCampusEmail) {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "INVALID_CAMPUS_EMAIL",
					"message": "Email harus menggunakan domain kampus resmi terdaftar (contoh: @mhs.unesa.ac.id)",
				},
			})
			return
		}

		if errors.Is(err, repository.ErrEmailAlreadyRegistered) {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "EMAIL_ALREADY_REGISTERED",
					"message": "Email ini sudah terdaftar, silakan login atau gunakan email lain",
				},
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_SERVER_ERROR",
				"message": "Terjadi kesalahan saat mendaftar, silakan coba lagi",
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data": gin.H{
			"user_id": result.UserID,
			"email":   result.Email,
			"token":   result.AccessToken,
		},
	})
}

// loginRequest merepresentasikan bentuk JSON yang dikirim frontend untuk login
type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Login menangani POST /auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest

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

	result, err := h.authService.Login(c.Request.Context(), service.LoginInput{
		Email:    req.Email,
		Password: req.Password,
	})

	if err != nil {
		if errors.Is(err, repository.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "INVALID_CREDENTIALS",
					"message": "Email atau kata sandi salah",
				},
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_SERVER_ERROR",
				"message": "Terjadi kesalahan saat login, silakan coba lagi",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user_id": result.UserID,
			"email":   result.Email,
			"token":   result.AccessToken,
		},
	})
}
