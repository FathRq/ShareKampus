import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, LocateFixed, PackageSearch } from "lucide-react";
import { campusApi, itemApi } from "../lib/api";
import { readWishlist, WISHLIST_EVENT } from "../lib/wishlist";
import { useGeolocation } from "../hooks/useGeolocation";
import { ItemCard } from "../components/catalog/ItemCard";
import { FilterBar } from "../components/catalog/FilterBar";
import { ItemDetailSheet } from "../components/catalog/ItemDetailSheet";
import { GuideBanner } from "../components/catalog/GuideBanner";
import { Dropdown } from "../components/Dropdown";

const FALLBACK_UNESA = { lat: -7.314146, lng: 112.726428 };

export function HomePage() {
  const { coords, status: geoStatus, request: requestGeo } = useGeolocation();

  const [locations, setLocations] = useState([]);
  const [campusId, setCampusId] = useState("");
  const [radius, setRadius] = useState(2500);
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [wishlist, setWishlist] = useState(() => readWishlist());

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
    let list = items;
    if (favOnly) list = list.filter((it) => wishlist.includes(it.item_id));
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((it) => it.title?.toLowerCase().includes(q));
  }, [items, query, favOnly, wishlist]);

  useEffect(() => {
    const sync = (e) => setWishlist(e.detail ?? readWishlist());
    window.addEventListener(WISHLIST_EVENT, sync);
    return () => window.removeEventListener(WISHLIST_EVENT, sync);
  }, []);

  return (
    <div className="space-y-4 pt-2">
      <GuideBanner />

      {/* KATALOG */}
      <section id="katalog" className="scroll-mt-24 space-y-4">
        <div className="mx-auto max-w-[640px] text-center">
          <span className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-dark">
            Katalog
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">Katalog terdekat</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
            {usingFallback
              ? "Menggunakan titik kampus — izinkan lokasi untuk hasil lebih akurat."
              : "Berdasarkan lokasimu saat ini."}{" "}
            Hanya barang <em>available</em> yang tampil.
          </p>
        </div>

        <div className="mt-3 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to="/tambah"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-10 py-2.5 text-[15px] font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 sm:w-auto"
          >
            <Plus size={18} />
            Bagikan barangmu
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <FilterBar
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            radius={radius}
            setRadius={setRadius}
            favOnly={favOnly}
            onToggleFav={() => setFavOnly((v) => !v)}
            favCount={wishlist.length}
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
              <Dropdown
                value={campusId}
                onChange={setCampusId}
                options={locations.map((l) => ({
                  value: l.id,
                  label: `${l.campus_name} — ${l.name}`,
                }))}
                title="Titik acuan kampus (dipakai bila GPS mati)"
                align="left"
                buttonClassName="rounded-full border-gray-200 bg-gray-100 hover:border-gray-400"
              />
            )}
            <button
              onClick={fetchItems}
              className="ml-auto rounded-lg px-3 py-1.5 text-[13px] font-semibold text-primary-dark transition-all duration-150 hover:bg-primary-light active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Muat ulang
            </button>
          </div>
        </div>

        {itemsError && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
            <p className="text-sm font-semibold text-danger-text">
              {itemsError.message || "Gagal memuat katalog"}
            </p>
            <button
              onClick={fetchItems}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              Coba lagi
            </button>
          </div>
        )}

        {loadingItems ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="aspect-[4/3] animate-pulse rounded-xl bg-gray-100" />
                <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <PackageSearch size={36} className="mx-auto text-gray-400" />
            <p className="mt-3 font-bold text-gray-900">
              {favOnly ? "Belum ada barang favorit" : "Belum ada barang ditemukan"}
            </p>
            <p className="mx-auto mt-1 max-w-[420px] text-sm leading-relaxed text-gray-600">
              {favOnly
                ? wishlist.length === 0
                  ? "Ketuk ikon hati pada barang untuk menyimpannya di sini."
                  : "Tidak ada barang favorit dalam radius ini — coba perluas radius."
                : "Coba perluas radius, ganti kategori, atau jadi yang pertama membagikan barang di sekitarmu."}
            </p>
            {!favOnly && (
              <Link
                to="/tambah"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-sky-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/40 focus-visible:ring-offset-2"
              >
                Tambah barang
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-[13px] text-gray-600">
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

      <ItemDetailSheet item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
