import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { reviewApi, transactionApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ERROR_MESSAGE_ID, formatRp, formatTanggal, parsePointText } from "../lib/format";
import { StatusBadge } from "../components/transactions/StatusBadge";
import { DarkButton, PrimaryButton, TextArea } from "../components/ui";

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="shrink-0 text-[13px] font-semibold text-slate-gray">{label}</span>
      <span className="text-right text-sm font-medium break-words">{children}</span>
    </div>
  );
}

export function TransactionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [acting, setActing] = useState(null); // status being submitted
  const [actionErr, setActionErr] = useState(null);

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewErr, setReviewErr] = useState(null);
  const [reviewDone, setReviewDone] = useState(false);

  const load = () => {
    setLoading(true);
    setErr(null);
    transactionApi
      .detail(id)
      .then((d) => setDetail(d))
      .catch((e) => {
        setDetail(null);
        setErr(e);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const doAction = async (status) => {
    setActing(status);
    setActionErr(null);
    try {
      await transactionApi.updateStatus(id, { status });
      await load();
    } catch (e) {
      setActionErr(e);
    } finally {
      setActing(null);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewSending(true);
    setReviewErr(null);
    try {
      await reviewApi.create({
        transaction_id: id,
        rating: Number(rating),
        comment: comment.trim() || undefined,
      });
      setReviewDone(true);
    } catch (e2) {
      setReviewErr(e2);
    } finally {
      setReviewSending(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[640px] space-y-3">
        <div className="h-7 w-48 animate-pulse rounded bg-pebble" />
        <div className="rounded-2xl border border-hairline bg-paper p-6 shadow-linkcard">
          <div className="h-4 w-2/3 animate-pulse rounded bg-pebble" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-pebble" />
          <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-pebble" />
        </div>
      </div>
    );
  }

  if (err || !detail) {
    return (
      <div className="mx-auto max-w-[560px] rounded-2xl border border-hairline bg-paper p-8 text-center shadow-linkcard">
        <p className="font-bold text-danger-text">
          {ERROR_MESSAGE_ID[err?.code] || err?.message || "Transaksi tidak ditemukan"}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={load} className="rounded-lg bg-signal-blue px-4 py-2 text-sm font-semibold text-white shadow-button transition-all duration-150 hover:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/50 focus-visible:ring-offset-2">
            Coba lagi
          </button>
          <Link to="/transaksi" className="rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 hover:bg-pebble active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/40">
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const me = user?.id;
  const isLender = me && detail.lender_id === me;
  const isBorrower = me && detail.borrower_id === me;
  const point = parsePointText(detail.meeting_point_text);

  return (
    <div className="mx-auto w-full max-w-[640px] space-y-4">
      <Link to="/transaksi" className="text-sm font-semibold text-signal-blue hover:underline">
        ← Kembali ke daftar
      </Link>

      <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-card sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold leading-snug break-words">{detail.item_title}</h1>
            <p className="mt-1 text-sm text-slate-gray">{formatRp(detail.item_market_price)} nilai pasar</p>
          </div>
          <StatusBadge status={detail.status} />
        </div>

        <div className="mt-4 divide-y divide-hairline border-t border-hairline">
          <Row label="Peminjam">{detail.borrower_name}</Row>
          <Row label="Pemilik">{detail.lender_name}</Row>
          <Row label="Peranmu">
            {isLender ? "Pemilik barang" : isBorrower ? "Peminjam" : "—"}
          </Row>
          <Row label="Jadwal ketemuan">{formatTanggal(detail.meeting_scheduled_at)}</Row>
          <Row label="Tenggat kembali">{formatTanggal(detail.agreed_return_date)}</Row>
          {detail.returned_at && <Row label="Dikembalikan">{formatTanggal(detail.returned_at)}</Row>}
          {point && (
            <Row label="Titik temu">
              {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
            </Row>
          )}
          {detail.notes && <Row label="Catatan">{detail.notes}</Row>}
        </div>
      </div>

      {/* AKSI STATUS */}
      {detail.status === "pending" && (isLender || isBorrower) && (
        <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-linkcard">
          <p className="text-sm font-bold">
            {isLender ? "Pengajuan masuk — setujui atau tolak" : "Menunggu persetujuan pemilik"}
          </p>
          {isLender && (
            <div className="mt-3 flex gap-2">
              <PrimaryButton onClick={() => doAction("active")} isLoading={acting === "active"} disabled={!!acting} className="flex-1">
                Setujui
              </PrimaryButton>
              <button
                onClick={() => doAction("rejected")}
                disabled={!!acting}
                className="flex-1 rounded-lg border border-hairline px-4 py-2.5 text-[15px] font-semibold text-danger-text transition-all duration-150 hover:bg-danger-bg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-bg focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {acting === "rejected" ? "Menolak..." : "Tolak"}
              </button>
            </div>
          )}
          {isBorrower && (
              <button
                onClick={() => doAction("cancelled")}
                disabled={!!acting}
                className="mt-3 w-full rounded-lg border border-hairline px-4 py-2.5 text-[15px] font-semibold text-slate-gray transition-all duration-150 hover:bg-pebble active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {acting === "cancelled" ? "Membatalkan..." : "Batalkan pengajuan"}
              </button>
          )}
          {actionErr && (
            <p className="mt-3 rounded-lg bg-danger-bg px-3 py-2 text-[13px] font-medium text-danger-text">
              {ERROR_MESSAGE_ID[actionErr.code] || actionErr.message}
            </p>
          )}
        </div>
      )}

      {detail.status === "active" && (isLender || isBorrower) && (
        <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-linkcard">
          <p className="text-sm font-bold">Barang sedang dipinjam</p>
          <p className="mt-1 text-[13px] text-slate-gray">
            Setelah barang kembali, salah satu pihak menandai selesai.
          </p>
          <DarkButton onClick={() => doAction("returned")} isLoading={acting === "returned"} disabled={!!acting} className="mt-3 w-full">
            Tandai sudah kembali
          </DarkButton>
          {actionErr && (
            <p className="mt-3 rounded-lg bg-danger-bg px-3 py-2 text-[13px] font-medium text-danger-text">
              {ERROR_MESSAGE_ID[actionErr.code] || actionErr.message}
            </p>
          )}
        </div>
      )}

      {/* REVIEW */}
      {detail.status === "returned" && (isLender || isBorrower) && (
        <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-linkcard">
          <p className="text-sm font-bold">Beri ulasan</p>
          {reviewDone ? (
            <p className="mt-2 rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success-text">
              Terima kasih! Ulasanmu tersimpan dan memengaruhi Trust Score.
            </p>
          ) : (
            <form onSubmit={submitReview} className="mt-3 space-y-3">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`${n} bintang`}
                    className={`rounded transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/50 ${n <= rating ? "text-signal-blue" : "text-mist-gray"}`}
                  >
                    <Star size={26} fill={n <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
                <span className="ml-1 text-sm font-bold">{rating}/5</span>
              </div>
              <TextArea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Ceritakan pengalaman transaksimu (opsional)"
                className="text-sm"
              />
              {reviewErr && (
                <p className="rounded-lg bg-danger-bg px-3 py-2 text-[13px] font-medium text-danger-text">
                  {ERROR_MESSAGE_ID[reviewErr.code] || reviewErr.message}
                </p>
              )}
              <PrimaryButton type="submit" isLoading={reviewSending} className="w-full">
                Kirim ulasan
              </PrimaryButton>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
