import { useEffect, useRef, useState } from "react";
import { X, MapPin, ImageOff } from "lucide-react";
import { transactionApi } from "../../lib/api";
import { CATEGORY_LABEL, ERROR_MESSAGE_ID, TX_TYPE_LABEL, formatJarak, formatRp } from "../../lib/format";
import { useToast } from "../../context/ToastContext";
import { TrustBadge } from "./TrustBadge";
import { PrimaryButton, TextArea, TextInput } from "../ui";

/**
 * Bottom sheet (mobile) / centered modal (desktop) for item detail + ajukan pinjam.
 * POST /transactions { item_id, meeting_scheduled_at?, notes? }.
 */
export function ItemDetailSheet({ item, onClose }) {
  const { push } = useToast();
  const [meetingAt, setMeetingAt] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(null);

  const [prevId, setPrevId] = useState(item?.item_id);
  const closeRef = useRef(null);
  if (prevId !== item?.item_id) {
    setPrevId(item?.item_id);
    setMeetingAt("");
    setNotes("");
    setErr(null);
    setDone(null);
  }

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Kunci scroll body + fokus ke tombol tutup saat sheet terbuka;
  // kembalikan scroll & fokus saat ditutup.
  const itemId = item?.item_id;
  useEffect(() => {
    if (!itemId) return;
    const previouslyFocused = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [itemId]);

  if (!item) return null;

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setErr(null);
    try {
      const payload = { item_id: item.item_id };
      if (meetingAt) payload.meeting_scheduled_at = new Date(meetingAt).toISOString();
      if (notes.trim()) payload.notes = notes.trim();
      const data = await transactionApi.create(payload);
      setDone(data);
      push("Pengajuan terkirim! Pantau di halaman Transaksi.");
    } catch (e2) {
      setErr(e2);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[92dvh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-md md:inset-0 md:m-auto md:h-fit md:max-h-[90vh] md:max-w-[560px] md:rounded-3xl md:p-7">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200 md:hidden" />
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-600 transition-all duration-150 hover:bg-gray-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <X size={20} />
        </button>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
          {item.cover_photo_url ? (
            <img src={item.cover_photo_url} alt={item.title} className="aspect-[16/10] w-full object-cover" />
          ) : (
            <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-1 text-gray-400">
              <ImageOff size={30} />
              <span className="text-xs">Tanpa foto</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-bold text-primary-dark">
            {TX_TYPE_LABEL[item.transaction_type] || item.transaction_type}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
            {CATEGORY_LABEL[item.category] || item.category}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
            {item.resource_code}
          </span>
        </div>

        <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight text-gray-900">{item.title}</h2>
        <p className="mt-1 text-[15px] font-bold text-primary-dark">{formatRp(item.market_price)}</p>
        <p className="mt-1.5 inline-flex items-center gap-1 text-[13px] text-gray-600">
          <MapPin size={14} /> {formatJarak(item.distance_meter)} dari kamu
        </p>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-100 p-3.5">
          <div>
            <p className="text-sm font-bold text-gray-900">{item.owner_name}</p>
            <p className="text-xs text-gray-600">
              {item.owner_avg_rating == null
                ? "Belum ada ulasan"
                : `Rating ${Number(item.owner_avg_rating).toFixed(1)} (${item.owner_review_count || 0} ulasan)`}
            </p>
          </div>
          <TrustBadge score={item.owner_trust_score} />
        </div>

        {done ? (
          <div className="mt-5 rounded-xl bg-success-bg p-4 text-sm font-medium text-success-text">
            Pengajuan terkirim! Barang tetap terlihat di katalog sampai pemilik menyetujui. Pantau di
            halaman Transaksi.
            <div className="mt-3 flex gap-2">
              <a
                href="/transaksi"
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-dark active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              >
                Lihat Transaksi
              </a>
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-150 hover:bg-gray-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3 border-t border-gray-200 pt-4">
            <p className="text-sm font-bold text-gray-900">Ajukan pinjam / barter</p>
            <TextInput
              label="Jadwal ketemuan (opsional)"
              type="datetime-local"
              value={meetingAt}
              onChange={(e) => setMeetingAt(e.target.value)}
              className="text-sm"
            />
            <TextArea
              label="Catatan untuk pemilik (opsional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Bisa ambil di gerbang kampus jam 15.00"
              className="text-sm"
            />
            {err && (
              <p className="rounded-lg bg-danger-bg px-3 py-2 text-[13px] font-medium text-danger-text">
                {ERROR_MESSAGE_ID[err.code] || err.message}
              </p>
            )}
            <PrimaryButton type="submit" isLoading={sending} className="w-full">
              Kirim pengajuan
            </PrimaryButton>
          </form>
        )}
      </div>
    </div>
  );
}
