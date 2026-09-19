import { useState } from "react";
import {
  ChevronDown,
  Handshake,
  History,
  KeyRound,
  MessageCircle,
  Repeat,
  Search,
  Tag,
} from "lucide-react";
import { GUIDE_FEATURES, GUIDE_STEPS } from "../../data/guide";

const STORAGE_KEY = "sk-guide-open";

const FEATURE_ICONS = { key: KeyRound, repeat: Repeat, tag: Tag, history: History };
const STEP_ICONS = { search: Search, chat: MessageCircle, deal: Handshake };

function readStoredOpen() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === null ? true : v === "1";
  } catch {
    return true;
  }
}

/**
 * Banner panduan di atas katalog: bisa dilipat (pilihan diingat),
 * isi berupa tab Fitur | Cara Kerja dengan kartu ramping.
 * Deskripsi selalu terlihat sebagai teks (aman untuk mobile tanpa hover).
 */
export function GuideBanner() {
  const [open, setOpen] = useState(readStoredOpen);
  const [tab, setTab] = useState("fitur");

  const toggle = () => {
    setOpen((v) => {
      try {
        localStorage.setItem(STORAGE_KEY, v ? "0" : "1");
      } catch {
        /* abaikan — mode privat */
      }
      return !v;
    });
  };

  return (
    <section aria-label="Panduan ShareKampus" className="rounded-2xl border border-gray-200 bg-white/85 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-wider text-primary-dark uppercase">
            Panduan
          </p>
          <h2 className="truncate text-base font-bold tracking-tight text-gray-900 sm:text-lg">
            Cara Kerja ShareKampus
          </h2>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={open ? "Liput panduan" : "Bentangkan panduan"}
          className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-gray-600 transition-colors hover:bg-primary-light hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {open ? "Liput" : "Lihat"}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div
        className={`grid transition-all duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 px-4 pt-3 pb-4 sm:px-5">
          <div role="tablist" aria-label="Pilih panduan" className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {[
              { value: "fitur", label: "Fitur yang Bisa Kamu Pakai" },
              { value: "cara-kerja", label: "Cara Kerja" },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={tab === t.value}
                onClick={() => setTab(t.value)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  tab === t.value
                    ? "bg-white text-primary-dark shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "fitur" ? (
            <div role="tabpanel" className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {GUIDE_FEATURES.map((f) => {
                const Icon = FEATURE_ICONS[f.icon];
                return (
                  <div key={f.id} className="rounded-xl border border-gray-100 bg-white p-3">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${f.tint}`}>
                      <Icon size={17} />
                    </span>
                    <p className="mt-2 text-sm font-bold text-gray-900">{f.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-gray-600">
                      {f.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div role="tabpanel" className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {GUIDE_STEPS.map((s, i) => {
                const Icon = STEP_ICONS[s.icon];
                return (
                  <div key={s.id} className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white p-3">
                    <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white ${s.tint}`}>
                      <Icon size={18} />
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">{s.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-gray-600">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
