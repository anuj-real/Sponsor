import { useMemo, useState } from 'react';
import { User } from '../types';
import { Search, ShieldAlert } from 'lucide-react';
import MemberTable from './MemberTable';

/**
 * `/direct-members` — the first level only: everyone the signed-in user
 * personally sponsored. Deeper levels live at `/downline-members`.
 */
interface DirectMembersProps {
  users: User[];
  currentUserId?: string;
}

export default function DirectMembers({ users, currentUserId }: DirectMembersProps) {
  const [query, setQuery] = useState('');

  const me = users.find(u => u.id?.toUpperCase() === currentUserId?.toUpperCase());

  /** Direct recruits = anyone whose sponsor is the signed-in user. */
  const directs = useMemo(() => {
    const rootId = currentUserId?.toUpperCase();
    if (!rootId) return [];
    return users.filter(u => u.sponsorId?.toUpperCase() === rootId);
  }, [users, currentUserId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return directs;
    return directs.filter(m =>
      [m.id, m.name, m.fatherOrHusbandName, m.sponsorId, m.joinedDate]
        .some(v => String(v ?? '').toLowerCase().includes(q)));
  }, [directs, query]);

  if (!me) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-stone-900 font-serif">Profile not found</h3>
        <p className="text-xs text-stone-500">Could not resolve the signed-in associate.</p>
      </div>
    );
  }

  const activeCount = directs.filter(m => m.status === 'ACTIVE').length;

  return (
    <div className="space-y-3">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-stone-200 bg-stone-50/60 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wide">Direct Members</h3>
            <p className="text-[10.5px] text-stone-500 mt-0.5">
              Associates sponsored directly by {me.name}
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 shrink-0">
            {directs.length} direct
          </span>
        </div>

        <div className="p-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search name, ID, sponsor…"
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-stone-500">Total Direct</span>
              <span className="block font-mono font-bold text-sm text-stone-900">{directs.length}</span>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-stone-500">Active</span>
              <span className="block font-mono font-bold text-sm text-emerald-800">{activeCount}</span>
            </div>
          </div>
        </div>
      </div>

      <MemberTable
        members={filtered}
        emptyMessage={
          directs.length === 0
            ? 'You have not sponsored anyone directly yet.'
            : 'No direct members match this search.'
        }
      />

      <p className="text-[10px] text-stone-500 px-1">
        Showing {filtered.length} of {directs.length} direct members.
      </p>
    </div>
  );
}
