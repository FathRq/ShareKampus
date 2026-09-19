import { useEffect } from "react";
import { X } from "lucide-react";

export function ConfirmDialog({
  open,
  title = "Yakin?",
  message,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel?.();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="alertdialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px] animate-fade" onClick={onCancel} />
      <div className="absolute inset-0 m-auto h-fit max-h-[90dvh] w-[calc(100%-2rem)] max-w-[420px] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl animate-dialog md:rounded-3xl">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup"
          className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <X size={18} />
        </button>
        <div className="flex items-start gap-3.5">
          <div className="min-w-0 pt-0.5">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">{title}</h2>
            {message && <p className="mt-1 text-[15px] leading-relaxed text-gray-600">{message}</p>}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-150 hover:bg-gray-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md ${
              danger
                ? "bg-danger-text hover:brightness-110 focus-visible:ring-danger-bg"
                : "bg-primary hover:bg-primary-dark focus-visible:ring-primary/50"
            }`}
          >
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
