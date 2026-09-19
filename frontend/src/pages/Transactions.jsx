import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftRight, ImageOff, RotateCw } from "lucide-react";
import { transactionApi } from "../lib/api";
import { formatRelatif } from "../lib/format";
import { StatusBadge } from "../components/transactions/StatusBadge";
import { Dropdown } from "../components/Dropdown";

const TABS = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "active", label: "Aktif" },
  { value: "returned", label: "Selesai" },
];

export function TransactionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [tab, setTab] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all"); // all|borrower|lender
  const lastLoadRef = useRef(0);

  const load = useCallback(() => {
    lastLoadRef.current = Date.now();
    setLoading(true);
    setErr(null);
    transactionApi
      .list()
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch((e) => {
        setItems([]);
        setErr(e);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // Muat ulang saat tab kembali fokus — throttle 10 dtk anti-spam request.
    const maybeReload = () => {
      if (document.hidden) return;
      if (Date.now() - lastLoadRef.current < 10000) return;
      load();
    };
    window.addEventListener("focus", maybeReload);
    document.addEventListener("visibilitychange", maybeReload);
    return () => {
      window.removeEventListener("focus", maybeReload);
      document.removeEventListener("visibilitychange", maybeReload);
    };
  }, [load]);

  const filtered = useMemo(
    () =>
      items.filter(
        (t) =>
          (tab === "all" || t.status === tab) &&
          (roleFilter === "all" || t.role === roleFilter)
      ),
    [items, tab, roleFilter]
  );

  return (
    <div className="mx-auto w-full max-w-[800px]">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transaksi saya</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
        Pantau pengajuan pinjam atau barter sebagai peminjam maupun pemilik barang.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              tab === t.value
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200/70"
            }`}
          >
            {t.label}
          </button>
        ))}
        <Dropdown
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: "all", label: "Semua peran" },
            { value: "borrower", label: "Sebagai peminjam" },
            { value: "lender", label: "Sebagai pemilik" },
          ]}
          title="Filter peran transaksi"
          align="left"
        />
        <button
          onClick={load}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-primary-dark transition-all duration-150 hover:bg-primary-light active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <RotateCw size={14} /> Muat ulang
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
            </div>
          ))
        ) : err ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-danger-text">
              {err.message || "Gagal memuat transaksi"}
            </p>
            <button
              onClick={load}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              Coba lagi
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <ArrowLeftRight size={34} className="mx-auto text-gray-400" />
            <p className="mt-3 font-bold text-gray-900">Belum ada transaksi di sini</p>
            <p className="mx-auto mt-1 max-w-[420px] text-sm leading-relaxed text-gray-600">
              Ajukan pinjam dari katalog, atau bagikan barang agar orang lain mengajukan padamu.
            </p>
            <Link
              to="/katalog"
              className="mt-4 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-gray-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/40 focus-visible:ring-offset-2"
            >
              Jelajahi katalog
            </Link>
          </div>
        ) : (
          filtered.map((t) => (
            <Link
              key={t.transaction_id}
              to={`/transaksi/${t.transaction_id}`}
              className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {t.item_cover_photo_url ? (
                  <img src={t.item_cover_photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <ImageOff size={20} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-gray-900">{t.item_title}</p>
                <p className="mt-0.5 truncate text-[13px] text-gray-600">
                  {t.role === "borrower" ? "Meminjam dari" : "Dipinjam oleh"} {t.counterpart_name} •{" "}
                  {formatRelatif(t.created_at)}
                </p>
              </div>
              <StatusBadge status={t.status} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
