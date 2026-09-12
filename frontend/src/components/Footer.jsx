import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-cloud">
      <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-ink-navy">
            Share<span className="text-signal-blue">Kampus</span>
          </p>
          <p className="mt-2 max-w-[260px] text-sm text-slate-gray">
            Platform barter & pinjam alat/buku kuliah antar-mahasiswa.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-gray">Produk</p>
          <ul className="mt-3 space-y-2 text-sm font-medium text-ink-navy">
            <li><Link to="/" className="hover:text-signal-blue">Katalog</Link></li>
            <li><Link to="/tambah" className="hover:text-signal-blue">Tambah barang</Link></li>
            <li><Link to="/transaksi" className="hover:text-signal-blue">Transaksi</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-gray">Akun</p>
          <ul className="mt-3 space-y-2 text-sm font-medium text-ink-navy">
            <li><Link to="/login" className="hover:text-signal-blue">Masuk</Link></li>
            <li><Link to="/register" className="hover:text-signal-blue">Daftar kampus</Link></li>
            <li><Link to="/profil" className="hover:text-signal-blue">Profil</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-gray">Kompetisi</p>
          <p className="mt-3 text-sm text-slate-gray">GAYATAMA 5 — Web Technology Competition.</p>
        </div>
      </div>
    </footer>
  );
}
