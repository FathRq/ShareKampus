import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Plus, ShieldCheck, Star, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { campusApi, itemApi, userApi } from "../lib/api";
import { ERROR_MESSAGE_ID, formatRp } from "../lib/format";
import { PrimaryButton } from "../components/ui";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { TrustBadge } from "../components/catalog/TrustBadge";

function Bar({ label, value, display }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-semibold text-gray-500">{label}</span>
        <span className="font-bold text-gray-900">{display}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-500" style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, logout, refreshMe } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [breakdown, setBreakdown] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
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
    setConfirmDeleteId(null);
    setDeletingId(id);
    setDeleteErr(null);
    try {
      await itemApi.remove(id);
      setMyItems((prev) => prev.filter((it) => it.item_id !== id));
      push("Barang dihapus dari katalog.");
    } catch (e) {
      setDeleteErr(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    setShowLogout(true);
  };

  const confirmLogout = () => {
    setShowLogout(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-[640px] space-y-4">
      {/* PROFIL */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-xl font-bold text-white">
            {(user?.full_name || user?.email || "?").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight text-gray-900">{user?.full_name || "—"}</h1>
            <p className="truncate text-sm text-gray-600">{user?.email}</p>
            <p className="mt-0.5 text-[13px] text-gray-600">
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
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
          <ShieldCheck size={16} className="text-primary" /> Rincian Trust Score
        </p>
        {!breakdown ? (
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                {Number(breakdown.trust_score).toFixed(0)}
              </span>
              <span className="text-sm text-gray-600">/ 100</span>
              <span className="ml-auto inline-flex items-center gap-1 text-sm text-gray-600">
                <Star size={14} /> {Number(breakdown.avg_rating).toFixed(1)} ({breakdown.review_count} ulasan)
              </span>
            </div>
            <Bar label="Ketepatan kembali" value={breakdown.on_time_ratio} display={`${Math.round(breakdown.on_time_ratio * 100)}%`} />
            <Bar label="Penyelesaian transaksi" value={breakdown.completion_ratio} display={`${Math.round(breakdown.completion_ratio * 100)}%`} />
            <p className="text-[13px] leading-relaxed text-gray-600">
              {breakdown.total_transactions} total transaksi • Skor dihitung otomatis tiap transaksi selesai.
            </p>
          </div>
        )}
      </div>

      {/* BARANG SAYA */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-900">Barang saya ({myItems.length})</p>
          <Link
            to="/tambah"
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-500 to-sky-500 px-3 py-1.5 text-[13px] font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 sm:w-auto"
          >
            <Plus size={14} /> Tambah
          </Link>
        </div>
        {loadingItems ? (
          <div className="mt-3 h-12 animate-pulse rounded-xl bg-gray-100" />
        ) : myItems.length === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Belum ada barang tampil di katalog. Tambahkan barang pertamamu!
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200">
            {myItems.map((it) => (
              <li key={it.item_id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">{it.title}</p>
                  <p className="text-xs text-gray-600">
                    {it.resource_code} • {formatRp(it.market_price)} • {it.status}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDeleteId(it.item_id)}
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

      <Link to="/katalog" className="block">
        <PrimaryButton className="w-full">Kembali ke katalog</PrimaryButton>
      </Link>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Hapus barang?"
        message="Barang akan hilang dari katalog. Jika sedang ada transaksi aktif, selesaikan dulu sebelum menghapus."
        confirmLabel="Ya, hapus"
        loading={deletingId !== null}
        onConfirm={() => handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <ConfirmDialog
        open={showLogout}
        title="Keluar dari akun?"
        message="Kamu harus masuk lagi untuk meminjam atau membagikan barang."
        confirmLabel="Ya, keluar"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogout(false)}
      />
    </div>
  );
}
