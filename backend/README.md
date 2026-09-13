# ShareKampus — Backend

REST API untuk ShareKampus, dibangun dengan **Golang + Gin Framework**.

> Dokumentasi lengkap proyek (fitur, arsitektur, cara install semua bagian) ada di [README.md root](../README.md). Dokumen ini cuma fokus ke bagian backend.

## Struktur Folder

```
backend/
├── cmd/api/main.go          # Entry point, wiring semua layer & rute
├── internal/
│   ├── config/              # Load environment variables
│   ├── handler/              # HTTP handler (terima request, kirim response)
│   ├── middleware/           # Auth middleware (verifikasi JWT via JWKS)
│   ├── repository/           # Query database (pgx)
│   └── service/              # Logika bisnis & validasi
├── Dockerfile                # Multi-stage build untuk deployment
└── go.mod
```

Pola yang dipakai konsisten: **handler → service → repository**, kecuali beberapa endpoint sederhana (misal `users/me`, `stats/expense-saver`) yang langsung **handler → repository** karena tidak ada logika bisnis tambahan.

## Menjalankan Secara Lokal

### Prasyarat
- Go 1.25+
- Akses ke instance Supabase (PostgreSQL + PostGIS + Auth)

### Langkah

1. Buat file `.env` di folder ini:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxx
SUPABASE_JWKS_URL=https://xxxxx.supabase.co/auth/v1/.well-known/jwks.json
DATABASE_URL=postgresql://user:password@host:6543/postgres
PORT=8080
```

> **Penting:** `DATABASE_URL` wajib pakai **Session Pooler** Supabase (port `6543`), bukan direct connection — direct connection cuma resolve ke IPv6 yang sering bermasalah di jaringan Indonesia.

2. Jalankan:
```bash
go mod download
go run cmd/api/main.go
```

3. Cek:
```bash
curl http://localhost:8080/health
```

### Menjalankan via Docker

```bash
docker build -t sharekampus-backend .
docker run --env-file .env -p 8080:8080 sharekampus-backend
```

## Skema Database

Jalankan [`../note/ERD.sql`](../note/ERD.sql) di Supabase SQL Editor untuk membuat seluruh tabel dan fungsi PostGIS yang dibutuhkan (`get_nearby_items`, `recalculate_trust_score`, `get_trust_score_breakdown`, `get_expense_saver_total`).

## Dokumentasi API

Lihat [`../FRONTEND_GUIDE.md`](../FRONTEND_GUIDE.md) untuk daftar lengkap endpoint, format request/response, dan kode error.