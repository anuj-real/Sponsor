import { useState } from 'react';
import { CommissionPayout } from '../types';
import { CheckCircle, DollarSign } from 'lucide-react';

/**
 * Commission payouts desk: status-filter tiles (which double as the summary)
 * plus the payout list — mobile cards below `sm`, full table above.
 *
 * Shared between the AdminPanel PAYOUTS sub-tab and the /payouts route.
 * Sanction/dispatch buttons render only when the handlers are provided, so the
 * same component serves the read-only channel-partner view (pass the agent's
 * own payouts and omit the handlers).
 */
interface PayoutsDeskProps {
  payouts: CommissionPayout[];
  onApprovePayout?: (payoutId: string) => void;
  onDisbursePayout?: (payoutId: string) => void;
}

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'DISBURSED';

const formatPoints = (val: number) => `${Math.round(val).toLocaleString()} PTS`;

const statusChipClasses = (status: CommissionPayout['status']) =>
  status === 'PENDING'
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : status === 'APPROVED'
    ? 'bg-blue-50 text-blue-800 border-blue-200'
    : 'bg-emerald-50 text-emerald-800 border-emerald-200';

export default function PayoutsDesk({ payouts, onApprovePayout, onDisbursePayout }: PayoutsDeskProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const filtered = statusFilter === 'ALL' ? payouts : payouts.filter(p => p.status === statusFilter);

  const emptyMessage =
    payouts.length === 0
      ? 'No commission disbursements recorded yet. Create a plot booking first.'
      : `No ${statusFilter.toLowerCase()} payouts right now.`;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Status filter doubling as the summary: each tile shows count + net
          total for its bucket and filters the list below when tapped. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {([
          { key: 'ALL' as const, label: 'All Payouts', accent: 'text-stone-900' },
          { key: 'PENDING' as const, label: 'Pending', accent: 'text-amber-700' },
          { key: 'APPROVED' as const, label: 'Approved', accent: 'text-blue-800' },
          { key: 'DISBURSED' as const, label: 'Disbursed', accent: 'text-emerald-800' },
        ]).map(({ key, label, accent }) => {
          const bucket = key === 'ALL' ? payouts : payouts.filter(p => p.status === key);
          const isActive = statusFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`text-left rounded-xl sm:rounded-2xl border p-3 sm:p-4 shadow-xs transition-all cursor-pointer ${
                isActive
                  ? 'border-emerald-800 bg-emerald-50 ring-1 ring-emerald-800/20'
                  : 'border-stone-200 bg-white hover:bg-stone-50'
              }`}
            >
              <span className="text-[9px] sm:text-[10px] font-bold text-stone-500 uppercase tracking-wider block truncate">
                {label} ({bucket.length})
              </span>
              <span className={`text-sm sm:text-xl font-bold font-mono block mt-0.5 ${accent}`}>
                {formatPoints(bucket.reduce((acc, p) => acc + p.netCommission, 0))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/50 flex justify-between items-center flex-col md:flex-row gap-2 md:gap-4">
          <div>
            <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wide">SBR Operations Audit & Commission Desk</h3>
            <p className="text-xs text-stone-500 mt-1 hidden sm:block">Track computed override lines, hold payouts for compliance, or dispatch verified bank disbursements.</p>
            {statusFilter !== 'ALL' && (
              <p className="text-[10.5px] text-emerald-800 font-semibold mt-1">
                Showing {filtered.length} {statusFilter.toLowerCase()} payout{filtered.length === 1 ? '' : 's'} ·{' '}
                <button type="button" onClick={() => setStatusFilter('ALL')} className="underline cursor-pointer">clear filter</button>
              </p>
            )}
          </div>
        </div>

        {/* Mobile: one card per payout — gross → deductions → net, then the action */}
        <div className="sm:hidden divide-y divide-stone-200">
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-stone-400 text-xs font-medium">{emptyMessage}</p>
          ) : (
            filtered.map((pay) => (
              <div key={pay.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900 text-sm truncate">{pay.agentName}</p>
                    <p className="text-[10px] text-stone-500 font-mono mt-0.5">{pay.agentId} · {pay.id}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase rounded px-2 py-0.5 border shrink-0 ${statusChipClasses(pay.status)}`}>
                    {pay.status}
                  </span>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-[10.5px] font-mono space-y-1">
                  <div className="flex justify-between"><span className="text-stone-500">Gross</span><span className="font-bold text-stone-800">{formatPoints(pay.grossCommission)}</span></div>
                  <div className="flex justify-between"><span className="text-stone-500">TDS (194H)</span><span className="text-rose-600">-{formatPoints(pay.tdsDeduction)}</span></div>
                  <div className="flex justify-between"><span className="text-stone-500">Admin Fee</span><span className="text-stone-500">-{formatPoints(pay.adminFee)}</span></div>
                  <div className="flex justify-between border-t border-stone-200 pt-1 mt-1"><span className="font-bold text-stone-700">Net Release</span><span className="font-bold text-emerald-800">{formatPoints(pay.netCommission)}</span></div>
                </div>

                {pay.status === 'PENDING' && onApprovePayout && (
                  <button
                    onClick={() => onApprovePayout(pay.id)}
                    className="w-full py-2.5 text-[11px] font-bold rounded-lg bg-emerald-800 active:bg-emerald-900 text-white cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Sanction Payout
                  </button>
                )}
                {pay.status === 'APPROVED' && onDisbursePayout && (
                  <button
                    onClick={() => onDisbursePayout(pay.id)}
                    className="w-full py-2.5 text-[11px] font-bold rounded-lg bg-emerald-800 active:bg-emerald-900 text-white cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Confirm Bank Dispatch
                  </button>
                )}
                {pay.status === 'DISBURSED' && (
                  <p className="text-[10.5px] text-emerald-700 font-bold text-center">✓ Cleared RTGS transfer</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                <th className="px-5 py-3">Payout ID</th>
                <th className="px-5 py-3">Beneficiary Sponsor</th>
                <th className="px-5 py-3 font-mono">Gross Calculated</th>
                <th className="px-5 py-3 font-mono">TDS Withheld (194H)</th>
                <th className="px-5 py-3 font-mono">Admin Retained</th>
                <th className="px-5 py-3 font-mono">Net Release</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Auditing Clearances</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-stone-400 font-medium font-sans">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filtered.map((pay) => (
                  <tr key={pay.id} className="hover:bg-stone-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold font-mono text-stone-900">{pay.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-stone-900">{pay.agentName}</p>
                      <p className="text-[9.5px] text-stone-500 mt-0.5 font-mono">{pay.agentId}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-stone-600 font-bold">{formatPoints(pay.grossCommission)}</td>
                    <td className="px-5 py-3.5 font-mono text-rose-600">-{formatPoints(pay.tdsDeduction)}</td>
                    <td className="px-5 py-3.5 font-mono text-stone-500">-{formatPoints(pay.adminFee)}</td>
                    <td className="px-5 py-3.5 font-bold text-stone-900 font-mono text-emerald-800">{formatPoints(pay.netCommission)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[9.5px] font-bold uppercase rounded px-2 py-0.5 border ${statusChipClasses(pay.status)}`}>
                        <span className={`w-1 h-1 rounded-full ${
                          pay.status === 'PENDING' ? 'bg-amber-600' : pay.status === 'APPROVED' ? 'bg-blue-600' : 'bg-emerald-600'
                        }`} />
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-sans">
                      {pay.status === 'PENDING' && onApprovePayout && (
                        <button
                          onClick={() => onApprovePayout(pay.id)}
                          className="px-2.5 py-1 text-[10.5px] font-bold rounded bg-emerald-800 hover:bg-emerald-900 text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Sanction Payout
                        </button>
                      )}
                      {pay.status === 'APPROVED' && onDisbursePayout && (
                        <button
                          onClick={() => onDisbursePayout(pay.id)}
                          className="px-2.5 py-1 text-[10.5px] font-bold rounded bg-emerald-800 hover:bg-emerald-900 text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-1 animate-pulse"
                        >
                          <DollarSign className="w-3.5 h-3.5" /> Confirm Bank Dispatch
                        </button>
                      )}
                      {pay.status === 'PENDING' && !onApprovePayout && (
                        <span className="text-[10px] text-stone-400 font-medium">Awaiting sanction</span>
                      )}
                      {pay.status === 'APPROVED' && !onDisbursePayout && (
                        <span className="text-[10px] text-stone-400 font-medium">Awaiting bank release</span>
                      )}
                      {pay.status === 'DISBURSED' && (
                        <span className="text-[10px] text-emerald-700 font-bold block leading-relaxed font-sans">
                          Cleared RTGS transfer
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
