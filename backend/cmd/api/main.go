package main

import (
	"context"
	"log"
	"net/http"

	"github.com/FathRq/ShareKampus/backend/internal/config"
	"github.com/FathRq/ShareKampus/backend/internal/handler"
	"github.com/FathRq/ShareKampus/backend/internal/repository"
	"github.com/FathRq/ShareKampus/backend/internal/service"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	pool, err := repository.NewPostgresPool(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Tidak bisa konek ke database: %v", err)
	}
	defer pool.Close()

	log.Println("Berhasil konek ke database Supabase!")

	// --- Repository layer ---
	campusLocationRepo := repository.NewCampusLocationRepository(pool)
	campusRepo := repository.NewCampusRepository(pool)
	userRepo := repository.NewUserRepository(pool)
	authClient := repository.NewSupabaseAuthClient(cfg.SupabaseURL, cfg.SupabasePublishableKey)

	// --- Service layer ---
	authService := service.NewAuthService(campusRepo, userRepo, authClient)

	// --- Handler layer ---
	campusLocationHandler := handler.NewCampusLocationHandler(campusLocationRepo)
	authHandler := handler.NewAuthHandler(authService)

	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		dbErr := pool.Ping(context.Background())
		dbStatus := "connected"
		if dbErr != nil {
			dbStatus = "disconnected"
		}

		c.JSON(http.StatusOK, gin.H{
			"success":  true,
			"message":  "ShareKampus backend hidup!",
			"database": dbStatus,
		})
	})

	router.GET("/campus-locations", campusLocationHandler.ListLocations)
	router.POST("/auth/register", authHandler.Register)

	router.Run(":" + cfg.Port)
}
