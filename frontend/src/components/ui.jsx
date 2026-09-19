import { Loader2 } from "lucide-react";

export function PrimaryButton({ isLoading = false, disabled = false, children, className = "", ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[15px] font-semibold text-white shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md ${className}`}
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-[15px] font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm ${className}`}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function TextInput({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-gray-900">{label}</span>}
      <input
        {...props}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg border bg-gray-100 px-3.5 py-2.5 text-[15px] text-gray-900 outline-none transition-all duration-150 placeholder:text-gray-400 hover:border-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-gray-100/60 disabled:opacity-70 ${
          error ? "border-danger-bg focus:border-danger-text focus:ring-danger-bg/25" : "border-gray-200"
        } ${className}`}
      />
      {error && <span className="mt-1 block text-[13px] font-medium text-danger-text">{error}</span>}
    </label>
  );
}

export function SelectInput({ label, error, children, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-gray-900">{label}</span>}
      <select
        {...props}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg border bg-gray-100 px-3.5 py-2.5 text-[15px] text-gray-900 outline-none transition-all duration-150 hover:border-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-gray-100/60 disabled:opacity-70 ${
          error ? "border-danger-bg focus:border-danger-text focus:ring-danger-bg/25" : "border-gray-200"
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
      {label && <span className="mb-1.5 block text-sm font-semibold text-gray-900">{label}</span>}
      <textarea
        {...props}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={`min-h-[88px] w-full resize-none rounded-lg border bg-gray-100 px-3.5 py-2.5 text-[15px] text-gray-900 outline-none transition-all duration-150 placeholder:text-gray-400 hover:border-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-gray-100/60 disabled:opacity-70 ${
          error ? "border-danger-bg focus:border-danger-text focus:ring-danger-bg/25" : "border-gray-200"
        } ${className}`}
      />
      {error && <span className="mt-1 block text-[13px] font-medium text-danger-text">{error}</span>}
    </label>
  );
}

export function PillBadge({ tone = "info", className = "", children }) {
  const tones = {
    info: "bg-primary-light text-primary-dark",
    success: "bg-success-bg text-success-text",
    warning: "bg-warning-bg text-warning-text",
    danger: "bg-danger-bg text-danger-text",
    neutral: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.info} ${className}`}
    >
      {children}
    </span>
  );
}
