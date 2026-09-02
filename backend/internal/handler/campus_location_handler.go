package handler

import (
	"net/http"

	"github.com/FathRq/ShareKampus/backend/internal/repository"
	"github.com/gin-gonic/gin"
)

type CampusLocationHandler struct {
	repo *repository.CampusLocationRepository
}

func NewCampusLocationHandler(repo *repository.CampusLocationRepository) *CampusLocationHandler {
	return &CampusLocationHandler{repo: repo}
}

// ListLocations menangani GET /campus-locations
func (h *CampusLocationHandler) ListLocations(c *gin.Context) {
	locations, err := h.repo.ListAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_SERVER_ERROR",
				"message": "Gagal mengambil data lokasi kampus",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"locations": locations,
		},
	})
}
