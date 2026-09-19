/**
 * Data panduan untuk GuideBanner di atas katalog.
 * Pindahan dari section landing yang sudah dihapus (versi ringkas).
 * Bentuk objek stabil — siap diganti API bila nanti ada endpoint panduan.
 */

export const GUIDE_FEATURES = [
  {
    id: "pinjam",
    icon: "key",
    tint: "bg-violet-100 text-violet-700",
    title: "Pinjam",
    desc: "Sewa harian alat kuliah dari teman sekampus.",
  },
  {
    id: "barter",
    icon: "repeat",
    tint: "bg-purple-100 text-purple-700",
    title: "Barter",
    desc: "Tukar barang tak terpakai dengan yang kamu butuhkan.",
  },
  {
    id: "jual",
    icon: "tag",
    tint: "bg-indigo-100 text-indigo-700",
    title: "Jual",
    desc: "Jual perlengkapan bekas layak pakai ke mahasiswa lain.",
  },
  {
    id: "riwayat",
    icon: "history",
    tint: "bg-blue-100 text-blue-700",
    title: "Riwayat Transaksi",
    desc: "Semua transaksi tercatat rapi beserta statusnya.",
  },
];

export const GUIDE_STEPS = [
  {
    id: "cari",
    icon: "search",
    tint: "from-purple-500 to-indigo-500",
    title: "Cari Barang",
    desc: "Telusuri katalog di sekitarmu.",
  },
  {
    id: "hubungi",
    icon: "chat",
    tint: "from-indigo-500 to-blue-500",
    title: "Hubungi Pemilik",
    desc: "Cek trust score, lalu ajukan pinjam/barter.",
  },
  {
    id: "transaksi",
    icon: "deal",
    tint: "from-blue-500 to-sky-500",
    title: "Transaksi",
    desc: "Bertemu di titik kampus, lalu beri ulasan.",
  },
];
