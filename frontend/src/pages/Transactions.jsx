import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftRight, ImageOff } from "lucide-react";
import { transactionApi } from "../lib/api";
import { formatTanggal } from "../lib/format";
import { StatusBadge } from "../components/transactions/StatusBadge";

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

  const load = () => {
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
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

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
      <h1 className="text-3xl font-bold">Transaksi saya</h1>
      <p className="mt-2 text-[15px] text-slate-gray">
        Pantau pengajuan pinjam/barter — sebagai peminjam maupun pemilik barang.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/40 ${
              tab === t.value
                ? "bg-signal-blue text-white shadow-button"
                : "bg-pebble text-ink-navy hover:bg-hairline/60"
            }`}
          >
            {t.label}
          </button>
        ))}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="ml-auto rounded-lg border border-hairline bg-paper px-3 py-1.5 text-[13px] font-semibold outline-none transition-all duration-150 hover:border-mist-gray focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/25"
        >
          <option value="all">Semua peran</option>
          <option value="borrower">Sebagai peminjam</option>
          <option value="lender">Sebagai pemilik</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-hairline bg-paper p-4 shadow-linkcard">
              <div className="h-4 w-2/3 animate-pulse rounded bg-pebble" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-pebble" />
            </div>
          ))
        ) : err ? (
          <div className="rounded-2xl border border-hairline bg-paper p-8 text-center shadow-linkcard">
            <p className="text-sm font-semibold text-danger-text">
              {err.message || "Gagal memuat transaksi"}
            </p>
            <button
              onClick={load}
              className="mt-3 rounded-lg bg-signal-blue px-4 py-2 text-sm font-semibold text-white shadow-button transition-all duration-150 hover:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/50 focus-visible:ring-offset-2"
            >
              Coba lagi
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-hairline bg-paper p-10 text-center shadow-linkcard">
            <ArrowLeftRight size={34} className="mx-auto text-mist-gray" />
            <p className="mt-3 font-bold">Belum ada transaksi di sini</p>
            <p className="mx-auto mt-1 max-w-[420px] text-sm text-slate-gray">
              Ajukan pinjam dari katalog, atau bagikan barang agar orang lain mengajukan padamu.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex rounded-lg bg-ink-navy px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:opacity-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-navy/40 focus-visible:ring-offset-2"
            >
              Jelajahi katalog
            </Link>
          </div>
        ) : (
          filtered.map((t) => (
            <Link
              key={t.transaction_id}
              to={`/transaksi/${t.transaction_id}`}
              className="flex items-center gap-3.5 rounded-2xl border border-hairline bg-paper p-3.5 shadow-linkcard transition-all duration-150 hover:shadow-card active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/40"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-pebble">
                {t.item_cover_photo_url ? (
                  <img src={t.item_cover_photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-mist-gray">
                    <ImageOff size={20} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold">{t.item_title}</p>
                <p className="mt-0.5 truncate text-[13px] text-slate-gray">
                  {t.role === "borrower" ? "Meminjam dari" : "Dipinjam oleh"} {t.counterpart_name} •{" "}
                  {formatTanggal(t.created_at)}
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
