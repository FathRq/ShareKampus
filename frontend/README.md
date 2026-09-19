# ShareKampus — Frontend

Antarmuka web ShareKampus, dibangun dengan **React + Vite + Tailwind CSS**.

> Dokumentasi lengkap proyek ada di [README.md root](../README.md). Dokumen ini fokus ke bagian frontend.

## Menjalankan Secara Lokal

### Prasyarat
- Node.js 18+
- Backend sudah berjalan (lokal di `localhost:8080`, atau alamat deploy)

### Langkah

```bash
cp .env.example .env
npm install
npm run dev
```

Buka `http://localhost:5173`.

### Environment Variables

| Key | Keterangan |
|---|---|
| `VITE_API_BASE_URL` | Alamat backend (default: `http://localhost:8080`) |
| `VITE_SUPABASE_URL` | URL project Supabase (untuk upload foto ke Storage) |
| `VITE_SUPABASE_ANON_KEY` | Publishable key Supabase (aman untuk client-side, dilindungi RLS) |
| `VITE_ITEM_PHOTO_BUCKET` | Nama bucket Supabase Storage untuk foto barang |

Nilai default di `.env.example` sudah valid untuk instance Supabase proyek ini.

## Build untuk Production

```bash
npm run build
```

Hasil build ada di folder `dist/`, siap di-deploy ke static hosting (Vercel/Netlify/dsb).

> **Catatan untuk deploy:** karena aplikasi ini pakai client-side routing (React Router), platform hosting perlu dikonfigurasi supaya semua path mengarah ke `index.html` (lihat `vercel.json`), kalau tidak refresh di halaman selain `/` akan menampilkan 404.

## Dokumentasi API

Lihat [`../FRONTEND_GUIDE.md`](../FRONTEND_GUIDE.md) untuk daftar lengkap endpoint backend yang dipakai aplikasi ini.