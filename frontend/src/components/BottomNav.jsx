import { NavLink } from "react-router-dom";
import { Home, ArrowLeftRight, PlusCircle, User } from "lucide-react";

const items = [
  { to: "/katalog", label: "Beranda", Icon: Home, end: true },
  { to: "/transaksi", label: "Transaksi", Icon: ArrowLeftRight },
  { to: "/tambah", label: "Tambah", Icon: PlusCircle },
  { to: "/profil", label: "Profil", Icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-3 z-40 px-4 pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Navigasi utama">
      <div className="mx-auto grid max-w-[480px] grid-cols-4 rounded-2xl border border-gray-200 bg-white/95 px-2 shadow-lg backdrop-blur-xl">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-semibold transition-colors ${
                isActive ? "text-primary-dark" : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            <Icon size={22} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
