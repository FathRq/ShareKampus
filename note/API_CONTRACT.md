# API_CONTRACT.md — RESTful API Specification
## ShareKampus Backend API (Golang — Gin/Fiber)

**Base URL (dev):** `https://sharekampus-api.onrender.com/api/v1`
**Format:** JSON | **Auth:** Bearer JWT (kecuali endpoint publik yang ditandai)

---

## 0. Konvensi Umum

### Format Error Response (Standar di Seluruh Endpoint)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CAMPUS_EMAIL",
    "message": "Email harus menggunakan domain kampus resmi (contoh: nama@unesa.ac.id)"
  }
}
```

### Format Success Response (Standar)
```json
{
  "success": true,
  "data": { }
}
```

### HTTP Status Code yang Dipakai
| Code | Arti |
|------|------|
| 200 | OK — request berhasil (GET/PUT/PATCH) |
| 201 | Created — resource baru berhasil dibuat (POST) |
| 400 | Bad Request — validasi input gagal |
| 401 | Unauthorized — token tidak valid/kosong |
| 403 | Forbidden — tidak punya akses ke resource |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 1. Auth — Cek & Registrasi Email Kampus

### `POST /auth/register`
**Deskripsi:** Registrasi mahasiswa baru dengan validasi domain email kampus.
**Auth:** Publik (tidak perlu token)

**Request Header:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "full_name": "Dian Pratama",
  "email": "dian.pratama@unesa.ac.id",
  "password": "SecurePass123!",
  "campus_id": "b1a2c3d4-0000-0000-0000-000000000001"
}
```

**Response 201 (Success):**
```json
{
  "success": true,
  "data": {
    "user_id": "9f8e7d6c-0000-0000-0000-000000000002",
    "full_name": "Dian Pratama",
    "email": "dian.pratama@unesa.ac.id",
    "trust_score": 50.00,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response 400 (Domain Tidak Valid):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CAMPUS_EMAIL",
    "message": "Email harus menggunakan domain kampus resmi terdaftar (contoh: @unesa.ac.id)"
  }
}
```

---

### `POST /auth/login`
**Deskripsi:** Login mahasiswa terdaftar.
**Auth:** Publik

**Request Body:**
```json
{
  "email": "dian.pratama@unesa.ac.id",
  "password": "SecurePass123!"
}
```

**Response 200 (Success):**
```json
{
  "success": true,
  "data": {
    "user_id": "9f8e7d6c-0000-0000-0000-000000000002",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

**Response 401 (Kredensial Salah):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email atau kata sandi salah"
  }
}
```

---

## 2. Items — Get Nearby Items (Geofencing)

### `GET /items/nearby`
**Deskripsi:** Mengambil katalog barang dalam radius tertentu dari lokasi pengguna, memanggil `get_nearby_items()` di database (lihat `ERD.sql`).
**Auth:** Bearer token wajib

**Request Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Params:**
| Param | Tipe | Wajib | Default | Keterangan |
|-------|------|-------|---------|------------|
| `lat` | float | ya | — | Latitude lokasi pengguna |
| `lng` | float | ya | — | Longitude lokasi pengguna |
| `radius` | int (meter) | tidak | 2500 | Radius pencarian |
| `category` | string | tidak | null | `buku` \| `alat_lab` \| `elektronik` \| `lainnya` |

**Contoh Request:**
```
GET /items/nearby?lat=-7.2814&lng=112.7211&radius=2500&category=alat_lab
```

**Response 200 (Success):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "item_id": "c1d2e3f4-0000-0000-0000-000000000010",
        "title": "Jas Laboratorium Kimia Ukuran M",
        "category": "alat_lab",
        "transaction_type": "pinjam",
        "market_price": 150000,
        "photo_url": "https://cdn.sharekampus.app/items/jas-lab-01.jpg",
        "status": "available",
        "owner": {
          "id": "9f8e7d6c-0000-0000-0000-000000000002",
          "name": "Bagas Wirawan",
          "trust_score": 87.50
        },
        "distance_meter": 640.2
      }
    ],
    "total": 1
  }
}
```

**Response 400 (Parameter Tidak Lengkap):**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_COORDINATES",
    "message": "Parameter lat dan lng wajib disertakan"
  }
}
```

---

## 3. Transactions — Create Transaction (Pinjam/Barter)

### `POST /transactions`
**Deskripsi:** Mengajukan transaksi pinjam atau barter atas sebuah item.
**Auth:** Bearer token wajib

**Request Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "item_id": "c1d2e3f4-0000-0000-0000-000000000010",
  "agreed_return_date": "2026-09-15",
  "meeting_point": {
    "lat": -7.2810,
    "lng": 112.7205
  },
  "notes": "Bisa ambil di gerbang kampus jam 15.00"
}
```

**Response 201 (Success):**
```json
{
  "success": true,
  "data": {
    "transaction_id": "e5f6a7b8-0000-0000-0000-000000000020",
    "item_id": "c1d2e3f4-0000-0000-0000-000000000010",
    "borrower_id": "9f8e7d6c-0000-0000-0000-000000000002",
    "lender_id": "1a2b3c4d-0000-0000-0000-000000000003",
    "status": "pending",
    "agreed_return_date": "2026-09-15",
    "created_at": "2026-08-28T10:00:00Z"
  }
}
```

**Response 400 (Item Tidak Tersedia):**
```json
{
  "success": false,
  "error": {
    "code": "ITEM_NOT_AVAILABLE",
    "message": "Barang ini sedang dalam transaksi lain"
  }
}
```

**Response 401 (Tidak Terautentikasi):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token akses tidak valid atau telah kedaluwarsa"
  }
}
```

---

### `PATCH /transactions/:id/status`
**Deskripsi:** Mengubah status transaksi (konfirmasi oleh pemilik, penyelesaian pengembalian, dsb).
**Auth:** Bearer token wajib (hanya pihak terkait — `borrower_id` atau `lender_id` — yang berwenang)

**Request Body:**
```json
{
  "status": "returned"
}
```

**Response 200 (Success):**
```json
{
  "success": true,
  "data": {
    "transaction_id": "e5f6a7b8-0000-0000-0000-000000000020",
    "status": "returned",
    "returned_at": "2026-09-14T09:30:00Z"
  }
}
```

**Response 403 (Bukan Pihak Terkait):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN_TRANSACTION_ACCESS",
    "message": "Anda tidak memiliki akses untuk mengubah status transaksi ini"
  }
}
```

---

## 4. Users — Get User Trust Score

### `GET /users/:id/trust-score`
**Deskripsi:** Mengambil detail Trust Score seorang pengguna beserta komponen pembentuknya (untuk transparansi di halaman profil).
**Auth:** Bearer token wajib

**Contoh Request:**
```
GET /users/9f8e7d6c-0000-0000-0000-000000000002/trust-score
```

**Response 200 (Success):**
```json
{
  "success": true,
  "data": {
    "user_id": "9f8e7d6c-0000-0000-0000-000000000002",
    "trust_score": 87.50,
    "components": {
      "average_rating": 4.6,
      "on_time_return_ratio": 0.92,
      "completion_ratio": 0.88
    },
    "total_transactions": 17
  }
}
```

**Response 404 (User Tidak Ditemukan):**
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Pengguna dengan ID tersebut tidak ditemukan"
  }
}
```

**Response 500 (Server Error):**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Terjadi kesalahan pada server, silakan coba lagi"
  }
}
```

---

## 5. Ringkasan Endpoint

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/auth/register` | Publik | Registrasi dengan validasi domain email kampus |
| POST | `/auth/login` | Publik | Login mahasiswa terdaftar |
| GET | `/items/nearby` | Bearer | Katalog barang berbasis radius geofencing |
| POST | `/items` | Bearer | Membuat listing barang baru (pemilik) |
| POST | `/transactions` | Bearer | Mengajukan transaksi pinjam/barter |
| PATCH | `/transactions/:id/status` | Bearer | Update status siklus transaksi |
| POST | `/reviews` | Bearer | Memberi ulasan pasca-transaksi `returned` |
| GET | `/users/:id/trust-score` | Bearer | Detail Trust Score pengguna |
| GET | `/stats/expense-saver` | Publik | Total agregat Expense Saver Counter komunitas |
