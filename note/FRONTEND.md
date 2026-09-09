# FRONTEND_GUIDE.md — Panduan Integrasi API untuk Frontend
## ShareKampus — Untuk Sihan (Frontend Developer)

Dokumen ini merangkum seluruh endpoint backend yang **sudah selesai & teruji**, supaya kamu bisa mulai bangun UI tanpa perlu nunggu tanya-tanya ke Lead dulu. Kalau ada yang kurang jelas, tetap tanya ya — ini cuma referensi awal.

> ⚠️ **Catatan:** dokumen ini lebih akurat & up-to-date dibanding `API_CONTRACT.md` yang lama. Kalau ada perbedaan antara keduanya, **ikuti dokumen ini dulu**.

---

## 0. Dasar-Dasar

**Base URL (development):** `http://localhost:8080` (nanti berubah setelah deploy)

**Format response selalu konsisten:**
```json
// Sukses
{ "success": true, "data": { ... } }

// Gagal
{ "success": false, "error": { "code": "KODE_ERROR", "message": "Pesan yang bisa ditampilkan ke user" } }
```

**Autentikasi:** endpoint privat butuh header:
```
Authorization: Bearer <access_token>
```
`access_token` didapat dari response `POST /auth/login`. Simpan di memory/state React (jangan `localStorage` untuk keamanan — diskusikan dengan Lead soal strategi penyimpanan token yang aman).

**Field yang bisa `null`:** `cover_photo_url`, `owner_avg_rating`, `meeting_scheduled_at`, `notes`, `comment` — selalu cek null sebelum ditampilkan (misal `owner_avg_rating` null → tampilkan "Belum ada ulasan", bukan "Rating: 0").

---

## 1. Autentikasi

### `POST /auth/register` — Publik
```json
// Request
{
  "full_name": "Nama Lengkap",
  "email": "nama@mhs.unesa.ac.id",
  "password": "minimal8karakter",
  "campus_location_id": "uuid-dari-GET-/campus-locations"
}
```
Email **harus** pakai domain kampus yang terdaftar (`campuses.email_domain`), kalau tidak → error validasi.

### `POST /auth/login` — Publik
```json
// Request
{ "email": "nama@mhs.unesa.ac.id", "password": "..." }

// Response sukses (data)
{ "access_token": "...", "user": { ... } }
```

### `GET /users/me` — Privat
Ambil profil user yang sedang login (termasuk `id`, `full_name`, `trust_score`, dll). Dipakai buat dapat `user_id` sendiri.

---

## 2. Kampus & Lokasi

### `GET /campus-locations` — Publik
Dipakai buat isi dropdown pilihan kampus fisik saat register.

---

## 3. Barang (Items)

### `GET /items/nearby` — Publik
**Query params:** `lat` (wajib), `lng` (wajib), `radius` (opsional, default 2500 meter), `category` (opsional)

```
GET /items/nearby?lat=-7.314146&lng=112.726428&radius=2500&category=buku
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
Cuma barang berstatus `available` yang muncul di sini.

### `POST /items` — Privat
```json
{
  "title": "...", "description": "...",
  "category": "buku",              // lihat daftar kategori di ERD.sql (enum item_category)
  "transaction_type": "pinjam",    // "pinjam" | "barter" | "keduanya"
  "market_price": 120000,
  "photo_urls": ["url1", "url2"],  // boleh array kosong []
  "latitude": -7.314146,
  "longitude": 112.726428,
  "max_loan_days": 14
}
```
`resource_code` otomatis dibuat backend, gak perlu diisi dari frontend.

### `DELETE /items/:id` — Privat
Cuma pemilik barang yang bisa hapus. Kalau barang lagi `on_transaction` (dipinjam aktif), akan ditolak (`409 ITEM_ON_LOAN`) — tampilkan pesan "selesaikan dulu transaksi aktifnya".

```json
// Response sukses
{ "data": { "action": "soft_deleted" } }  // atau "hard_deleted"
```
Frontend gak perlu peduli beda soft/hard delete — dari sisi UI, barang tetap "hilang dari daftar" di kedua kasus.

---

## 4. Transaksi

### State Machine (penting dipahami untuk desain UI status badge)

```
pending ──approve (pemilik)──> active ──tandai selesai (siapa saja)──> returned
   │
   ├──reject (pemilik)──> rejected
   └──cancel (peminjam)──> cancelled
```

### `POST /transactions` — Privat (Peminjam membuat request)
```json
{
  "item_id": "uuid",
  "meeting_scheduled_at": "2026-09-15T14:00:00+07:00",  // opsional, format ISO8601
  "meeting_latitude": -7.314146,    // opsional
  "meeting_longitude": 112.726428,  // opsional
  "notes": "Catatan buat pemilik"   // opsional
}
```
**Penting untuk UI:** setelah request dibuat, barang **TETAP** muncul di katalog buat user lain (belum terkunci) — baru terkunci setelah pemilik approve. Jadi jangan asumsikan barang langsung hilang dari daftar setelah user request.

### `PATCH /transactions/:id/status` — Privat
```json
{
  "status": "active",  // "active" | "rejected" | "cancelled" | "returned"
  "meeting_scheduled_at": "2026-09-15T16:00:00+07:00",  // opsional, cuma efektif saat status: "active" (pemilik override jadwal)
  "meeting_latitude": -7.3,   // opsional
  "meeting_longitude": 112.7  // opsional
}
```
**Siapa boleh apa (validasi dari backend, tapi UI sebaiknya sudah sembunyikan tombol yang gak relevan):**
| Aksi | Siapa | Kapan tombol muncul di UI |
|---|---|---|
| Approve (`active`) | Pemilik saja | status `pending`, dan user login = pemilik |
| Reject (`rejected`) | Pemilik saja | status `pending`, dan user login = pemilik |
| Cancel (`cancelled`) | Peminjam saja | status `pending`, dan user login = peminjam |
| Tandai selesai (`returned`) | Peminjam ATAU pemilik | status `active` |

---

## 5. Ulasan (Reviews)

### `POST /reviews` — Privat
```json
{
  "transaction_id": "uuid",
  "rating": 5,           // 1-5
  "comment": "..."       // opsional
}
```
**Syarat (validasi backend, tampilkan pesan error yang sesuai):**
- Transaksi harus berstatus `returned` dulu
- Reviewer harus salah satu pihak di transaksi itu
- Cuma boleh 1x review per transaksi per orang (`409 REVIEW_ALREADY_EXISTS` kalau dicoba lagi)

**UI Tip:** tampilkan tombol "Beri Ulasan" cuma di transaksi yang statusnya `returned` DAN user belum pernah review transaksi itu.

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
Cocok ditampilkan di halaman profil user atau detail barang (klik nama pemilik → lihat trust score lengkap).

---

## 7. Statistik Komunitas

### `GET /stats/expense-saver` — Publik
```json
{
  "total_saved": 390000,
  "completed_transactions": 3
}
```
Dipakai buat kartu highlight "Total Penghematan Komunitas" di beranda. Format `total_saved` sebagai Rupiah di frontend, contoh: `Rp390.000`.

---

## 8. Daftar Kode Error yang Perlu Ditangani di UI

| Kode | Kapan Muncul | Saran Pesan ke User |
|---|---|---|
| `VALIDATION_ERROR` | Input gak valid/kurang | Tampilkan `message` dari response apa adanya |
| `ITEM_NOT_FOUND` | Barang gak ketemu | "Barang tidak ditemukan, mungkin sudah dihapus" |
| `ITEM_NOT_AVAILABLE` | Barang lagi gak available | "Barang sedang tidak tersedia" |
| `ITEM_ON_LOAN` | Coba hapus barang yang lagi dipinjam | "Selesaikan dulu transaksi aktif sebelum menghapus" |
| `TRANSACTION_NOT_FOUND` | Transaksi gak ketemu | "Transaksi tidak ditemukan" |
| `INVALID_TRANSITION` | Coba ubah status yang gak valid | "Aksi ini tidak bisa dilakukan pada status transaksi saat ini" |
| `FORBIDDEN` | Bukan pihak yang berwenang | "Kamu tidak berwenang melakukan aksi ini" |
| `REVIEW_ALREADY_EXISTS` | Sudah pernah review | "Kamu sudah memberi ulasan untuk transaksi ini" |
| `INTERNAL_SERVER_ERROR` | Bug/error server | "Terjadi kesalahan, coba lagi nanti" (jangan tampilkan detail teknis ke user) |

---

## Yang Belum Ada (jangan bikin UI untuk ini dulu)

- Endpoint lihat **daftar transaksi milik user** (`GET /transactions` atau semacamnya) — saat ini belum ada, tapi kemungkinan dibutuhkan untuk halaman "Transaksi Saya". **Diskusikan ke Lead** kalau kamu butuh ini untuk mulai desain halaman tersebut.
- Endpoint lihat **detail 1 transaksi** (`GET /transactions/:id`) — belum ada juga.
- Upload foto barang — `POST /items` cuma terima `photo_urls` (array URL string), belum ada endpoint upload file. Untuk sementara, foto perlu di-upload ke storage lain dulu (misal Supabase Storage) baru URL-nya dikirim ke endpoint ini. Diskusikan ke Lead soal strategi upload foto.