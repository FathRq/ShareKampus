/* eslint-disable react-refresh/only-export-components */
import { Search } from "lucide-react";

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

export function FilterBar({ query, setQuery, category, setCategory, radius, setRadius }) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-gray" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari jas lab, kalkulator, buku..."
          className="w-full rounded-lg border border-hairline bg-paper py-2.5 pl-10 pr-3.5 text-[15px] outline-none transition-all duration-150 placeholder:text-mist-gray hover:border-mist-gray focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/25"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value || "all"}
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/40 ${
                category === c.value
                  ? "bg-signal-blue text-white shadow-button"
                  : "bg-pebble text-ink-navy hover:bg-hairline/60"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="max-w-full rounded-lg border border-hairline bg-paper px-3 py-1.5 text-[13px] font-semibold outline-none transition-all duration-150 hover:border-mist-gray focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/25"
          title="Radius pencarian"
        >
          {RADIUS_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
