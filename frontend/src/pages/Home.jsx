import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LocateFixed, PackageSearch } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { campusApi, itemApi } from "../lib/api";
import { useGeolocation } from "../hooks/useGeolocation";
import { PillBadge } from "../components/ui";
import { ItemCard } from "../components/catalog/ItemCard";
import { FilterBar } from "../components/catalog/FilterBar";
import { ItemDetailSheet } from "../components/catalog/ItemDetailSheet";

const FALLBACK_UNESA = { lat: -7.314146, lng: 112.726428 };

export function HomePage() {
  const { user } = useAuth();
  const { coords, status: geoStatus, request: requestGeo } = useGeolocation();

  const [locations, setLocations] = useState([]);
  const [campusId, setCampusId] = useState("");
  const [radius, setRadius] = useState(2500);
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState(null);
  const [selected, setSelected] = useState(null);
  const requestedGeo = useRef(false);

  // Boot: campus locations + expense saver + geolocation (fallback = kampus pertama / UNESA)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const locs = await campusApi.listLocations();
        if (!alive) return;
        setLocations(locs);
        if (locs.length > 0) setCampusId(locs[0].id);
        const fallback = locs.length > 0
          ? { lat: locs[0].latitude, lng: locs[0].longitude }
          : FALLBACK_UNESA;
        if (!requestedGeo.current) {
          requestedGeo.current = true;
          requestGeo(fallback);
        }
      } catch {
        if (!alive) return;
        if (!requestedGeo.current) {
          requestedGeo.current = true;
          requestGeo(FALLBACK_UNESA);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [requestGeo]);

  const activeCoords = useMemo(() => {
    if (coords) return coords;
    const loc = locations.find((l) => l.id === campusId);
    if (loc) return { lat: loc.latitude, lng: loc.longitude };
    return FALLBACK_UNESA;
  }, [coords, locations, campusId]);

  const usingFallback = !coords;

  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    setItemsError(null);
    try {
      const params = { lat: activeCoords.lat, lng: activeCoords.lng, radius };
      if (category) params.category = category;
      const data = await itemApi.nearby(params);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItemsError(e);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, [activeCoords.lat, activeCoords.lng, radius, category]);

  useEffect(() => {
    // fetch on coords/filter change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItems();
  }, [fetchItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.title?.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="space-y-10">
      {/* HERO — blob only here */}
      <section className="grid items-center gap-8 pt-2 md:grid-cols-2 md:pt-8 [&>*]:min-w-0">
        <div>
          <PillBadge>Untuk Mahasiswa • Radius 10 KM</PillBadge>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Pinjam alat kuliah dari teman sekampus.
          </h1>
          <p className="mt-4 max-w-[480px] text-base text-slate-gray">
            {user ? ` Halo ${user.full_name?.split(" ")[0]}` : ""}.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#katalog"
              className="inline-flex items-center gap-2 rounded-lg bg-signal-blue px-5 py-2.5 text-[15px] font-semibold text-white shadow-button transition-all duration-150 hover:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/50 focus-visible:ring-offset-2"
            >
              Jelajahi katalog <ArrowRight size={17} />
            </a>
            <Link
              to="/tambah"
              className="inline-flex items-center gap-2 rounded-lg bg-ink-navy px-5 py-2.5 text-[15px] font-semibold text-white transition-all duration-150 hover:opacity-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-navy/40 focus-visible:ring-offset-2"
            >
              Bagikan barangmu
            </Link>
          </div>
        </div>
      </section>

      {/* KATALOG */}
      <section id="katalog" className="scroll-mt-20 space-y-4">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="text-3xl font-bold">Katalog terdekat</h2>
          <p className="mt-2 text-[15px] text-slate-gray">
            {usingFallback
              ? "Menggunakan titik kampus — izinkan lokasi untuk hasil lebih akurat."
              : "Berdasarkan lokasimu saat ini."}{" "}
            Hanya barang <em>available</em> yang tampil.
          </p>
        </div>

        <div className="rounded-2xl border border-hairline bg-paper p-4 shadow-linkcard sm:p-5">
          <FilterBar
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            radius={radius}
            setRadius={setRadius}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${
                usingFallback ? "bg-warning-bg text-warning-text" : "bg-success-bg text-success-text"
              }`}
            >
              <LocateFixed size={13} />
              {usingFallback ? "Titik kampus" : geoStatus === "loading" ? "Mencari lokasi..." : "Lokasi GPS"}
            </span>
            {locations.length > 0 && (
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="max-w-full rounded-full border border-hairline bg-pebble px-2.5 py-1 text-[13px] font-semibold outline-none transition-all duration-150 hover:border-mist-gray focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/25"
                title="Titik acuan kampus (dipakai bila GPS mati)"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.campus_name} — {l.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={fetchItems}
              className="ml-auto rounded-lg px-3 py-1.5 text-[13px] font-semibold text-signal-blue transition-all duration-150 hover:bg-pebble active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/40"
            >
              Muat ulang
            </button>
          </div>
        </div>

        {itemsError && (
          <div className="rounded-2xl border border-hairline bg-paper p-5 text-center shadow-linkcard">
            <p className="text-sm font-semibold text-danger-text">
              {itemsError.message || "Gagal memuat katalog"}
            </p>
            <button
              onClick={fetchItems}
              className="mt-3 rounded-lg bg-signal-blue px-4 py-2 text-sm font-semibold text-white shadow-button transition-all duration-150 hover:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/50 focus-visible:ring-offset-2"
            >
              Coba lagi
            </button>
          </div>
        )}

        {loadingItems ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-2xl border border-hairline bg-paper p-3 shadow-linkcard">
                <div className="aspect-[4/3] animate-pulse rounded-xl bg-pebble" />
                <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-pebble" />
                <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-pebble" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-hairline bg-paper p-10 text-center shadow-linkcard">
            <PackageSearch size={36} className="mx-auto text-mist-gray" />
            <p className="mt-3 font-bold">Belum ada barang ditemukan</p>
            <p className="mx-auto mt-1 max-w-[420px] text-sm text-slate-gray">
              Coba perluas radius, ganti kategori, atau jadi yang pertama membagikan barang di
              sekitarmu.
            </p>
            <Link
              to="/tambah"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink-navy px-4 py-2 text-sm font-semibold text-white"
            >
              Tambah barang
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[13px] text-slate-gray">
              Menampilkan {filtered.length} barang dalam radius {(radius / 1000).toLocaleString("id-ID")} km
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {filtered.map((item) => (
                <ItemCard key={item.item_id} item={item} onOpen={setSelected} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-[640px] pb-4 text-center">
        <h2 className="text-3xl font-bold">Kenapa ShareKampus?</h2>
        <p className="mt-3 text-base text-slate-gray">
          Hemat biaya, meratakan akses belajar.
        </p>
      </section>

      <ItemDetailSheet item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
