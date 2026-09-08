package main

import (
	"context"
	"log"
	"net/http"

	"github.com/FathRq/ShareKampus/backend/internal/config"
	"github.com/FathRq/ShareKampus/backend/internal/handler"
	"github.com/FathRq/ShareKampus/backend/internal/middleware"
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
	itemRepo := repository.NewItemRepository(pool)
	authClient := repository.NewSupabaseAuthClient(cfg.SupabaseURL, cfg.SupabasePublishableKey)
	transactionRepo := repository.NewTransactionRepository(pool)
	reviewRepo := repository.NewReviewRepository(pool)

	// --- Service layer ---
	authService := service.NewAuthService(campusRepo, userRepo, authClient)
	itemService := service.NewItemService(itemRepo)
	transactionService := service.NewTransactionService(transactionRepo)
	reviewService := service.NewReviewService(reviewRepo)

	// --- Handler layer ---
	campusLocationHandler := handler.NewCampusLocationHandler(campusLocationRepo)
	authHandler := handler.NewAuthHandler(authService)
	userHandler := handler.NewUserHandler(userRepo)
	itemHandler := handler.NewItemHandler(itemService)
	transactionHandler := handler.NewTransactionHandler(transactionService)
	reviewHandler := handler.NewReviewHandler(reviewService)

	// --- Middleware ---
	requireAuth := middleware.AuthMiddleware(cfg.SupabaseJWKSURL)

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

	// Rute publik (tidak butuh login)
	router.GET("/campus-locations", campusLocationHandler.ListLocations)
	router.POST("/auth/register", authHandler.Register)
	router.POST("/auth/login", authHandler.Login)
	router.GET("/items/nearby", itemHandler.FindNearby)

	// Rute privat (WAJIB login -- middleware requireAuth dipasang sebagai parameter tambahan)
	router.GET("/users/me", requireAuth, userHandler.Me)
	router.POST("/items", requireAuth, itemHandler.Create)
	router.POST("/transactions", requireAuth, transactionHandler.Create)
	router.PATCH("/transactions/:id/status", requireAuth, transactionHandler.UpdateStatus)
	router.DELETE("/items/:id", requireAuth, itemHandler.Delete)
	router.POST("/reviews", requireAuth, reviewHandler.Create)

	router.Run(":" + cfg.Port)
}
