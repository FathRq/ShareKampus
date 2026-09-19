import { PiggyBank } from "lucide-react";
import { formatRp } from "../../lib/format";

export function ExpenseSaverCard({ stats, loading }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
          <PiggyBank size={20} />
        </span>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Total dihemat komunitas
        </p>
      </div>
      {loading ? (
        <div className="mt-3 h-9 w-48 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="mt-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-[32px] font-bold leading-none tracking-tight text-transparent">
          {formatRp(stats?.total_saved)}
        </p>
      )}
      <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
        dari {stats?.completed_transactions ?? 0} transaksi selesai pinjam/barter — hemat biaya, kurangi
        limbah barang (SDG 12).
      </p>
    </div>
  );
}
