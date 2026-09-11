package main

import (
	"context"
	"github.com/FathRq/ShareKampus/backend/internal/config"
	"github.com/FathRq/ShareKampus/backend/internal/handler"
	"github.com/FathRq/ShareKampus/backend/internal/middleware"
	"github.com/FathRq/ShareKampus/backend/internal/repository"
	"github.com/FathRq/ShareKampus/backend/internal/service"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"time"
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
	statsRepo := repository.NewStatsRepository(pool)

	// --- Service layer ---
	authService := service.NewAuthService(campusRepo, userRepo, authClient)
	itemService := service.NewItemService(itemRepo)
	transactionService := service.NewTransactionService(transactionRepo)
	reviewService := service.NewReviewService(reviewRepo)
	statsHandler := handler.NewStatsHandler(statsRepo)

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

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // sementara buat development, nanti dipersempit saat deploy
		AllowMethods:     []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

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
	router.GET("/users/:id/trust-score", userHandler.TrustScore)
	router.GET("/stats/expense-saver", statsHandler.ExpenseSaver)
	router.GET("/transactions", requireAuth, transactionHandler.List)
	router.GET("/transactions/:id", requireAuth, transactionHandler.GetDetail)

	router.Run(":" + cfg.Port)
}
