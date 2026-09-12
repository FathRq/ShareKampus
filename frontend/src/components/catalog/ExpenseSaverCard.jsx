import { PiggyBank } from "lucide-react";
import { formatRp } from "../../lib/format";

export function ExpenseSaverCard({ stats, loading }) {
  return (
    <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-card sm:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-badge-tint text-signal-blue">
          <PiggyBank size={20} />
        </span>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-gray">
          Total dihemat komunitas
        </p>
      </div>
      {loading ? (
        <div className="mt-3 h-9 w-48 animate-pulse rounded bg-pebble" />
      ) : (
        <p className="mt-3 text-[32px] font-bold leading-none text-signal-blue">
          {formatRp(stats?.total_saved)}
        </p>
      )}
      <p className="mt-2 text-[13px] text-slate-gray">
        dari {stats?.completed_transactions ?? 0} transaksi selesai pinjam/barter — hemat biaya, kurangi
        limbah barang (SDG 12).
      </p>
    </div>
  );
}
