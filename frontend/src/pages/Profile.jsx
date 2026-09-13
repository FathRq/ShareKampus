import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Plus, ShieldCheck, Star, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { campusApi, itemApi, userApi } from "../lib/api";
import { ERROR_MESSAGE_ID, formatRp } from "../lib/format";
import { PrimaryButton } from "../components/ui";
import { TrustBadge } from "../components/catalog/TrustBadge";

function Bar({ label, value, display }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-semibold text-slate-gray">{label}</span>
        <span className="font-bold">{display}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-pebble">
        <div className="h-full rounded-full bg-signal-blue" style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, logout, refreshMe } = useAuth();
  const navigate = useNavigate();
  const [breakdown, setBreakdown] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteErr, setDeleteErr] = useState(null);

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    userApi.trustScore(user.id).then(setBreakdown).catch(() => setBreakdown(null));
  }, [user?.id]);

  // Workaround: backend has no my-items endpoint — filter nearby by owner_id
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const locs = await campusApi.listLocations();
        const base = locs[0]
          ? { lat: locs[0].latitude, lng: locs[0].longitude }
          : { lat: -7.314146, lng: 112.726428 };
        const data = await itemApi.nearby({ lat: base.lat, lng: base.lng, radius: 10000 });
        if (!alive) return;
        setMyItems((Array.isArray(data) ? data : []).filter((it) => it.owner_id === user?.id));
      } catch {
        if (alive) setMyItems([]);
      } finally {
        if (alive) setLoadingItems(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  const handleDelete = async (id) => {
    if (!confirm("Hapus barang ini dari katalog?")) return;
    setDeletingId(id);
    setDeleteErr(null);
    try {
      await itemApi.remove(id);
      setMyItems((prev) => prev.filter((it) => it.item_id !== id));
    } catch (e) {
      setDeleteErr(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-[640px] space-y-4">
      {/* PROFIL */}
      <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-navy text-xl font-bold text-white">
            {(user?.full_name || user?.email || "?").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold">{user?.full_name || "—"}</h1>
            <p className="truncate text-sm text-slate-gray">{user?.email}</p>
            <p className="mt-0.5 text-[13px] text-slate-gray">
              {user?.campus_name}
              {user?.campus_location_name ? ` — ${user.campus_location_name}` : ""}
            </p>
          </div>
          <TrustBadge score={user?.trust_score ?? 0} />
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-danger-text hover:bg-danger-bg"
        >
          <LogOut size={15} /> Keluar
        </button>
      </div>

      {/* TRUST BREAKDOWN */}
      <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-linkcard sm:p-6">
        <p className="flex items-center gap-1.5 text-sm font-bold">
          <ShieldCheck size={16} className="text-signal-blue" /> Rincian Trust Score
        </p>
        {!breakdown ? (
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-pebble" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-pebble" />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-signal-blue">
                {Number(breakdown.trust_score).toFixed(0)}
              </span>
              <span className="text-sm text-slate-gray">/ 100</span>
              <span className="ml-auto inline-flex items-center gap-1 text-sm text-slate-gray">
                <Star size={14} /> {Number(breakdown.avg_rating).toFixed(1)} ({breakdown.review_count} ulasan)
              </span>
            </div>
            <Bar label="Ketepatan kembali" value={breakdown.on_time_ratio} display={`${Math.round(breakdown.on_time_ratio * 100)}%`} />
            <Bar label="Penyelesaian transaksi" value={breakdown.completion_ratio} display={`${Math.round(breakdown.completion_ratio * 100)}%`} />
            <p className="text-[13px] text-slate-gray">
              {breakdown.total_transactions} total transaksi • Skor dihitung otomatis tiap transaksi selesai.
            </p>
          </div>
        )}
      </div>

      {/* BARANG SAYA */}
      <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-linkcard sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Barang saya ({myItems.length})</p>
          <Link
            to="/tambah"
            className="inline-flex items-center gap-1 rounded-lg bg-ink-navy px-3 py-1.5 text-[13px] font-semibold text-white"
          >
            <Plus size={14} /> Tambah
          </Link>
        </div>
        {loadingItems ? (
          <div className="mt-3 h-12 animate-pulse rounded-xl bg-pebble" />
        ) : myItems.length === 0 ? (
          <p className="mt-3 text-sm text-slate-gray">
            Belum ada barang tampil di katalog. Tambahkan barang pertamamu!
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-hairline">
            {myItems.map((it) => (
              <li key={it.item_id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{it.title}</p>
                  <p className="text-xs text-slate-gray">
                    {it.resource_code} • {formatRp(it.market_price)} • {it.status}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(it.item_id)}
                  disabled={deletingId === it.item_id}
                  className="rounded-lg p-2 text-danger-text hover:bg-danger-bg disabled:opacity-50"
                  title="Hapus barang"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {deleteErr && (
          <p className="mt-3 rounded-lg bg-danger-bg px-3 py-2 text-[13px] font-medium text-danger-text">
            {ERROR_MESSAGE_ID[deleteErr.code] || deleteErr.message}
          </p>
        )}
      </div>

      <Link to="/" className="block">
        <PrimaryButton className="w-full">Kembali ke katalog</PrimaryButton>
      </Link>
    </div>
  );
}
