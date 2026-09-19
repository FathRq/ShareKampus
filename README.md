# ShareKampus
### Campus Circular Resource Network
*"From Idle Resources to Shared Opportunities"*

Submission untuk **GAYATAMA 5 International Web Technology Competition** Universitas Negeri Surabaya.

---

## Tautan Penting

| | Link |
|---|---|
| **Live Demo (Frontend)** | https://sharekampus.vercel.app |
| **Live API (Backend)** | https://sharekampus-backend-b7fa8.containers.snapdeploy.app |
| **Dokumentasi Teknis Lengkap** | [`note/`](./note) |
| **Dokumentasi API untuk Integrasi** | [`FRONTEND_GUIDE.md`](./FRONTEND_GUIDE.md) |

---

## Tentang Proyek

ShareKampus adalah platform digital untuk sirkulasi sumber daya pendidikan antar mahasiswa. Alih-alih membeli barang baru yang hanya dipakai sebentar (buku, alat lab, kalkulator, dsb), mahasiswa dapat meminjam atau menukar (barter) barang dari mahasiswa lain di sekitar kampus, melalui mekanisme yang kami sebut **Campus Circular Loop**: satu barang terus bersirkulasi ke banyak mahasiswa berbeda selama masih memiliki nilai guna.

Proyek ini dikembangkan untuk menjawab 4 kesenjangan yang diidentifikasi di lingkungan kampus:

| Kesenjangan | Solusi di ShareKampus |
|---|---|
| **Economic Gap** mahasiswa membeli barang yang cuma dipakai sementara | Peminjaman & barter sebagai alternatif membeli baru |
| **Utilization Gap** barang masih layak pakai tapi menganggur | Sirkulasi barang antar mahasiswa lewat listing |
| **Access Gap** informasi barang tersedia tidak terpusat | Pencarian berbasis lokasi (geofencing) & kata kunci |
| **Trust Gap** belum ada mekanisme reputasi | Trust Score Engine berbasis riwayat transaksi & ulasan |

### Kesesuaian dengan SDGs
- **SDG 4 Pendidikan Berkualitas**: memperluas akses sumber daya pendidikan tanpa harus membeli baru
- **SDG 12 Konsumsi dan Produksi Bertanggung Jawab**: memperpanjang masa guna barang, mengurangi konsumsi baru yang tidak perlu

---

## Fitur Utama

1. **Autentikasi & Profil** registrasi (validasi domain email kampus), login, profil pengguna
2. **Listing Barang** unggah barang untuk dipinjamkan/dibarter, lengkap kategori, harga pasar, foto, lokasi
3. **Pencarian Berbasis Lokasi** temukan barang dalam radius tertentu dari posisi pengguna (geospasial PostGIS), plus pencarian kata kunci
4. **Peminjaman & Barter** alur pengajuan → persetujuan pemilik → penggunaan → pengembalian
5. **Manajemen Transaksi** status transaksi lengkap (`pending`, `active`, `returned`, `rejected`, `cancelled`), penjadwalan waktu & lokasi serah-terima
6. **Trust Score Engine** reputasi pengguna dihitung dari rata-rata rating, ketepatan waktu pengembalian, dan rasio penyelesaian transaksi
7. **Student Expense Saver** estimasi total penghematan komunitas dari transaksi yang berhasil diselesaikan

---

## Technology Stack

| Layer | Teknologi | Peran |
|---|---|---|
| **Frontend** | React.js, Tailwind CSS, Framer Motion, Lucide Icons | Antarmuka mobile-first |
| **Backend** | Golang, Gin Framework | REST API & logika bisnis |
| **Database** | PostgreSQL + PostGIS (via Supabase) | Data aplikasi & pencarian geospasial |
| **Autentikasi** | Supabase Auth (JWT) | Sesi & otorisasi |
| **Penyimpanan File** | Supabase Storage | Upload foto barang |
| **Hosting Frontend** | Vercel | Static hosting, HTTPS |
| **Hosting Backend** | SnapDeploy (Docker) | Container hosting, HTTPS |

Detail lengkap arsitektur & model matematis (Haversine/Geofencing, Trust Score, Expense Saver) ada di [`note/ARCH.md`](./note/ARCH.md).

---

## Installation Guide

Proyek ini menggunakan struktur **monorepo** `backend/` dan `frontend/` sebagai dua project terpisah dalam satu repository.

### Prasyarat
- [Go](https://go.dev/) 1.25 atau lebih baru
- [Node.js](https://nodejs.org/) 18 atau lebih baru
- [Docker](https://www.docker.com/) (opsional, untuk menjalankan backend via container)
- Akun [Supabase](https://supabase.com/) (untuk database & auth proyek ini sudah punya instance sendiri, kredensial dishare terpisah untuk keperluan evaluasi)

### 1. Clone Repository
```bash
git clone https://github.com/FathRq/ShareKampus.git
cd ShareKampus
```

### 2. Menjalankan Backend

```bash
cd backend
```

Buat file `.env` di folder ini dengan isi berikut (isi sesuai kredensial Supabase yang digunakan):
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxx
SUPABASE_JWKS_URL=https://xxxxx.supabase.co/auth/v1/.well-known/jwks.json
DATABASE_URL=postgresql://user:password@host:6543/postgres
PORT=8080
```

Jalankan:
```bash
go mod download
go run cmd/api/main.go
```

Backend akan aktif di `http://localhost:8080`. Cek dengan:
```bash
curl http://localhost:8080/health
```

**Alternatif: jalankan via Docker**
```bash
docker build -t sharekampus-backend .
docker run --env-file .env -p 8080:8080 sharekampus-backend
```

### 3. Menjalankan Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Buka `http://localhost:5173`. Pastikan backend sudah berjalan lebih dulu di `localhost:8080` (atau sesuaikan `VITE_API_BASE_URL` di `.env` ke alamat backend yang dipakai).

### 4. Setup Database (khusus untuk instance Supabase baru)

Jalankan seluruh isi [`note/ERD.sql`](./note/ERD.sql) di Supabase SQL Editor file ini berisi skema tabel lengkap beserta fungsi PostGIS (`get_nearby_items`, `recalculate_trust_score`, `get_trust_score_breakdown`, `get_expense_saver_total`).

---

## Technical Documentation

Dokumentasi teknis lengkap tersedia di folder [`note/`](./note):

| Dokumen | Isi |
|---|---|
| [`PRD.md`](./note/PRD.md) | Requirement produk, functional requirements, scope MVP |
| [`ARCH.md`](./note/ARCH.md) | Arsitektur sistem, diagram, model matematis (Haversine, Trust Score, Expense Saver) |
| [`ERD.sql`](./note/ERD.sql) | Skema database lengkap (tabel, fungsi PostGIS) |
| [`ERD.puml`](./note/ERD.puml) | Diagram ERD (PlantUML) |
| [`userflow.puml`](./note/userflow.puml) | Diagram alur pengguna Campus Circular Loop |
| [`DESIGN_SYSTEM.md`](./note/DESIGN_SYSTEM.md) | Palet warna, tipografi, komponen UI |
| [`FRONTEND_GUIDE.md`](./FRONTEND_GUIDE.md) | Dokumentasi API lengkap endpoint, request/response, kode error |
| [`TASK.md`](./note/TASK.md) | Rencana kerja & checklist progres pengembangan |
| [`GUIDELINE.md`](./note/GUIDELINE.md) | Konvensi git, code style, secrets management |

### Ringkasan Endpoint API

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/health` | Cek status server & koneksi database |
| `POST` | `/auth/register` | Registrasi akun (validasi domain email kampus) |
| `POST` | `/auth/login` | Login |
| `GET` | `/users/me` | Profil pengguna yang login |
| `GET` | `/users/:id/trust-score` | Rincian Trust Score pengguna |
| `GET` | `/campus-locations` | Daftar lokasi kampus |
| `GET` | `/items/nearby` | Cari barang berdasarkan lokasi, kategori, kata kunci |
| `POST` | `/items` | Buat listing barang baru |
| `DELETE` | `/items/:id` | Hapus/nonaktifkan listing barang |
| `GET` | `/transactions` | Daftar transaksi milik pengguna |
| `GET` | `/transactions/:id` | Detail satu transaksi |
| `POST` | `/transactions` | Ajukan peminjaman/barter |
| `PATCH` | `/transactions/:id/status` | Ubah status transaksi (approve/reject/cancel/returned) |
| `POST` | `/reviews` | Beri ulasan pasca-transaksi |
| `GET` | `/stats/expense-saver` | Statistik penghematan komunitas |

Detail lengkap format request/response ada di [`FRONTEND_GUIDE.md`](./FRONTEND_GUIDE.md).

---

## Tim

| Nama | NIM | Peran |
|---|---|---|
| Fatkhur Rozaq | 24051204026 | Ketua Tim |
| Ahmad Syihan Arijuddin | 24051204035 | Anggota |
| Sarah Amaylia | 25051204292 | Anggota |
| Kaysa Karuma Amalia | 24051204011 | Anggota |

Program Studi Teknik Informatika, Universitas Negeri Surabaya.

## Pembimbing

| Nama | NIP/NIDN | Peran |
|---|---|---|
| Rifqi Abdillah, M.Kom. | 199911012024061001 | Dosen Pembimbing |
---

## Akun Demo (untuk Evaluasi Juri)

Gunakan akun berikut untuk mencoba fitur yang memerlukan login (Listing Barang, Peminjaman & Barter, Trust Score, dsb) di [Live Demo](https://sharekampus.vercel.app):

| Field | Value |
|---|---|
| **Email** | `123@mhs.unesa.ac.id` |
| **Password** | `qwertyui` |

> **Catatan:** Ini adalah akun dummy/seed data khusus untuk keperluan demo dan evaluasi, bukan akun mahasiswa asli. Password sengaja dibuat sederhana untuk kemudahan pengujian juri dan tidak merepresentasikan kebijakan keamanan password produksi (validasi kompleksitas password tetap diterapkan pada alur registrasi normal).

Jika ingin menguji alur registrasi dari awal, gunakan email dengan domain kampus yang valid (`@mhs.unesa.ac.id` atau domain kampus lain yang didukung) pada endpoint `POST /auth/register`.