# GUIDELINE.md — Developer & Team Collaboration Guidelines
## ShareKampus — Panduan Kolaborasi Tim (4 Anggota, Monorepo)

---

## 1. Standar Konvensi Commit Git (Conventional Commits)

Semua commit **wajib** mengikuti format:

```
<type>(<scope opsional>): <deskripsi singkat imperatif>
```

| Type | Kapan Dipakai | Contoh |
|------|----------------|--------|
| `feat` | Menambah fitur baru | `feat(backend): tambah endpoint get nearby items` |
| `fix` | Memperbaiki bug | `fix(frontend): perbaiki bug bottom sheet tidak tertutup` |
| `docs` | Perubahan dokumentasi saja | `docs: update API_CONTRACT.md endpoint transaksi` |
| `style` | Perubahan format/gaya kode tanpa mengubah logika (spasi, indentasi) | `style(frontend): rapikan class tailwind item card` |
| `refactor` | Restrukturisasi kode tanpa mengubah perilaku fungsional | `refactor(backend): pisahkan handler transaction ke service layer` |
| `test` | Menambah/memperbaiki test | `test(backend): tambah unit test trust score engine` |
| `chore` | Tugas pemeliharaan (dependency update, config) | `chore: update go.mod dependencies` |

**Aturan tambahan:**
- Deskripsi singkat maksimal ~72 karakter, gunakan bahasa Indonesia atau Inggris secara konsisten per commit (disarankan Inggris untuk konsistensi lintas tool).
- Satu commit = satu perubahan logis. Hindari commit raksasa yang mencampur beberapa fitur.
- Commit message TIDAK boleh berupa `"update"`, `"fix bug"`, `"wip"` tanpa konteks — selalu jelaskan *apa* yang berubah.

---

## 2. Aturan Manajemen Branch & Monorepo Etiquette

### 2.1 Struktur Branch

```
main            -> versi stabil, siap demo/submission
dev             -> integrasi aktif seluruh fitur (branch dasar semua kerja tim)
feature/<nama>  -> satu branch per fitur/tugas spesifik
fix/<nama>      -> perbaikan bug spesifik
```

**Contoh:** `feature/geofencing-catalog`, `feature/trust-score-engine`, `fix/auth-domain-validation`

### 2.2 Alur Kerja (Git Flow Sederhana)

1. Selalu buat branch baru dari `dev`, jangan langsung push ke `main` atau `dev`.
2. Kerjakan task di branch fitur masing-masing.
3. Buka **Pull Request (PR)** ke `dev`, minimal 1 reviewer (disarankan Sar sebagai QA/GitHub Manager, atau Lead untuk perubahan backend kritikal).
4. PR harus lolos review sebelum merge — cek: tidak ada `.env`/secret ter-commit, kode terformat rapi, tidak menghapus fitur orang lain.
5. `dev` di-merge ke `main` hanya di akhir tiap Fase (Hari 5, 10, 15) setelah dipastikan stabil.

### 2.3 Monorepo Etiquette (`/frontend` dan `/backend`)

- Setiap anggota **hanya mengubah folder sesuai tanggung jawabnya** kecuali sudah dikoordinasikan (Sihan → `/frontend`, Lead → `/backend` & integrasi).
- Perubahan lintas folder (misal frontend butuh field baru dari backend) **wajib didiskusikan** dulu di grup tim sebelum mengubah kontrak API di `API_CONTRACT.md`.
- Jangan commit folder `node_modules/`, `vendor/`, `dist/`, `build/` — pastikan sudah ada di `.gitignore` root.
- Setiap folder (`/frontend`, `/backend`) punya `README.md` sendiri berisi cara instalasi & menjalankan secara lokal.

---

## 3. Panduan Penulisan Kode (Clean Code Standard)

### 3.1 Golang (Backend)

- Ikuti `gofmt` / `goimports` — wajib dijalankan sebelum commit (`gofmt -w .`).
- Struktur folder disarankan mengikuti pola layered: `handler/` (HTTP layer) → `service/` (business logic) → `repository/` (akses database).
- Selalu tangani error secara eksplisit, jangan pernah `_ = err` untuk mengabaikan error tanpa alasan jelas.
- Gunakan `context.Context` untuk setiap fungsi yang berinteraksi dengan database/network.
- Nama variabel deskriptif, hindari singkatan ambigu (`trustScore`, bukan `ts` di luar lingkup lokal kecil).
- Response API selalu mengikuti format standar di `API_CONTRACT.md` (`success`, `data`/`error`).

### 3.2 React + Tailwind (Frontend)

- Gunakan **functional components** dengan Hooks — hindari class component.
- Satu file = satu komponen. Nama file dan nama komponen konsisten (`ItemCard.jsx` → `function ItemCard()`).
- Struktur folder disarankan: `components/` (reusable UI), `pages/` (route-level), `hooks/`, `lib/` (helper/API client).
- Kelas Tailwind ditulis dengan urutan konsisten: layout → spacing → warna → tipografi → efek (mis. `flex items-center gap-2 p-4 bg-white rounded-2xl text-sm font-semibold shadow-sm`).
- Semua token warna/spacing **wajib** merujuk ke `DESIGN_SYSTEM.md` (gunakan custom Tailwind theme, bukan hex-code hardcoded di JSX).
- Komponen Shadcn UI dikustomisasi lewat props/className, jangan mengedit langsung file di `components/ui/` kecuali untuk keperluan tema global.

---

## 4. Aturan Keamanan (Secrets Management)

- **Wajib** ada file `.env.example` di masing-masing folder (`/frontend`, `/backend`) berisi daftar nama variabel tanpa nilai asli:
  ```
  SUPABASE_URL=
  SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  JWT_SECRET=
  ```
- File `.env` aktual **tidak boleh pernah** di-commit — pastikan sudah masuk `.gitignore` sejak commit pertama repo dibuat.
- `SUPABASE_SERVICE_ROLE_KEY` (akses penuh, bypass RLS) **hanya** boleh dipakai di backend (Golang), **tidak pernah** di frontend React.
- Kredensial produksi (API key Supabase, JWT secret) disimpan di Environment Variables dashboard hosting (Vercel untuk frontend, Render/Koyeb untuk backend) — bukan di kode.
- Jika API key/secret tidak sengaja ter-commit: segera **revoke/regenerate** key tersebut di Supabase dashboard, baru kemudian bersihkan riwayat git (`git filter-repo` atau BFG Repo-Cleaner) — mengubah `.gitignore` saja tidak cukup karena histori commit lama tetap menyimpannya.
- Review PR wajib mengecek tidak ada string yang menyerupai API key/secret sebelum merge (tanggung jawab reviewer, khususnya Sar sebagai GitHub Manager).
