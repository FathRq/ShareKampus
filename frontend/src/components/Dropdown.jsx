import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

/**
 * Dropdown kustom pengganti <select> bawaan agar panel bisa dianimasikan
 * slide-down + konsisten dengan desain (popup bawaan OS tak bisa di-CSS).
 * Keyboard: Enter/Spasi/↓ membuka, ↑↓ navigasi, Enter memilih, Esc menutup.
 */
export function Dropdown({
  value,
  onChange,
  options = [],
  title,
  align = "right",
  buttonClassName = "",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();
  const selected = options.find((o) => String(o.value) === String(value)) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    // Fokus ke opsi terpilih saat panel dibuka
    listRef.current?.querySelector('[aria-selected="true"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const focusSibling = (dir) => {
    const items = Array.from(listRef.current?.querySelectorAll("button") ?? []);
    const idx = items.indexOf(document.activeElement);
    const next = items[(idx + dir + items.length) % items.length];
    next?.focus();
  };

  const focusEdge = (first) => {
    const items = listRef.current?.querySelectorAll("button");
    (first ? items?.[0] : items?.[items.length - 1])?.focus();
  };

  const pick = (v) => {
    onChange?.(v);
    setOpen(false);
    btnRef.current?.focus();
  };

  return (
    <div ref={rootRef} className={`relative inline-block min-w-0 max-w-full ${className}`}>
      <button
        ref={btnRef}
        type="button"
        title={title}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-gray-900 outline-none transition-all duration-150 hover:border-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/25 ${buttonClassName}`}
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={title}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              focusSibling(1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              focusSibling(-1);
            } else if (e.key === "Home") {
              e.preventDefault();
              focusEdge(true);
            } else if (e.key === "End") {
              e.preventDefault();
              focusEdge(false);
            }
          }}
          className={`absolute z-50 mt-1.5 max-w-[calc(100vw-2rem)] min-w-full origin-top overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg animate-dropdown ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((o) => {
            const active = String(o.value) === String(value);
            return (
              <button
                key={String(o.value)}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => pick(o.value)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold break-words transition-colors focus-visible:outline-none focus-visible:bg-primary-light ${
                  active ? "bg-primary-light text-primary-dark" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="min-w-0 flex-1">{o.label}</span>
                {active && <Check size={15} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
