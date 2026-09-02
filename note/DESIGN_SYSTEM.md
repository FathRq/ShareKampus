# ShareKampus — Design System
> Kampus di malam hari — kanvas navy pekat, kartu putih mengambang, dan satu kilau emas yang menyala di setiap aksi.

**Theme:** light (mobile-first)

ShareKampus memakai bahasa visual "kampus terpercaya, transaksi cepat": latar navy gelap (#0B2545) dipakai secara disiplin hanya di zona struktural — header, bottom navigation, dan kartu unggulan — sementara kanvas utama aplikasi tetap terang berbasis Slate Ice Gray (#F8FAFC) agar konten (foto barang, badge trust score) mudah dibaca di layar ponsel. Satu warna emas (#F59E0B) membawa seluruh energi interaksi — setiap CTA ("Pinjam Sekarang", "Ajukan Barter"), badge status aktif, dan highlight trust score — menjadikannya satu-satunya keputusan kromatik penuh di atas sistem netral navy–slate. Tipografi geometris-sans yang tegas dipakai konsisten dari heading sampai body agar aplikasi terasa cepat dan modern, khas produk fintech/marketplace kampus. Komponen bersifat lembut namun solid: radius 16–20px, shadow bernuansa navy (bukan abu netral), dan badge pill untuk status transaksi yang harus terbaca sekilas.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Navy Deep (Primary) | `#0B2545` | `--color-navy-deep` | Warna brand utama — header, top app bar, bottom navigation bar, kartu unggulan (featured card) |
| Navy Base | `#132E4F` | `--color-navy-base` | Varian navy untuk tombol sekunder solid, border pada permukaan gelap, hover state navigasi |
| Navy Ink | `#0A192F` | `--color-navy-ink` | Navy paling gelap — footer, overlay modal, pressed/active state navigasi |
| Kampus Gold (Accent/CTA) | `#F59E0B` | `--color-kampus-gold` | Satu-satunya warna aksi — tombol "Pinjam Sekarang"/"Barter", badge pilihan, indikator status aktif |
| Gold Glow | `#F5A623` | `--color-gold-glow` | Varian gold untuk hover, rating bintang, highlight trust score tinggi |
| Ice Surface | `#F8FAFC` | `--color-ice-surface` | Latar belakang aplikasi (page background) — kanvas bersih di belakang seluruh layar |
| Ice Card | `#F1F5F9` | `--color-ice-card` | Permukaan sekunder — chip filter, alternate row, background bottom sheet drawer |
| Ice Border | `#E2E8F0` | `--color-ice-border` | Divider tipis, border input saat resting, garis pemisah list |
| Charcoal Ink (Text) | `#0F172A` | `--color-charcoal-ink` | Teks utama, heading, ikon aktif — navy-charcoal gelap, bukan hitam murni |
| Paper White | `#FFFFFF` | `--color-paper-white` | Permukaan kartu item, input field, teks di atas fill navy/gold gelap |
| Slate Secondary | `#475569` | `--color-slate-secondary` | Teks body sekunder, deskripsi barang, label form |
| Slate Muted | `#64748B` | `--color-slate-muted` | Teks tersier, metadata (jarak, waktu posting), ikon non-aktif |
| Slate Faint | `#94A3B8` | `--color-slate-faint` | Placeholder input, teks disabled, ikon bottom nav non-aktif |
| Slate Line | `#CBD5E1` | `--color-slate-line` | Border input saat rest, garis kartu tipis |
| Success Green | `#16A34A` | `--color-success-green` | Status "Returned"/selesai, indikator trust score tinggi, konfirmasi transaksi |
| Danger Red | `#DC2626` | `--color-danger-red` | Status "Overdue"/telat, validasi error, trust score rendah |

## Tokens — Typography

### Plus Jakarta Sans — Tipeface utama UI dan body — geometric sans yang menutupi navigasi, tombol, body copy, dan seluruh heading. Bentuk huruf yang bulat-modern memberi kesan approachable untuk audiens mahasiswa, tanpa kehilangan kesan profesional/terpercaya yang dibutuhkan fitur trust score. · `--font-jakarta`
- **Substitute:** Inter atau General Sans
- **Weights:** 400, 500, 600, 700, 800
- **Sizes:** 12, 13, 14, 16, 18, 20, 24, 28, 32
- **Line height:** 1.2–1.5
- **Letter spacing:** 0 (netral, tidak melebar seperti font editorial)
- **Role:** Satu-satunya tipeface di seluruh sistem — dari label kecil di bottom nav hingga judul halaman 32px. Konsistensi satu font memperkuat kesan aplikasi utilitas yang cepat dan tanpa gangguan visual.

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| caption | 12px | 1.3 | 0px | `--text-caption` |
| body-sm | 13px | 1.4 | 0px | `--text-body-sm` |
| body | 14px | 1.45 | 0px | `--text-body` |
| body-lg | 16px | 1.5 | 0px | `--text-body-lg` |
| heading-sm | 18px | 1.35 | 0px | `--text-heading-sm` |
| heading | 20px | 1.3 | 0px | `--text-heading` |
| heading-lg | 24px | 1.25 | 0px | `--text-heading-lg` |
| display | 28px | 1.2 | 0px | `--text-display` |
| display-lg | 32px | 1.2 | 0px | `--text-display-lg` |

## Tokens — Spacing & Shapes

**Density:** compact-comfortable (dioptimalkan untuk layar mobile ~375–414px)

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 2 | 2px | `--spacing-2` |
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 20 | 20px | `--spacing-20` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 48 | 48px | `--spacing-48` |
| 64 | 64px | `--spacing-64` |

### Border Radius

| Element | Value |
|---------|-------|
| badge/pill status | 999px |
| cards (item card) | 20px |
| images (foto barang) | 16px |
| inputs | 12px |
| buttons (CTA) | 14px |
| bottom sheet drawer (top corners) | 24px |

### Shadows

| Name | Value | Token |
|------|-------|-------|
| sm | `rgba(11, 37, 69, 0.08) 0px 1px 4px 0px` | `--shadow-sm` |
| md | `rgba(11, 37, 69, 0.12) 0px 4px 12px 0px` | `--shadow-md` |
| gold-glow | `rgba(245, 158, 11, 0.25) 0px 4px 16px 0px` | `--shadow-gold-glow` |

### Layout

- **Page max-width (mobile):** 480px (mobile-first, tetap terkunci di viewport lebar layar HP saat dibuka di desktop)
- **Section gap:** 24–32px
- **Card padding:** 16–20px
- **Element gap:** 8–12px
- **Bottom nav height:** 64px (fixed, di atas safe-area)

## Components

### Primary CTA Button ("Pinjam Sekarang" / "Ajukan Barter")
**Role:** Tombol aksi utama — elemen interaktif paling penting di seluruh aplikasi

Fill: `#F59E0B`. Text: `#0B2545` (navy gelap di atas gold agar kontras tinggi & mudah dibaca), Plus Jakarta Sans 16px weight 600. Padding: 12px 24px. Border-radius: 14px. Shadow: `--shadow-gold-glow` untuk lift lembut. Hover/pressed menggelapkan gold ~10% menuju `#D97706`. Full-width di kartu detail barang, inline di product card.

### Secondary/Ghost Button
**Role:** Aksi sekunder — "Lihat Profil", "Batalkan", "Hubungi Peminjam"

Fill: transparan. Border: 1px solid `#0B2545`. Text: `#0B2545`, Plus Jakarta Sans 14px weight 600. Border-radius: 14px. Padding: 10px 20px. Hover: fill `#0B2545` dengan opacity 5%.

### Bottom Navigation Bar
**Role:** Navigasi utama mobile — Beranda, Cari, Ajukan, Transaksi, Profil

Fill: `#0B2545` solid, height 64px, fixed di bawah layar dengan safe-area padding. Ikon aktif: `#F59E0B` (gold) dengan label 11px weight 600 di bawahnya. Ikon non-aktif: `#FFFFFF` opacity 60%. Indikator aktif berupa dot kecil gold 4px di atas ikon (opsional).

### Item/Product Card
**Role:** Kartu katalog barang — elemen inti dari Geofencing Hub

Fill: `#FFFFFF`. Border-radius: 20px. Shadow: `--shadow-sm`. Foto barang 16px radius di bagian atas (rasio 1:1 atau 4:3). Badge gold `#F59E0B` di pojok kanan-atas foto untuk label "Baru Diposting" / "Rekomendasi" — teks `#0B2545` 11px weight 700, pill radius 999px. Judul barang: Plus Jakarta Sans 14px weight 600 `#0F172A`. Chip jarak lokasi: `#F1F5F9` bg, `#475569` text 12px, ikon pin kecil (mis. "500m dari kampus"). Trust score pemilik ditampilkan sebagai badge kecil di footer kartu.

### Trust Score Badge
**Role:** Indikator reputasi pengguna (0.00–100.00) — dipakai di profil, kartu barang, dan konfirmasi transaksi

Pill radius 999px, padding 4px 10px. Warna dinamis berdasar skor: skor ≥80 → fill `#16A34A` (success) teks putih; skor 50–79 → fill `#F59E0B` (gold) teks `#0B2545`; skor <50 → fill `#DC2626` (danger) teks putih. Ikon bintang/shield kecil 12px di kiri angka. Font: 12px weight 700.

### Status Badge (Transaksi)
**Role:** Menunjukkan status siklus pinjam/barter — pending, active, returned, overdue

Pill radius 999px, padding 4px 12px, font 12px weight 600. `pending` → fill `#F1F5F9`, teks `#475569`. `active` → fill `#FEF3C7` (gold tint), teks `#B45309`. `returned` → fill `#DCFCE7` (green tint), teks `#166534`. `overdue` → fill `#FEE2E2` (red tint), teks `#B91C1C`.

### Bottom Sheet Drawer
**Role:** Panel modal geser dari bawah — detail barang, form ajukan pinjam/barter, filter pencarian

Fill: `#FFFFFF`. Border-radius atas: 24px. Drag handle: pill 40x4px `#CBD5E1` di tengah-atas. Shadow: `--shadow-md` ke arah atas. Heading di dalam drawer: 18px weight 700 `#0F172A`. Padding internal: 20px.

### Top App Bar / Navigation Header
**Role:** Header sticky di atas — logo, search bar, notifikasi

Background: `#0B2545`. Logo "ShareKampus" wordmark putih dengan aksen ikon gold. Search bar di bawah logo: fill `#FFFFFF`, radius 12px, placeholder `#94A3B8` "Cari alat atau buku kuliah...". Ikon notifikasi/lonceng putih dengan dot indikator gold jika ada notifikasi baru.

### Email/Input Field (Campus SSO)
**Role:** Input form autentikasi email kampus dan form umum

Fill: `#FFFFFF`. Border: 1px solid `#CBD5E1`. Border-radius: 12px. Padding: 12px 16px. Placeholder: `#94A3B8` 14px (mis. "nama@unesa.ac.id"). Focus ring: `#F59E0B` 2px outline offset 2px. Error state: border `#DC2626` dengan helper text merah di bawah.

### Geofencing Distance Chip
**Role:** Menampilkan jarak barang dari lokasi pengguna

Fill: `#F1F5F9`. Radius 999px. Padding 4px 10px. Ikon pin 12px `#475569`. Teks 12px weight 500 `#475569` (mis. "1.2 km dari kampus").

### Expense Saver Counter Card
**Role:** Kartu highlight komunitas — total nominal yang berhasil dihemat mahasiswa

Fill gradient tipis dari `#0B2545` ke `#132E4F` (navy ke navy-base, arah diagonal). Angka besar: Plus Jakarta Sans 28px weight 800 warna `#F59E0B` (mis. "Rp 42.500.000"). Label kecil di bawah: 12px `#FFFFFF` opacity 70% ("Total dihemat komunitas ShareKampus"). Radius 20px, biasa ditempatkan di atas beranda sebagai social proof.

## Do's and Don'ts

### Do
- Gunakan `#F59E0B` secara eksklusif untuk CTA utama, status aktif, dan badge pilihan — jangan untuk body text atau blok latar besar
- Jadikan navy `#0B2545` sebagai warna struktural (header, bottom nav) — bukan warna dekoratif yang tersebar di banyak elemen
- Tetapkan latar utama aplikasi ke `#F8FAFC` (ice), bukan putih murni — memberi kedalaman lembut saat kartu putih mengambang di atasnya
- Pakai radius 20px untuk kartu barang dan 999px untuk semua badge/pill status — dua nilai ini jadi ciri khas taktil sistem
- Warnai status badge secara semantik (gold=active, green=returned, red=overdue) agar mahasiswa bisa membaca status transaksi sekilas tanpa membaca teks
- Jaga shadow tetap bernuansa navy (`rgba(11,37,69,...)`), bukan abu-abu netral, agar konsisten dengan identitas dingin-profesional kampus

### Don't
- Jangan gunakan gold untuk latar belakang besar (hero, section) — gold hanya untuk elemen aksi kecil dan terkonsentrasi
- Jangan campurkan warna aksi kedua selain gold — disiplin satu accent color di atas sistem navy-slate
- Jangan gunakan radius tajam 0–4px pada kartu, tombol, atau bottom sheet — kelembutan 12–24px penting untuk kesan approachable
- Jangan gunakan hitam murni `#000000` untuk teks — `#0F172A` (charcoal navy) menjaga keselarasan hue dengan sistem
- Jangan pakai warna status di luar palet semantik yang ditentukan (mis. biru untuk error) — konsistensi warna status krusial untuk UX transaksi

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 1 | Ice Surface | `#F8FAFC` | Latar belakang halaman — kanvas dasar seluruh aplikasi |
| 2 | Paper White | `#FFFFFF` | Kartu barang, input, bottom sheet — mengambang di atas ice surface |
| 3 | Navy Deep | `#0B2545` | Permukaan struktural gelap — header, bottom nav, kartu unggulan |
| 4 | Kampus Gold | `#F59E0B` | Permukaan aksi — tombol CTA, badge status aktif |

## Elevation

- **Primary CTA Button:** `rgba(245, 158, 11, 0.25) 0px 4px 16px 0px`
- **Item Card:** `rgba(11, 37, 69, 0.08) 0px 1px 4px 0px`
- **Bottom Sheet Drawer:** `rgba(11, 37, 69, 0.12) 0px 4px 12px 0px` (mengarah ke atas)

## Agent Prompt Guide

Quick Color Reference:
- text: `#0F172A`
- background: `#F8FAFC` (page) / `#FFFFFF` (cards) / `#0B2545` (header & bottom nav)
- border: `#CBD5E1` (input) / `#E2E8F0` (divider)
- accent/CTA: `#F59E0B` (tombol aksi, badge aktif)
- secondary text: `#475569`

3 Contoh Prompt Komponen:

1. Buat tombol CTA utama: fill `#F59E0B`, teks `#0B2545` weight 600, radius 14px, padding 12px 24px, shadow gold-glow. Gunakan untuk "Pinjam Sekarang" dan "Ajukan Barter".

2. Buat item card di atas latar `#F8FAFC`: fill putih, radius 20px, shadow sm. Foto 4:3 radius 16px di atas dengan badge gold pill di pojok kanan-atas. Judul 14px weight 600 `#0F172A`, chip jarak `#F1F5F9` di bawahnya, trust score badge di footer kartu.

3. Buat bottom navigation bar: fill `#0B2545` height 64px fixed bottom, 5 ikon (Beranda, Cari, Ajukan+, Transaksi, Profil), ikon aktif gold `#F59E0B` dengan label 11px, ikon non-aktif putih opacity 60%.

## Visual Language

Imagery: Foto barang/alat kuliah asli (jas lab, kalkulator, buku teks) sebagai elemen visual dominan di dalam kartu — bukan ilustrasi abstrak. Foto profil mahasiswa bulat kecil menyertai setiap listing untuk membangun trust. Tidak ada stock photo generik atau lifestyle imagery besar di hero.

Treatment: Foto barang ditampilkan dalam kartu putih radius 16-20px dengan shadow navy lembut. Badge gold dan status pill selalu overlay di atas foto, bukan di bawahnya, agar cepat terbaca saat scrolling katalog.

Icons: Lucide Icons, warna `#0B2545` (di atas latar terang) atau `#FFFFFF` (di atas latar navy), stroke-based, 20-24px untuk navigasi dan 16px untuk metadata inline (pin lokasi, jam, kalkulator).

Trust/social proof: Trust Score Badge dan Expense Saver Counter menjadi elemen social-proof utama — bukan logo partner, melainkan angka reputasi individu dan agregat komunitas.

Density: Padat-terarah — katalog barang memakai grid 2 kolom di mobile, informasi penting (harga sewa/nilai barter, jarak, trust score) selalu terlihat tanpa perlu tap tambahan.

## Layout Patterns

Page model: Single-column mobile-first, max-width 480px, dengan bottom navigation fixed 64px dan top app bar sticky.

Katalog pattern: Search bar sticky di atas → filter chip horizontal-scroll (jarak, kategori) → grid 2 kolom item card dengan infinite scroll.

Detail/Transaksi pattern: Bottom sheet drawer dipakai untuk detail barang, form pengajuan pinjam/barter, dan filter — menghindari navigasi ke halaman penuh untuk aksi cepat.

Navigation: Bottom navigation bar 5-ikon sebagai navigasi primer (bukan sidebar/hamburger), sesuai konvensi aplikasi mobile-first Indonesia.

## Similar Apps

- **Gojek** — Pola bottom navigation dan mobile-first single column yang sama, meski Gojek memakai hijau sebagai accent
- **OLX/Facebook Marketplace** — Pola grid katalog 2 kolom dengan foto dominan dan badge harga/status
- **Traveloka** — Kombinasi navy sebagai warna struktural dengan satu accent warna hangat untuk CTA

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-navy-deep: #0B2545;
  --color-navy-base: #132E4F;
  --color-navy-ink: #0A192F;
  --color-kampus-gold: #F59E0B;
  --color-gold-glow: #F5A623;
  --color-ice-surface: #F8FAFC;
  --color-ice-card: #F1F5F9;
  --color-ice-border: #E2E8F0;
  --color-charcoal-ink: #0F172A;
  --color-paper-white: #FFFFFF;
  --color-slate-secondary: #475569;
  --color-slate-muted: #64748B;
  --color-slate-faint: #94A3B8;
  --color-slate-line: #CBD5E1;
  --color-success-green: #16A34A;
  --color-danger-red: #DC2626;

  /* Typography */
  --font-jakarta: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --text-caption: 12px;
  --text-body-sm: 13px;
  --text-body: 14px;
  --text-body-lg: 16px;
  --text-heading-sm: 18px;
  --text-heading: 20px;
  --text-heading-lg: 24px;
  --text-display: 28px;
  --text-display-lg: 32px;

  /* Typography — Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;

  /* Spacing */
  --spacing-2: 2px;
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-64: 64px;

  /* Layout */
  --page-max-width: 480px;
  --section-gap: 24-32px;
  --card-padding: 16-20px;
  --element-gap: 8-12px;
  --bottom-nav-height: 64px;

  /* Border Radius */
  --radius-badge: 999px;
  --radius-card: 20px;
  --radius-image: 16px;
  --radius-input: 12px;
  --radius-button: 14px;
  --radius-drawer-top: 24px;

  /* Shadows */
  --shadow-sm: rgba(11, 37, 69, 0.08) 0px 1px 4px 0px;
  --shadow-md: rgba(11, 37, 69, 0.12) 0px 4px 12px 0px;
  --shadow-gold-glow: rgba(245, 158, 11, 0.25) 0px 4px 16px 0px;

  /* Surfaces */
  --surface-ice: #F8FAFC;
  --surface-white: #FFFFFF;
  --surface-navy: #0B2545;
  --surface-gold: #F59E0B;
}
```

### Tailwind v4

```css
@theme {
  /* Colors */
  --color-navy-deep: #0B2545;
  --color-navy-base: #132E4F;
  --color-navy-ink: #0A192F;
  --color-kampus-gold: #F59E0B;
  --color-gold-glow: #F5A623;
  --color-ice-surface: #F8FAFC;
  --color-ice-card: #F1F5F9;
  --color-ice-border: #E2E8F0;
  --color-charcoal-ink: #0F172A;
  --color-paper-white: #FFFFFF;
  --color-slate-secondary: #475569;
  --color-slate-muted: #64748B;
  --color-slate-faint: #94A3B8;
  --color-slate-line: #CBD5E1;
  --color-success-green: #16A34A;
  --color-danger-red: #DC2626;

  /* Typography */
  --font-jakarta: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --text-caption: 12px;
  --text-body-sm: 13px;
  --text-body: 14px;
  --text-body-lg: 16px;
  --text-heading-sm: 18px;
  --text-heading: 20px;
  --text-heading-lg: 24px;
  --text-display: 28px;
  --text-display-lg: 32px;

  /* Spacing */
  --spacing-2: 2px;
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-64: 64px;

  /* Border Radius */
  --radius-badge: 999px;
  --radius-card: 20px;
  --radius-image: 16px;
  --radius-input: 12px;
  --radius-button: 14px;
  --radius-drawer-top: 24px;

  /* Shadows */
  --shadow-sm: rgba(11, 37, 69, 0.08) 0px 1px 4px 0px;
  --shadow-md: rgba(11, 37, 69, 0.12) 0px 4px 12px 0px;
  --shadow-gold-glow: rgba(245, 158, 11, 0.25) 0px 4px 16px 0px;
}
```
