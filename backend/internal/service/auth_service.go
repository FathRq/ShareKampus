package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/FathRq/ShareKampus/backend/internal/repository"
)

// ErrInvalidCampusEmail dikembalikan kalau domain email tidak cocok kampus manapun
var ErrInvalidCampusEmail = errors.New("email harus menggunakan domain kampus resmi yang terdaftar")

// RegisterInput menampung data yang dibutuhkan untuk mendaftar
type RegisterInput struct {
	FullName         string
	Email            string
	Password         string
	CampusLocationID string
}

// RegisterOutput adalah hasil setelah registrasi berhasil
type RegisterOutput struct {
	UserID      string
	Email       string
	AccessToken string
}

type AuthService struct {
	campusRepo *repository.CampusRepository
	userRepo   *repository.UserRepository
	authClient *repository.SupabaseAuthClient
}

func NewAuthService(
	campusRepo *repository.CampusRepository,
	userRepo *repository.UserRepository,
	authClient *repository.SupabaseAuthClient,
) *AuthService {
	return &AuthService{
		campusRepo: campusRepo,
		userRepo:   userRepo,
		authClient: authClient,
	}
}

// Register menjalankan seluruh alur pendaftaran, langkah demi langkah
func (s *AuthService) Register(ctx context.Context, input RegisterInput) (*RegisterOutput, error) {
	// 1. Ambil domain dari email (contoh: "dian@mhs.unesa.ac.id" -> "mhs.unesa.ac.id")
	parts := strings.Split(input.Email, "@")
	if len(parts) != 2 {
		return nil, ErrInvalidCampusEmail
	}
	domain := parts[1]

	// 2. Cek domain itu terdaftar sebagai kampus resmi di database kita
	campus, err := s.campusRepo.FindByEmailDomain(ctx, domain)
	if err != nil {
		if errors.Is(err, repository.ErrCampusNotFound) {
			return nil, ErrInvalidCampusEmail
		}
		return nil, err
	}

	// 3. Baru daftarkan akunnya ke Supabase Auth (di sinilah password di-hash dengan aman)
	signUpResp, err := s.authClient.SignUp(input.Email, input.Password)
	if err != nil {
		return nil, fmt.Errorf("gagal mendaftar ke supabase auth: %w", err)
	}

	// 4. Setelah akun Auth berhasil dibuat, simpan profilnya ke tabel users kita
	//    (pakai ID yang SAMA PERSIS dengan yang baru dibuat Supabase Auth)
	err = s.userRepo.CreateProfile(ctx, signUpResp.UserID, campus.ID, input.CampusLocationID, input.FullName, input.Email)
	if err != nil {
		return nil, fmt.Errorf("gagal menyimpan profil user: %w", err)
	}

	return &RegisterOutput{
		UserID:      signUpResp.UserID,
		Email:       signUpResp.Email,
		AccessToken: signUpResp.AccessToken,
	}, nil
}

// LoginInput menampung data yang dibutuhkan untuk login
type LoginInput struct {
	Email    string
	Password string
}

// LoginOutput adalah hasil setelah login berhasil
type LoginOutput struct {
	UserID      string
	Email       string
	AccessToken string
}

// Login memverifikasi email+password lewat Supabase Auth
func (s *AuthService) Login(ctx context.Context, input LoginInput) (*LoginOutput, error) {
	signInResp, err := s.authClient.SignIn(input.Email, input.Password)
	if err != nil {
		return nil, err
	}

	return &LoginOutput{
		UserID:      signInResp.UserID,
		Email:       signInResp.Email,
		AccessToken: signInResp.AccessToken,
	}, nil
}
