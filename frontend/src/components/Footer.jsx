import { Link } from "react-router-dom";
import { AtSign, Globe, Rss } from "lucide-react";

const SOCIALS = [
  { label: "Situs ShareKampus", icon: Globe },
  { label: "Media sosial ShareKampus", icon: AtSign },
  { label: "Blog ShareKampus", icon: Rss },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div>
          <p className="text-lg font-bold tracking-tight text-gray-900">
            Share<span className="text-sky-500">Kampus</span>
          </p>
          <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-gray-600">
            Platform barter & pinjam alat/buku kuliah antar-mahasiswa.
          </p>
          <div className="mt-4 flex gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-primary hover:bg-primary-light hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <s.icon size={17} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Produk</p>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-gray-700">
            <li><Link to="/katalog" className="transition-colors hover:text-primary-dark">Beranda</Link></li>
            <li><Link to="/tambah" className="transition-colors hover:text-primary-dark">Tambah barang</Link></li>
            <li><Link to="/transaksi" className="transition-colors hover:text-primary-dark">Transaksi</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Akun</p>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-gray-700">
            <li><Link to="/login" className="transition-colors hover:text-primary-dark">Masuk</Link></li>
            <li><Link to="/register" className="transition-colors hover:text-primary-dark">Daftar kampus</Link></li>
            <li><Link to="/profil" className="transition-colors hover:text-primary-dark">Profil</Link></li>
          </ul>
        </div>

      </div>
      <div className="border-t border-gray-200">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-4 text-center text-[13px] font-medium text-gray-500 sm:px-6">
          © 2026 ShareKampus
        </div>
      </div>
    </footer>
  );
}
