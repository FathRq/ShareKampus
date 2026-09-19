/* eslint-disable react-refresh/only-export-components */
import { Heart, Search } from "lucide-react";
import { Dropdown } from "../Dropdown";

export const CATEGORIES = [
  { value: "", label: "Semua" },
  { value: "buku", label: "Buku" },
  { value: "alat_lab", label: "Alat Lab" },
  { value: "elektronik", label: "Elektronik" },
  { value: "lainnya", label: "Lainnya" },
];

export const RADIUS_OPTIONS = [
  { value: 1000, label: "1 km" },
  { value: 2500, label: "2,5 km" },
  { value: 5000, label: "5 km" },
  { value: 10000, label: "10 km" },
];

export function FilterBar({ query, setQuery, category, setCategory, radius, setRadius, favOnly, onToggleFav, favCount = 0 }) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari jas lab, kalkulator, buku..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3.5 text-[15px] text-gray-900 outline-none transition-all duration-150 placeholder:text-gray-400 hover:border-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value || "all"}
                onClick={() => setCategory(c.value)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  category === c.value && !favOnly
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200/70"
                }`}
              >
                {c.label}
              </button>
            ))}
            <button
              onClick={onToggleFav}
              aria-pressed={favOnly}
              title="Hanya tampilkan barang favoritmu"
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                favOnly
                  ? "bg-gradient-to-r from-blue-200 to-sky-200 text-blue-900 shadow-sm"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200/70"
              }`}
            >
              <Heart size={14} className={favOnly ? "fill-rose-500 text-rose-500" : "text-gray-400"} />
              Favorit{favCount > 0 ? ` (${favCount})` : ""}
            </button>
        </div>
        <Dropdown
          value={radius}
          onChange={(v) => setRadius(Number(v))}
          options={RADIUS_OPTIONS}
          title="Radius pencarian"
          align="right"
          className="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto [&>button]:justify-between sm:[&>button]:justify-start"
        />
      </div>
    </div>
  );
}
