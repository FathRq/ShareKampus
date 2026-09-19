export function formatRp(n) {
  const v = Number(n) || 0;
  return "Rp" + v.toLocaleString("id-ID");
}

export function formatJarak(meter) {
  const m = Number(meter);
  if (!Number.isFinite(m)) return "";
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export function formatTanggal(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

/** Waktu relatif Bahasa Indonesia: "baru saja", "3 jam lalu", "kemarin", dst. */
export function formatRelatif(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  if (diff < 0) return formatTanggal(iso);
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return `${menit} mnt lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari === 1) return "kemarin";
  if (hari < 7) return `${hari} hari lalu`;
  return formatTanggal(iso);
}

/** URL Google Maps Search untuk koordinat — dibuka di tab baru. */
export function mapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
/** Parse "POINT(lng lat)" -> { lat, lng } | null */
export function parsePointText(text) {
  if (!text || typeof text !== "string") return null;
  const m = text.match(/POINT\s*\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s*\)/);
  if (!m) return null;
  return { lng: Number(m[1]), lat: Number(m[2]) };
}

export function extractToken(data) {
  return data?.token ?? data?.access_token ?? null;
}

export const CATEGORY_LABEL = {
  buku: "Buku",
  alat_lab: "Alat Lab",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

export const TX_TYPE_LABEL = {
  pinjam: "Pinjam",
  barter: "Barter",
  keduanya: "Pinjam / Barter",
};

export const STATUS_LABEL = {
  pending: "Menunggu",
  active: "Aktif",
  returned: "Selesai",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
};

export const ERROR_MESSAGE_ID = {
  INVALID_CAMPUS_EMAIL: "Gunakan email kampus resmi (contoh: nama@mhs.unesa.ac.id)",
  EMAIL_ALREADY_REGISTERED: "Email sudah terdaftar, silakan masuk",
  INVALID_CREDENTIALS: "Email atau kata sandi salah",
  ITEM_NOT_FOUND: "Barang tidak ditemukan, mungkin sudah dihapus",
  ITEM_NOT_AVAILABLE: "Barang sedang tidak tersedia",
  ITEM_ON_LOAN: "Selesaikan dulu transaksi aktif sebelum menghapus",
  TRANSACTION_NOT_FOUND: "Transaksi tidak ditemukan",
  TRANSACTION_NOT_RETURNED: "Transaksi harus selesai dulu sebelum memberi ulasan",
  INVALID_TRANSITION: "Aksi ini tidak bisa dilakukan pada status saat ini",
  FORBIDDEN: "Kamu tidak berwenang melakukan aksi ini",
  REVIEW_ALREADY_EXISTS: "Kamu sudah memberi ulasan untuk transaksi ini",
  UPLOAD_FAILED: "Gagal mengunggah foto ke Storage, coba lagi",
};
