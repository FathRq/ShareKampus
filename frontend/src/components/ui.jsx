import { Loader2 } from "lucide-react";

export function PrimaryButton({ isLoading = false, disabled = false, children, className = "", ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-signal-blue px-4 py-2.5 text-[15px] font-semibold text-white shadow-button transition-all duration-150 hover:brightness-95 active:scale-[0.97] active:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function DarkButton({ isLoading = false, disabled = false, children, className = "", ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-ink-navy px-4 py-2.5 text-[15px] font-semibold text-white transition-all duration-150 hover:opacity-95 active:scale-[0.97] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-navy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function TextInput({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-ink-navy">{label}</span>}
      <input
        {...props}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg border bg-pebble px-3.5 py-2.5 text-[15px] text-ink-navy outline-none transition-all duration-150 placeholder:text-mist-gray hover:border-mist-gray focus:border-signal-blue focus:bg-paper focus:ring-2 focus:ring-signal-blue/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-pebble/60 disabled:opacity-70 ${
          error ? "border-danger-bg focus:border-danger-text focus:ring-danger-bg/25" : "border-hairline"
        } ${className}`}
      />
      {error && <span className="mt-1 block text-[13px] font-medium text-danger-text">{error}</span>}
    </label>
  );
}

export function SelectInput({ label, error, children, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-ink-navy">{label}</span>}
      <select
        {...props}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg border bg-pebble px-3.5 py-2.5 text-[15px] text-ink-navy outline-none transition-all duration-150 hover:border-mist-gray focus:border-signal-blue focus:bg-paper focus:ring-2 focus:ring-signal-blue/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-pebble/60 disabled:opacity-70 ${
          error ? "border-danger-bg focus:border-danger-text focus:ring-danger-bg/25" : "border-hairline"
        } ${className}`}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-[13px] font-medium text-danger-text">{error}</span>}
    </label>
  );
}

export function TextArea({ label, error, rows = 3, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-ink-navy">{label}</span>}
      <textarea
        {...props}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={`min-h-[88px] w-full resize-none rounded-lg border bg-pebble px-3.5 py-2.5 text-[15px] text-ink-navy outline-none transition-all duration-150 placeholder:text-mist-gray hover:border-mist-gray focus:border-signal-blue focus:bg-paper focus:ring-2 focus:ring-signal-blue/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-pebble/60 disabled:opacity-70 ${
          error ? "border-danger-bg focus:border-danger-text focus:ring-danger-bg/25" : "border-hairline"
        } ${className}`}
      />
      {error && <span className="mt-1 block text-[13px] font-medium text-danger-text">{error}</span>}
    </label>
  );
}

export function PillBadge({ tone = "info", className = "", children }) {
  const tones = {
    info: "bg-badge-tint text-deep-cobalt",
    success: "bg-success-bg text-success-text",
    warning: "bg-warning-bg text-warning-text",
    danger: "bg-danger-bg text-danger-text",
    neutral: "bg-pebble text-slate-gray",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.info} ${className}`}
    >
      {children}
    </span>
  );
}
