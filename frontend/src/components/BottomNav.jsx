import { NavLink } from "react-router-dom";
import { Home, ArrowLeftRight, PlusCircle, User } from "lucide-react";

const items = [
  { to: "/", label: "Beranda", Icon: Home, end: true },
  { to: "/transaksi", label: "Transaksi", Icon: ArrowLeftRight },
  { to: "/tambah", label: "Tambah", Icon: PlusCircle },
  { to: "/profil", label: "Profil", Icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-paper md:hidden">
      <div className="mx-auto grid max-w-[480px] grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                isActive ? "text-signal-blue" : "text-mist-gray"
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
