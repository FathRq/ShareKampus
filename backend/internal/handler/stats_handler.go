package handler

import (
	"net/http"

	"github.com/FathRq/ShareKampus/backend/internal/repository"
	"github.com/gin-gonic/gin"
)

type StatsHandler struct {
	statsRepo *repository.StatsRepository
}

func NewStatsHandler(statsRepo *repository.StatsRepository) *StatsHandler {
	return &StatsHandler{statsRepo: statsRepo}
}

// ExpenseSaver menangani GET /stats/expense-saver
func (h *StatsHandler) ExpenseSaver(c *gin.Context) {
	stats, err := h.statsRepo.GetExpenseSaver(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_SERVER_ERROR",
				"message": "Gagal mengambil statistik penghematan",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}
