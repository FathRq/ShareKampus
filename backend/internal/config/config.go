package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config menampung semua nilai rahasia/pengaturan yang dibaca dari file .env
type Config struct {
	SupabaseURL            string
	SupabasePublishableKey string
	SupabaseSecretKey      string
	SupabaseJWKSURL        string
	DatabaseURL            string
	Port                   string
}

// Load membaca file .env, lalu mengembalikan struct Config yang sudah terisi
func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("Tidak menemukan file .env, lanjut pakai environment variable sistem")
	}

	cfg := &Config{
		SupabaseURL:            os.Getenv("SUPABASE_URL"),
		SupabasePublishableKey: os.Getenv("SUPABASE_PUBLISHABLE_KEY"),
		SupabaseSecretKey:      os.Getenv("SUPABASE_SECRET_KEY"),
		SupabaseJWKSURL:        os.Getenv("SUPABASE_JWKS_URL"),
		DatabaseURL:            os.Getenv("DATABASE_URL"),
		Port:                   os.Getenv("PORT"),
	}

	if cfg.Port == "" {
		cfg.Port = "8080"
	}

	return cfg
}
