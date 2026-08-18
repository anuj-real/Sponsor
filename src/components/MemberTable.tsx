import { User } from '../types';

/**
 * The member record as a table — shared by the direct-member and downline
 * pages so both always show the same columns in the same order.
 *
 * Same mobile pattern as the other data pages: pinned first column, both axes
 * scroll, row separators on cells because `border-separate` ignores them on <tr>.
 */
interface MemberTableProps {
  members: User[];
  emptyMessage?: string;
  /** Extra leading column, e.g. the level a member sits at. */
  levelOf?: (member: User) => number | undefined;
}

const CELL = 'px-2.5 py-2 whitespace-nowrap border-b border-stone-200';
const STICKY_CELL = `${CELL} sticky left-0 bg-white border-r border-stone-200 z-10`;

export default function MemberTable({ members, emptyMessage, levelOf }: MemberTableProps) {
  const headers = ['Name', "Father / Husband Name", 'Sponsor ID', 'Joining Date', 'Designation', 'Status'];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="relative isolate overflow-auto max-h-[60vh] custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-0 text-[11px]">
          <thead>
            <tr className="bg-stone-50 text-[9px] uppercase font-bold text-stone-500 tracking-wider">
              {/* z-30: outranks both the sticky header row and the sticky column */}
              <th className={`${CELL} sticky left-0 top-0 z-30 bg-stone-50 border-r border-stone-200`}>
                User ID
              </th>
              {levelOf && <th className={`${CELL} sticky top-0 z-20 bg-stone-50`}>Level</th>}
              {headers.map(h => (
                <th key={h} className={`${CELL} sticky top-0 z-20 bg-stone-50`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-stone-800">
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length + (levelOf ? 2 : 1)}
                  className="px-4 py-10 text-center text-stone-500 text-xs font-medium"
                >
                  {emptyMessage || 'No members to show.'}
                </td>
              </tr>
            ) : (
              members.map(m => (
                <tr key={m.id} className="group hover:bg-stone-50">
                  <td className={`${STICKY_CELL} font-mono font-bold text-stone-900 group-hover:bg-stone-50`}>
                    {m.id}
                  </td>
                  {levelOf && (
                    <td className={`${CELL} font-mono text-stone-600`}>L{levelOf(m) ?? '—'}</td>
                  )}
                  <td className={`${CELL} font-semibold text-stone-900`}>{m.name}</td>
                  <td className={`${CELL} text-stone-700`}>{m.fatherOrHusbandName || '—'}</td>
                  <td className={`${CELL} font-mono text-stone-600`}>{m.sponsorId || '—'}</td>
                  <td className={`${CELL} font-mono text-stone-600`}>{m.joinedDate || '—'}</td>
                  <td className={`${CELL} text-stone-700`}>{m.designation || 'Associate'}</td>
                  <td className={CELL}>
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                      m.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
