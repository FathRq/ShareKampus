import { ShieldCheck } from "lucide-react";

export function TrustBadge({ score, className = "" }) {
  const s = Number(score) || 0;
  const tone = s >= 80 ? "success" : s >= 50 ? "warning" : "danger";
  const tones = {
    success: "bg-success-bg text-success-text",
    warning: "bg-warning-bg text-warning-text",
    danger: "bg-danger-bg text-danger-text",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${tones[tone]} ${className}`}
      title={`Trust score ${s}`}
    >
      <ShieldCheck size={12} />
      {Number.isInteger(s) ? s : s.toFixed(0)}
    </span>
  );
}
