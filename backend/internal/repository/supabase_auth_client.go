package repository

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
)

// SupabaseAuthClient adalah "jembatan" antara backend Go kita dengan Supabase Auth API.
// Semua request signup/login sebenarnya diteruskan ke sini di balik layar.
type SupabaseAuthClient struct {
	baseURL        string
	publishableKey string
	httpClient     *http.Client
}

// ErrEmailAlreadyRegistered dikembalikan kalau email sudah pernah dipakai daftar sebelumnya
var ErrEmailAlreadyRegistered = errors.New("email sudah terdaftar")

func NewSupabaseAuthClient(baseURL, publishableKey string) *SupabaseAuthClient {
	return &SupabaseAuthClient{
		baseURL:        baseURL,
		publishableKey: publishableKey,
		httpClient:     &http.Client{},
	}
}

// SignUpResponse menampung bagian penting dari balasan Supabase Auth setelah signup berhasil
type SignUpResponse struct {
	UserID      string `json:"id"`
	Email       string `json:"email"`
	AccessToken string `json:"-"` // diisi manual, bukan dari body ini (lihat penjelasan di service)
}

// signUpRawResponse merepresentasikan bentuk asli JSON balasan Supabase (lebih lengkap dari yang kita butuh)
type signUpRawResponse struct {
	AccessToken string `json:"access_token"`
	User        struct {
		ID    string `json:"id"`
		Email string `json:"email"`
	} `json:"user"`
}

// SignUp mengirim request signup ke Supabase Auth REST API
func (c *SupabaseAuthClient) SignUp(email, password string) (*SignUpResponse, error) {
	payload, _ := json.Marshal(map[string]string{
		"email":    email,
		"password": password,
	})

	url := fmt.Sprintf("%s/auth/v1/signup", c.baseURL)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", c.publishableKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		var errResp struct {
			ErrorCode string `json:"error_code"`
		}
		if json.Unmarshal(body, &errResp) == nil && errResp.ErrorCode == "user_already_exists" {
			return nil, ErrEmailAlreadyRegistered
		}
		return nil, fmt.Errorf("supabase signup gagal (status %d): %s", resp.StatusCode, string(body))
	}

	var raw signUpRawResponse
	if err := json.Unmarshal(body, &raw); err != nil {
		return nil, fmt.Errorf("gagal membaca response supabase: %w", err)
	}

	return &SignUpResponse{
		UserID:      raw.User.ID,
		Email:       raw.User.Email,
		AccessToken: raw.AccessToken,
	}, nil
}

// ErrInvalidCredentials dikembalikan kalau email/password salah
var ErrInvalidCredentials = errors.New("email atau password salah")

// SignIn mengirim request login ke Supabase Auth REST API
func (c *SupabaseAuthClient) SignIn(email, password string) (*SignUpResponse, error) {
	payload, _ := json.Marshal(map[string]string{
		"email":    email,
		"password": password,
	})

	url := fmt.Sprintf("%s/auth/v1/token?grant_type=password", c.baseURL)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", c.publishableKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		var errResp struct {
			ErrorCode string `json:"error_code"`
		}
		if json.Unmarshal(body, &errResp) == nil && errResp.ErrorCode == "invalid_credentials" {
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("supabase signin gagal (status %d): %s", resp.StatusCode, string(body))
	}

	var raw signUpRawResponse
	if err := json.Unmarshal(body, &raw); err != nil {
		return nil, fmt.Errorf("gagal membaca response supabase: %w", err)
	}

	return &SignUpResponse{
		UserID:      raw.User.ID,
		Email:       raw.User.Email,
		AccessToken: raw.AccessToken,
	}, nil
}
