/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const ToastContext = createContext(null);

const TONES = {
  success: {
    box: "border-green-200 bg-success-bg text-success-text",
    Icon: CheckCircle2,
    role: "status",
  },
  error: {
    box: "border-red-200 bg-danger-bg text-danger-text",
    Icon: AlertCircle,
    role: "alert",
  },
  info: {
    box: "border-indigo-200 bg-primary-light text-primary-dark",
    Icon: Info,
    role: "status",
  },
};

/**
 * Toast global untuk feedback aksi (kirim pengajuan, setujui/tolak,
 * hapus, tambah barang). Mobile: di atas pill BottomNav (bottom-24);
 * desktop: tumpuk kanan-bawah. Auto-hilang ±4 dtk, maks 3 tampil.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = "success") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-2), { id, message, tone: TONES[tone] ? tone : "info" }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-stretch gap-2 md:inset-x-auto md:right-8 md:bottom-8 md:w-[360px] md:items-end"
      >
        {toasts.map((t) => {
          const { box, Icon, role } = TONES[t.tone];
          return (
            <div
              key={t.id}
              role={role}
              className={`pointer-events-auto flex w-full items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-semibold shadow-lg backdrop-blur ${box}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Tutup notifikasi"
                className="shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  return ctx;
}
