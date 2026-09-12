import { Link, NavLink, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const linkCls = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/40 ${
    isActive ? "bg-pebble text-signal-blue" : "text-ink-navy hover:bg-pebble"
  }`;

export default function TopBar() {
  const { isAuthed, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-2 px-3 sm:gap-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img
            src="/Logo.svg"
            alt="Logo ShareKampus"
            className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
            loading="eager"
            draggable={false}
          />
          <span className="truncate text-base font-bold text-ink-navy sm:text-lg">
            Share<span className="text-signal-blue">Kampus</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <NavLink to="/" className={linkCls}>
            Beranda
          </NavLink>
          <NavLink to="/transaksi" className={linkCls}>
            Transaksi
          </NavLink>
          <NavLink to="/profil" className={linkCls}>
            Profil
          </NavLink>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          {isAuthed ? (
            <>
              <span className="hidden max-w-[180px] truncate text-sm font-medium text-slate-gray sm:block">
                {user?.full_name || user?.email}
              </span>
              <button
                onClick={() => navigate("/tambah")}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-signal-blue px-3 py-1.5 text-[13px] font-semibold text-white shadow-button transition-all duration-150 hover:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/50 focus-visible:ring-offset-2 sm:gap-1.5 sm:px-3.5 sm:py-2 sm:text-sm"
              >
                <Plus size={15} /> Tambah
              </button>
              <button
                onClick={logout}
                className="shrink-0 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-ink-navy transition-all duration-150 hover:bg-pebble active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/40 sm:px-3 sm:py-2 sm:text-sm"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="shrink-0 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-ink-navy transition-all duration-150 hover:bg-pebble active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/40 sm:px-3 sm:py-2 sm:text-sm">
                Masuk
              </Link>
              <Link
                to="/register"
                className="shrink-0 rounded-lg bg-ink-navy px-3 py-1.5 text-[13px] font-semibold text-white transition-all duration-150 hover:opacity-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-navy/40 focus-visible:ring-offset-2 sm:px-3.5 sm:py-2 sm:text-sm"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
