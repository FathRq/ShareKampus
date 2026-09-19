import { useState } from "react";
import { Heart, ImageOff, MapPin, Star } from "lucide-react";
import { CATEGORY_LABEL, TX_TYPE_LABEL, formatJarak, formatRp } from "../../lib/format";
import { isFav, toggleFav } from "../../lib/wishlist";
import { TrustBadge } from "./TrustBadge";

export function ItemCard({ item, onOpen }) {
  const [fav, setFav] = useState(() => isFav(item.item_id));
  const rating =
    item.owner_avg_rating == null
      ? "Belum ada ulasan"
      : `★ ${Number(item.owner_avg_rating).toFixed(1)} (${item.owner_review_count || 0})`;

  return (
    <button
      onClick={() => onOpen?.(item)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {item.cover_photo_url ? (
          <img
            src={item.cover_photo_url}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400">
            <ImageOff size={28} />
            <span className="text-[11px] font-medium">Tanpa foto</span>
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-bold text-primary-dark">
          {TX_TYPE_LABEL[item.transaction_type] || item.transaction_type}
        </span>
        {/* span (bukan button): root kartu sudah berupa <button> */}
        <span
          role="switch"
          aria-checked={fav}
          tabIndex={0}
          aria-label={fav ? "Hapus dari favorit" : "Simpan ke favorit"}
          onClick={(e) => {
            e.stopPropagation();
            setFav(toggleFav(item.item_id).includes(item.item_id));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              setFav(toggleFav(item.item_id).includes(item.item_id));
            }
          }}
          className="absolute left-2 top-2 cursor-pointer rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Heart
            size={16}
            className={fav ? "fill-rose-500 text-rose-500" : "text-gray-400"}
          />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{item.title}</p>
        <p className="text-xs text-gray-600">
          {CATEGORY_LABEL[item.category] || item.category} • {formatRp(item.market_price)}
        </p>
        <p className="inline-flex items-center gap-1 text-xs text-gray-600">
          <MapPin size={12} /> {formatJarak(item.distance_meter)} dari kamu
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <span className="max-w-[55%] truncate text-xs font-medium text-gray-600">
            {item.owner_name}
          </span>
          <span className="flex items-center gap-1.5">
            <TrustBadge score={item.owner_trust_score} />
          </span>
        </div>
        <p className="inline-flex items-center gap-1 text-[11px] text-gray-400">
          <Star size={11} /> {rating}
        </p>
      </div>
    </button>
  );
}
