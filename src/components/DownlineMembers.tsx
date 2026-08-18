import { useMemo, useState } from 'react';
import { User } from '../types';
import { ChevronDown, ShieldAlert } from 'lucide-react';
import MemberTable from './MemberTable';

/**
 * `/downline-members` — the whole downline summarised by level.
 *
 * The top table answers "how many people sit at each level"; selecting a level
 * opens the member records for it underneath, so the summary stays readable on
 * a phone no matter how large the network gets.
 */
interface DownlineMembersProps {
  users: User[];
  currentUserId?: string;
}

export default function DownlineMembers({ users, currentUserId }: DownlineMembersProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const me = users.find(u => u.id?.toUpperCase() === currentUserId?.toUpperCase());

  /**
   * Breadth-first walk down from the signed-in user. `seen` guards against a
   * malformed sponsorId cycle, which would otherwise loop forever.
   */
  const levels = useMemo(() => {
    const rootId = currentUserId?.toUpperCase();
    if (!rootId) return [] as { level: number; members: User[] }[];

    const childrenOf = new Map<string, User[]>();
    users.forEach(u => {
      const parent = u.sponsorId?.toUpperCase();
      if (!parent) return;
      const list = childrenOf.get(parent) || [];
      list.push(u);
      childrenOf.set(parent, list);
    });

    const out: { level: number; members: User[] }[] = [];
    const seen = new Set<string>([rootId]);
    let frontier = [rootId];
    let level = 1;

    while (frontier.length) {
      const next: string[] = [];
      const members: User[] = [];
      frontier.forEach(parentId => {
        (childrenOf.get(parentId) || []).forEach(child => {
          const key = child.id?.toUpperCase();
          if (seen.has(key)) return;
          seen.add(key);
          members.push(child);
          next.push(key);
        });
      });
      if (members.length === 0) break;
      out.push({ level, members });
      frontier = next;
      level += 1;
    }
    return out;
  }, [users, currentUserId]);

  /** Level lookup so the detail table can label rows when showing everyone. */
  const levelById = useMemo(() => {
    const map = new Map<string, number>();
    levels.forEach(({ level, members }) => members.forEach(m => map.set(m.id, level)));
    return map;
  }, [levels]);

  if (!me) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-stone-900 font-serif">Profile not found</h3>
        <p className="text-xs text-stone-500">Could not resolve the signed-in associate.</p>
      </div>
    );
  }

  const firstName = me.name?.trim().split(/\s+/)[0] || me.name;
  const totalMembers = levels.reduce((sum, l) => sum + l.members.length, 0);
  const selected = levels.find(l => l.level === selectedLevel);

  return (
    <div className="space-y-3">
      {/* Welcome line */}
      <div className="px-1">
        <h1 className="text-base sm:text-xl font-bold font-serif text-stone-900">
          Welcome, <span className="text-emerald-800">{firstName}</span>
        </h1>
        <p className="text-[10.5px] text-stone-500 mt-0.5">
          {totalMembers} {totalMembers === 1 ? 'member' : 'members'} across {levels.length}{' '}
          {levels.length === 1 ? 'level' : 'levels'}
        </p>
      </div>

      {/* Level summary */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-[9px] uppercase font-bold text-stone-500 tracking-wider">
              <th className="px-3 py-2">Level</th>
              <th className="px-3 py-2">Members</th>
              <th className="px-3 py-2 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {levels.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-stone-500 text-xs font-medium">
                  No downline members yet. Share your Sponsor ID to start building your team.
                </td>
              </tr>
            ) : (
              levels.map(({ level, members }) => {
                const isOpen = selectedLevel === level;
                return (
                  <tr key={level} className={isOpen ? 'bg-emerald-50/60' : 'hover:bg-stone-50'}>
                    <td className="px-3 py-2.5 font-bold text-stone-900 text-xs">Level {level}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-emerald-800 text-xs">
                      {members.length}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLevel(isOpen ? null : level)}
                        aria-pressed={isOpen}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold border cursor-pointer transition-all ${
                          isOpen
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {isOpen ? 'Hide' : 'Select'}
                        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {levels.length > 0 && (
            <tfoot>
              <tr className="bg-stone-50 border-t border-stone-200">
                <td className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">Total</td>
                <td className="px-3 py-2 font-mono font-bold text-stone-900 text-xs">{totalMembers}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Records for the selected level */}
      {selected && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-1">
            Level {selected.level} · {selected.members.length}{' '}
            {selected.members.length === 1 ? 'member' : 'members'}
          </p>
          <MemberTable
            members={selected.members}
            levelOf={m => levelById.get(m.id)}
            emptyMessage="No members at this level."
          />
        </div>
      )}
    </div>
  );
}
