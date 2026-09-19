import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ConfirmDialog } from "./ConfirmDialog";

const linkCls = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
    isActive ? "bg-primary-light text-primary-dark" : "text-gray-700 hover:bg-gray-100"
  }`;

export default function TopBar({ variant }) {
  const { isAuthed, user, logout } = useAuth();
  const isAuthVariant = variant === "auth";
  const [scrolled, setScrolled] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-3 z-40 px-4 sm:top-4 sm:px-6">
      <div
        className={`relative mx-auto flex h-16 w-full max-w-[1200px] items-center gap-2 rounded-2xl border px-3 transition-all duration-200 sm:gap-4 sm:px-4 ${
          scrolled
            ? "border-gray-200 bg-white/95 shadow-lg backdrop-blur-xl"
            : "border-gray-200/70 bg-white/75 shadow-md backdrop-blur-xl"
        }`}
      >
        <Link to="/katalog" className="flex min-w-0 items-center gap-2">
          <img
            src="/Logo ShareKampus.webp"
            alt="Logo ShareKampus"
            className="h-12 w-12 shrink-0 object-contain sm:h-10 sm:w-10"
            loading="eager"
            draggable={false}
          />
          <span className="truncate text-base font-bold tracking-tight text-gray-900 sm:text-lg">
            Share<span className="text-sky-500">Kampus</span>
          </span>
        </Link>

        {!isAuthVariant && (
          <nav className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex" aria-label="Navigasi aplikasi">
            <NavLink to="/katalog" className={linkCls}>
              Beranda
            </NavLink>
            <NavLink to="/transaksi" className={linkCls}>
              Transaksi
            </NavLink>
            <NavLink to="/profil" className={linkCls}>
              Profil
            </NavLink>
          </nav>
        )}

        {!isAuthVariant && (
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {isAuthed ? (
              <>
                <span className="hidden max-w-[180px] truncate text-sm font-bold text-black-600 sm:block">
                  {user?.full_name || user?.email}
                </span>
                <button
                  onClick={() => setShowLogout(true)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-danger-bg px-3 py-1.5 text-[13px] font-semibold text-danger-text shadow-sm transition-all duration-150 hover:brightness-95 hover:shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-bg focus-visible:ring-offset-2 sm:px-3.5 sm:py-2 sm:text-sm"
                >
                  <LogOut size={15} /> Keluar
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="shrink-0 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-gray-700 transition-all duration-150 hover:bg-gray-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-3 sm:py-2 sm:text-sm">
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="shrink-0 rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/40 focus-visible:ring-offset-2 sm:px-3.5 sm:py-2 sm:text-sm"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showLogout}
        title="Keluar dari akun?"
        message="Kamu harus masuk lagi untuk meminjam atau membagikan barang."
        confirmLabel="Ya, keluar"
        onConfirm={() => {
          setShowLogout(false);
          logout();
        }}
        onCancel={() => setShowLogout(false)}
      />
    </header>
  );
}
