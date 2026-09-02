package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// contextKey adalah tipe khusus untuk key context, supaya gak "bentrok"
// dengan key context milik library lain
type contextKey string

const UserIDContextKey contextKey = "user_id"

// AuthMiddleware bertugas mengecek token JWT di header Authorization.
// Kalau valid, user_id-nya disimpan di context supaya bisa dipakai handler berikutnya.
func AuthMiddleware(jwksURL string) gin.HandlerFunc {
	// Ambil & cache kunci publik Supabase sekali di awal, dipakai berulang
	// untuk verifikasi token tiap request (keyfunc otomatis refresh kalau kadaluarsa)
	k, err := keyfunc.NewDefaultCtx(context.Background(), []string{jwksURL})
	if err != nil {
		panic("gagal mengambil JWKS dari Supabase: " + err.Error())
	}

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": "Token akses tidak ditemukan, silakan login terlebih dahulu",
				},
			})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, k.Keyfunc)
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": "Token akses tidak valid atau telah kedaluwarsa",
				},
			})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": "Token akses tidak valid",
				},
			})
			c.Abort()
			return
		}

		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": "Token akses tidak valid",
				},
			})
			c.Abort()
			return
		}

		// Simpan user_id supaya bisa diambil handler berikutnya lewat c.Get(...)
		c.Set(string(UserIDContextKey), userID)

		c.Next()
	}
}
