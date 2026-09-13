# FRONTEND_GUIDE.md — Panduan Integrasi API untuk Frontend
## ShareKampus — Untuk Sihan (Frontend Developer)

Dokumen ini merangkum seluruh endpoint backend yang **sudah selesai & teruji**. Versi ini sudah diperbaiki berdasarkan bug yang ditemukan selama integrasi frontend asli — kalau ada perbedaan dengan versi sebelumnya, **ikuti dokumen ini**.

---

## 0. Dasar-Dasar

**Base URL (development):** `http://localhost:8080`

**Format response selalu konsisten:**
```json
// Sukses
{ "success": true, "data": { ... } }

// Gagal
{ "success": false, "error": { "code": "KODE_ERROR", "message": "Pesan yang bisa ditampilkan ke user" } }
```

**Autentikasi:** endpoint privat butuh header:
```
Authorization: Bearer <token>
```

**CORS:** backend sudah mengizinkan request dari origin manapun untuk development (`AllowOrigins: ["*"]`). Ini akan dipersempit saat deploy production.

**Field yang bisa `null`:** `cover_photo_url`, `owner_avg_rating`, `meeting_scheduled_at`, `notes`, `comment` — selalu cek null sebelum ditampilkan.

---

## 1. Autentikasi

### `POST /auth/register` — Publik
```json
{
  "full_name": "Nama Lengkap",
  "email": "nama@mhs.unesa.ac.id",
  "password": "minimal8karakter",
  "campus_location_id": "uuid-dari-GET-/campus-locations"
}
```

### `POST /auth/login` — Publik
```json
{ "email": "nama@mhs.unesa.ac.id", "password": "..." }
```

**Response `data` untuk register & login:**
```json
{ "user_id": "uuid", "email": "nama@mhs.unesa.ac.id", "token": "..." }
```
Cuma dapat `token` mentah — buat data user lengkap (`full_name`, `trust_score`, dll), panggil `GET /users/me` terpisah pakai token itu.

### `GET /users/me` — Privat
Ambil profil user yang sedang login (`id`, `full_name`, `trust_score`, `campus_location_id`, dll).

---

## 2. Kampus & Lokasi

### `GET /campus-locations` — Publik

**Response `data`:**
```json
{ "locations": [ { "id": "uuid", "name": "...", "latitude": -7.31, "longitude": 112.72 } ] }
```
Datanya **dibungkus** di key `locations`, bukan array langsung.

---

## 3. Barang (Items)

### `GET /items/nearby` — Publik
**Query params:** `lat` (wajib), `lng` (wajib), `radius` (opsional, default 2500m), `category` (opsional), `q` (opsional — cari kata kunci di judul barang, case-insensitive)

```
GET /items/nearby?lat=-7.314146&lng=112.726428&radius=2500&category=buku&q=fisika
```

**Response `data` (array):**
```json
{
  "item_id": "uuid",
  "resource_code": "SK-BK-00004",
  "title": "Buku Fisika Dasar Edisi 3",
  "category": "buku",
  "transaction_type": "pinjam",
  "market_price": 120000,
  "cover_photo_url": null,
  "status": "available",
  "owner_id": "uuid",
  "owner_name": "Dian Pratama",
  "owner_trust_score": 60,
  "owner_avg_rating": 5,
  "owner_review_count": 1,
  "distance_meter": 0
}
```

### `POST /items` — Privat
```json
{
  "title": "...", "description": "...",
  "category": "buku",
  "transaction_type": "pinjam",
  "market_price": 120000,
  "photo_urls": ["url1", "url2"],
  "latitude": -7.314146,
  "longitude": 112.726428,
  "max_loan_days": 14
}
```

### `DELETE /items/:id` — Privat
Cuma pemilik. Ditolak (`409 ITEM_ON_LOAN`) kalau barang lagi `on_transaction`.
```json
{ "data": { "action": "soft_deleted" } }
```

---

## 4. Transaksi

### State Machine
```
pending -> approve (pemilik) -> active -> tandai selesai (siapa saja) -> returned
   |
   +--> reject (pemilik) -> rejected
   +--> cancel (peminjam) -> cancelled
```

### `GET /transactions` — Privat
Daftar semua transaksi milik user yang login (sebagai peminjam maupun pemilik).

```json
{
  "transaction_id": "uuid",
  "status": "active",
  "role": "borrower",
  "item_id": "uuid",
  "item_title": "Buku Fisika Dasar",
  "item_cover_photo_url": null,
  "counterpart_id": "uuid",
  "counterpart_name": "Dian Pratama",
  "agreed_return_date": "2026-09-29T00:00:00Z",
  "returned_at": null,
  "meeting_scheduled_at": "2026-09-15T09:00:00Z",
  "created_at": "2026-09-08T02:07:01Z"
}
```

### `GET /transactions/:id` — Privat
Detail 1 transaksi. Cuma bisa diakses peminjam atau pemilik transaksi itu (`403 FORBIDDEN` selain itu).

```json
{
  "transaction_id": "uuid",
  "status": "active",
  "item_id": "uuid",
  "item_title": "Buku Fisika Dasar",
  "item_market_price": 120000,
  "borrower_id": "uuid", "borrower_name": "Rina",
  "lender_id": "uuid", "lender_name": "Dian Pratama",
  "agreed_return_date": "2026-09-29T00:00:00Z",
  "returned_at": null,
  "meeting_scheduled_at": "2026-09-15T09:00:00Z",
  "meeting_point_text": "POINT(112.726428 -7.314146)",
  "notes": "Ketemu di depan perpustakaan ya kak",
  "created_at": "2026-09-08T02:07:01Z"
}
```
`meeting_point_text` formatnya `POINT(longitude latitude)` — urutannya longitude dulu, kebalikan dari kebiasaan.

### `POST /transactions` — Privat
```json
{
  "item_id": "uuid",
  "meeting_scheduled_at": "2026-09-15T14:00:00+07:00",
  "meeting_latitude": -7.314146,
  "meeting_longitude": 112.726428,
  "notes": "Catatan buat pemilik"
}
```
Semua field selain `item_id` opsional. Barang **TETAP** muncul di katalog buat user lain setelah request dibuat.

### `PATCH /transactions/:id/status` — Privat
```json
{
  "status": "active",
  "meeting_scheduled_at": "2026-09-15T16:00:00+07:00",
  "meeting_latitude": -7.3,
  "meeting_longitude": 112.7
}
```

| Aksi | Siapa | Kapan tombol muncul |
|---|---|---|
| Approve (`active`) | Pemilik saja | status `pending`, user = pemilik |
| Reject (`rejected`) | Pemilik saja | status `pending`, user = pemilik |
| Cancel (`cancelled`) | Peminjam saja | status `pending`, user = peminjam |
| Tandai selesai (`returned`) | Peminjam ATAU pemilik | status `active` |

---

## 5. Ulasan (Reviews)

### `POST /reviews` — Privat
```json
{ "transaction_id": "uuid", "rating": 5, "comment": "..." }
```
Syarat: transaksi `returned`, reviewer adalah salah satu pihak, cuma 1x per transaksi per orang.

---

## 6. Trust Score

### `GET /users/:id/trust-score` — Publik
```json
{
  "trust_score": 60,
  "avg_rating": 5,
  "review_count": 1,
  "on_time_ratio": 1,
  "completion_ratio": 0.67,
  "total_transactions": 3
}
```

---

## 7. Statistik Komunitas

### `GET /stats/expense-saver` — Publik
```json
{ "total_saved": 390000, "completed_transactions": 3 }
```

---

## 8. Daftar Kode Error

| Kode | Kapan Muncul | Saran Pesan ke User |
|---|---|---|
| `VALIDATION_ERROR` | Input gak valid/kurang | Tampilkan `message` apa adanya |
| `ITEM_NOT_FOUND` | Barang gak ketemu | "Barang tidak ditemukan, mungkin sudah dihapus" |
| `ITEM_NOT_AVAILABLE` | Barang lagi gak available | "Barang sedang tidak tersedia" |
| `ITEM_ON_LOAN` | Coba hapus barang yang lagi dipinjam | "Selesaikan dulu transaksi aktif sebelum menghapus" |
| `TRANSACTION_NOT_FOUND` | Transaksi gak ketemu | "Transaksi tidak ditemukan" |
| `INVALID_TRANSITION` | Ubah status yang gak valid | "Aksi ini tidak bisa dilakukan pada status transaksi saat ini" |
| `FORBIDDEN` | Bukan pihak yang berwenang | "Kamu tidak berwenang melakukan aksi ini" |
| `REVIEW_ALREADY_EXISTS` | Sudah pernah review | "Kamu sudah memberi ulasan untuk transaksi ini" |
| `INTERNAL_SERVER_ERROR` | Bug/error server | "Terjadi kesalahan, coba lagi nanti" |

---

## Yang Belum Ada

- Upload foto barang — sudah diatasi tim frontend memakai Supabase Storage langsung (upload dari client, kirim URL publiknya ke `photo_urls`).
- Endpoint update/edit barang (`PATCH /items/:id` selain status) — belum ada. Kalau perlu edit listing, solusinya sementara hapus lalu buat baru.