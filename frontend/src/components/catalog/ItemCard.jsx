import { ImageOff, MapPin, Star } from "lucide-react";
import { CATEGORY_LABEL, TX_TYPE_LABEL, formatJarak, formatRp } from "../../lib/format";
import { TrustBadge } from "./TrustBadge";

export function ItemCard({ item, onOpen }) {
  const rating =
    item.owner_avg_rating == null
      ? "Belum ada ulasan"
      : `★ ${Number(item.owner_avg_rating).toFixed(1)} (${item.owner_review_count || 0})`;

  return (
    <button
      onClick={() => onOpen?.(item)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-paper text-left shadow-linkcard transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-pebble">
        {item.cover_photo_url ? (
          <img
            src={item.cover_photo_url}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-mist-gray">
            <ImageOff size={28} />
            <span className="text-[11px] font-medium">Tanpa foto</span>
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-badge-tint px-2 py-0.5 text-[11px] font-bold text-deep-cobalt">
          {TX_TYPE_LABEL[item.transaction_type] || item.transaction_type}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">{item.title}</p>
        <p className="text-xs text-slate-gray">
          {CATEGORY_LABEL[item.category] || item.category} • {formatRp(item.market_price)}
        </p>
        <p className="inline-flex items-center gap-1 text-xs text-slate-gray">
          <MapPin size={12} /> {formatJarak(item.distance_meter)} dari kamu
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <span className="max-w-[55%] truncate text-xs font-medium text-slate-gray">
            {item.owner_name}
          </span>
          <span className="flex items-center gap-1.5">
            <TrustBadge score={item.owner_trust_score} />
          </span>
        </div>
        <p className="inline-flex items-center gap-1 text-[11px] text-mist-gray">
          <Star size={11} /> {rating}
        </p>
      </div>
    </button>
  );
}
