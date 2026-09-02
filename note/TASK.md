# TASK.md — Sprint Task Breakdown & RACI Matrix
## ShareKampus — GAYATAMA 5 (Eksekusi 15 Hari)

**Tim:**
- **Lead** — Full-stack Lead Developer (kamu)
- **Sihan** — Frontend Developer
- **Kay** — Lead Proposal / SDGs
- **Sar** — Technical Writer / QA / GitHub Manager

---

## 1. Matriks RACI

**R** = Responsible (mengerjakan) · **A** = Accountable (bertanggung jawab akhir) · **C** = Consulted (dimintai masukan) · **I** = Informed (diberi info)

| Task Area | Lead | Sihan | Kay | Sar |
|-----------|:----:|:-----:|:---:|:---:|
| Setup Monorepo & CI/CD | **A/R** | C | I | I |
| Database Schema & PostGIS (`ERD.sql`) | **A/R** | I | I | C |
| Backend API — Golang (`API_CONTRACT.md`) | **A/R** | C | I | C |
| Frontend UI Implementation | C | **A/R** | I | C |
| Design System / UI Kit Terapan | C | **A/R** | I | I |
| Integrasi Frontend ↔ Backend | **A/R** | **R** | I | I |
| Testing & QA (manual + checklist bug) | C | C | I | **A/R** |
| Dokumentasi Teknis (PRD, ARCH, dsb.) | **R** | I | C | **A** |
| GitHub Management (branch, PR review, tag release) | C | I | I | **A/R** |
| Proposal Tertulis 15 Halaman | I | I | **A/R** | C |
| Slide Pitch Deck | I | C | **A/R** | C |
| Riset & Justifikasi Kesesuaian SDG 12 & 4 | C | I | **A/R** | I |
| Deployment (Vercel, Render/Koyeb, Supabase) | **A/R** | C | I | I |
| Demo Video / Persiapan Presentasi Final | C | C | **A/R** | **R** |

---

## 2. Milestone per Fase (5 Hari)

| Fase | Hari | Milestone Wajib |
|------|------|------------------|
| **Fase 1 — Foundation** | Hari 1–5 | Repo monorepo siap, skema database + PostGIS aktif di Supabase, autentikasi Campus SSO berjalan (register/login + validasi domain), skeleton UI frontend dengan Design System diterapkan, draft outline proposal & SDG research selesai. |
| **Fase 2 — Core Features** | Hari 6–10 | Geofencing Hub (katalog + filter radius) berfungsi end-to-end, Transaction Engine (pending→active→returned) berfungsi, Trust Score Engine terhitung otomatis, draf penuh proposal 15 halaman selesai, kerangka pitch deck selesai. |
| **Fase 3 — Polish & Submission** | Hari 11–15 | Expense Saver Counter live di beranda, seluruh fitur MVP terdeploy stabil (Vercel + Render/Koyeb + Supabase), QA menyeluruh & bug fixing, proposal final diedit & diformat, pitch deck & demo video final, submission lengkap ke panitia GAYATAMA 5. |

---

## 3. Checklist Harian — Tim Teknis (Web)

### Fase 1: Hari 1–5 (Foundation)
- [ ] **H1:** Setup repo GitHub monorepo (`/frontend`, `/backend`), branch protection `main`/`dev`, `.gitignore` & `.env.example`
- [ ] **H1:** Provisioning project Supabase, aktifkan extension `postgis`
- [ ] **H2:** Eksekusi `ERD.sql` (tabel campuses, users, items, transactions, reviews)
- [ ] **H2:** Setup boilerplate Golang (Gin/Fiber) + struktur folder backend
- [ ] **H3:** Setup boilerplate React + Tailwind + Shadcn UI, terapkan token dari `DESIGN_SYSTEM.md`
- [ ] **H3:** Implementasi endpoint `POST /auth/register` & `POST /auth/login` + validasi domain email
- [ ] **H4:** Implementasi UI halaman Register/Login (mobile-first) + integrasi API auth
- [ ] **H4:** Setup deploy awal: Vercel (frontend) & Render/Koyeb (backend), test koneksi end-to-end
- [ ] **H5:** Review internal Fase 1 (demo auth flow jalan), setup CI dasar (lint + build check)

### Fase 2: Hari 6–10 (Core Features)
- [ ] **H6:** Implementasi endpoint `GET /items/nearby` + stored function `get_nearby_items`
- [ ] **H6:** Implementasi UI Beranda + Katalog (Item Card, filter kategori & radius)
- [ ] **H7:** Implementasi endpoint `POST /items` (buat listing barang) + UI form tambah barang
- [ ] **H7:** Implementasi Bottom Sheet Drawer untuk detail barang & form pengajuan transaksi
- [ ] **H8:** Implementasi endpoint `POST /transactions` & `PATCH /transactions/:id/status`
- [ ] **H8:** Implementasi UI halaman "Transaksi Saya" dengan Status Badge (pending/active/returned/overdue)
- [ ] **H9:** Implementasi `recalculate_trust_score()` trigger pasca-review + endpoint `GET /users/:id/trust-score`
- [ ] **H9:** Implementasi UI Trust Score Badge di profil & item card
- [ ] **H10:** Implementasi endpoint ulasan (`POST /reviews`) + UI form ulasan pasca-transaksi `returned`

### Fase 3: Hari 11–15 (Polish & Submission)
- [ ] **H11:** Implementasi `get_expense_saver_total()` + UI Expense Saver Counter Card di beranda
- [ ] **H11:** QA menyeluruh alur end-to-end (register → cari barang → transaksi → ulasan)
- [ ] **H12:** Bug fixing berdasarkan hasil QA Sar, cek responsivitas mobile di berbagai ukuran layar
- [ ] **H12:** Audit keamanan dasar: cek `.env` tidak ter-commit, RLS Supabase aktif, validasi input backend
- [ ] **H13:** Deploy final ke production, smoke test seluruh endpoint di `API_CONTRACT.md`
- [ ] **H13:** Rekam demo video alur aplikasi untuk lampiran submission
- [ ] **H14:** Freeze fitur — hanya bug fix kritikal, finalisasi README & dokumentasi repo
- [ ] **H15:** Submission final (kode, dokumentasi, proposal, pitch deck, demo video)

---

## 4. Checklist Harian — Tim Non-Teknis (Proposal & Pitch Deck)

### Fase 1: Hari 1–5
- [ ] **H1–H2:** Riset mendalam data pendukung SDG 12 & SDG 4 relevan konteks mahasiswa Indonesia
- [ ] **H2–H3:** Susun outline proposal 15 halaman (Latar Belakang, Rumusan Masalah, Tujuan, Metode, Solusi ShareKampus, Dampak SDG, Kesimpulan)
- [ ] **H4–H5:** Tulis draft Bab 1–2 (Latar Belakang & Rumusan Masalah) proposal

### Fase 2: Hari 6–10
- [ ] **H6–H7:** Tulis draft Bab 3 (Metode/Solusi Teknis) — sinkron dengan tim teknis agar deskripsi arsitektur akurat
- [ ] **H8:** Tulis draft Bab 4 (Analisis Dampak SDG 12 & 4, termasuk proyeksi Expense Saver)
- [ ] **H9:** Susun kerangka slide pitch deck (max 12–15 slide): Cover, Masalah, Solusi, Demo, SDG Impact, Tim, Roadmap
- [ ] **H10:** Review internal draft proposal penuh bersama Lead & Sar

### Fase 3: Hari 11–15
- [ ] **H11–H12:** Finalisasi & edit bahasa proposal, cek format sesuai ketentuan panitia GAYATAMA 5
- [ ] **H12–H13:** Desain visual slide pitch deck final (selaraskan dengan `DESIGN_SYSTEM.md` palet Navy-Gold)
- [ ] **H13–H14:** Latihan presentasi & simulasi tanya-jawab juri
- [ ] **H14:** Cross-check proposal & slide dengan demo aplikasi aktual (konsistensi klaim fitur)
- [ ] **H15:** Submission final proposal + pitch deck sesuai deadline panitia
