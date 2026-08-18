import { useMemo, useState } from 'react';
import { RealEstateProject, User } from '../types';
import { LayoutGrid, Layers, Search, Table2 } from 'lucide-react';

/**
 * `/inventory` — every plot across every project as one filterable table.
 *
 * Same shape as the sales report: pinned unit column, both axes scroll, filters
 * on top. Read-only; booking still happens in Admin → Book Plot Inventory.
 */
interface InventoryTableProps {
  projects: RealEstateProject[];
  users?: User[];
}

type StatusFilter = 'ALL' | 'AVAILABLE' | 'HOLD' | 'BOOKED';
/** Grid is the default: it reads better on a phone and matches the older view. */
type ViewMode = 'GRID' | 'TABLE';

/** Row separators live on cells: `border-separate` ignores borders on <tr>. */
const CELL = 'px-2.5 py-2 whitespace-nowrap border-b border-stone-200';
/** Pinned column needs an opaque background so content passes behind it. */
const STICKY_CELL = `${CELL} sticky left-0 bg-white border-r border-stone-200 z-10`;

const statusChip = (status: string) =>
  status === 'BOOKED'
    ? 'bg-rose-50 text-rose-800 border-rose-200'
    : status === 'HOLD'
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-emerald-50 text-emerald-800 border-emerald-200';

export default function InventoryTable({ projects, users = [] }: InventoryTableProps) {
  const [projectId, setProjectId] = useState<string>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<ViewMode>('GRID');

  /** Flattens project → size slab → unit into one row per plot. */
  const rows = useMemo(() => {
    const agentName = new Map(users.map(u => [u.id?.toUpperCase(), u.name]));

    return projects.flatMap(project =>
      project.inventory.flatMap(slab =>
        slab.units.map(unit => ({
          key: `${project.id}-${slab.size}-${unit.unitNumber}`,
          projectId: project.id,
          projectName: project.name,
          location: project.location,
          size: slab.size,
          unitNumber: unit.unitNumber,
          type: unit.type || 'Residential',
          status: unit.status,
          buyerName: unit.buyerName || '',
          agentId: unit.bookedByAgentId || '',
          agentName: unit.bookedByAgentId
            ? agentName.get(unit.bookedByAgentId.toUpperCase()) || unit.bookedByAgentId
            : '',
        })),
      ),
    );
  }, [projects, users]);

  /** Project-filtered only — the status tallies below must not count each other out. */
  const inProject = useMemo(
    () => (projectId === 'ALL' ? rows : rows.filter(r => r.projectId === projectId)),
    [rows, projectId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inProject.filter(r => {
      if (status !== 'ALL' && r.status !== status) return false;
      if (!q) return true;
      return [r.unitNumber, r.projectName, r.size, r.type, r.buyerName, r.agentId, r.agentName]
        .some(v => String(v).toLowerCase().includes(q));
    });
  }, [inProject, status, query]);

  const counts = useMemo(() => ({
    ALL: inProject.length,
    AVAILABLE: inProject.filter(r => r.status === 'AVAILABLE').length,
    HOLD: inProject.filter(r => r.status === 'HOLD').length,
    BOOKED: inProject.filter(r => r.status === 'BOOKED').length,
  }), [inProject]);

  /**
   * The grid view groups the same filtered rows back into project → size slab,
   * which is how the inventory read before it became a table.
   */
  const grouped = useMemo(() => {
    const byProject = new Map<string, { name: string; location: string; slabs: Map<string, typeof filtered> }>();
    filtered.forEach(row => {
      let project = byProject.get(row.projectId);
      if (!project) {
        project = { name: row.projectName, location: row.location, slabs: new Map() };
        byProject.set(row.projectId, project);
      }
      const slab = project.slabs.get(row.size) || [];
      slab.push(row);
      project.slabs.set(row.size, slab);
    });
    return Array.from(byProject.entries()).map(([id, p]) => ({
      id,
      name: p.name,
      location: p.location,
      slabs: Array.from(p.slabs.entries()).map(([size, units]) => ({ size, units })),
    }));
  }, [filtered]);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-stone-200 bg-stone-50/60 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wide">Real Estate Inventory</h3>
            <p className="text-[10.5px] text-stone-500 mt-0.5">Live plot status by project</p>
          </div>

          {/* Minimal view toggle: grouped plots (default) vs the flat table */}
          <div className="flex gap-0.5 p-0.5 bg-stone-100 border border-stone-200 rounded-lg shrink-0">
            {([
              { key: 'GRID' as const, label: 'Grid', icon: LayoutGrid },
              { key: 'TABLE' as const, label: 'Table', icon: Table2 },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-pressed={view === key}
                title={`${label} view`}
                className={`p-1.5 rounded cursor-pointer transition-all ${
                  view === key ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 space-y-2">
          {/* Project filter — the reason this page exists once there are several */}
          <div>
            <label className="text-[9.5px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
              Project
            </label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="w-full px-2.5 py-2 text-xs font-semibold rounded-lg border border-stone-200 bg-white text-stone-900 outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="ALL">All projects ({projects.length})</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.location}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search unit, size, buyer, agent…"
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          {/* Status tiles double as the summary */}
          <div className="grid grid-cols-4 gap-1.5">
            {([
              { key: 'ALL' as const, label: 'Total', accent: 'text-stone-900' },
              { key: 'AVAILABLE' as const, label: 'Available', accent: 'text-emerald-800' },
              { key: 'HOLD' as const, label: 'Hold', accent: 'text-amber-700' },
              { key: 'BOOKED' as const, label: 'Booked', accent: 'text-rose-700' },
            ]).map(({ key, label, accent }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(key)}
                className={`text-left rounded-lg border px-2 py-1.5 transition-all cursor-pointer ${
                  status === key
                    ? 'border-emerald-800 bg-emerald-50 ring-1 ring-emerald-800/20'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <span className="block text-[8.5px] font-bold uppercase tracking-wider text-stone-500 truncate">
                  {label}
                </span>
                <span className={`block font-mono font-bold text-sm ${accent}`}>{counts[key]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grouped plot view — project → size slab → unit chips */}
      {view === 'GRID' && (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs p-3 space-y-3">
          {grouped.length === 0 ? (
            <p className="py-10 text-center text-stone-500 text-xs font-medium">
              {rows.length === 0 ? 'No inventory has been added yet.' : 'No plots match these filters.'}
            </p>
          ) : (
            grouped.map(project => (
              <div key={project.id} className="border border-stone-200 bg-stone-50/50 rounded-xl p-3 space-y-3">
                <div className="flex justify-between items-baseline gap-2 border-b border-stone-200 pb-1.5">
                  <h4 className="font-bold text-stone-900 text-xs truncate">{project.name}</h4>
                  <span className="text-[10px] text-stone-500 font-semibold uppercase shrink-0 truncate">
                    {project.location}
                  </span>
                </div>

                {project.slabs.map(slab => (
                  <div key={slab.size} className="space-y-1.5">
                    <span className="text-[10.5px] font-bold text-stone-600 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                      {slab.size}
                      <span className="font-normal text-stone-500">({slab.units.length})</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {slab.units.map(u => (
                        <span
                          key={u.key}
                          title={u.buyerName ? `${u.unitNumber} · ${u.buyerName}` : u.unitNumber}
                          className={`px-2 py-1 rounded text-[10px] font-bold font-mono border flex flex-col items-center select-none ${statusChip(u.status)}`}
                        >
                          <span>{u.unitNumber}</span>
                          <span className="text-[8px] opacity-80 mt-0.5 lowercase font-sans max-w-[70px] truncate">
                            {u.status === 'BOOKED' ? u.buyerName || 'booked' : u.status.toLowerCase()}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* Flat table view */}
      {view === 'TABLE' && (
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="relative isolate overflow-auto max-h-[64vh] custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0 text-[11px]">
            <thead>
              <tr className="bg-stone-50 text-[9px] uppercase font-bold text-stone-500 tracking-wider">
                {/* z-30: outranks both the sticky header row and the sticky column */}
                <th className={`${CELL} sticky left-0 top-0 z-30 bg-stone-50 border-r border-stone-200`}>
                  Unit No.
                </th>
                {['Size', 'Type', 'Status', 'Buyer', 'Booked By', 'Project'].map(h => (
                  <th key={h} className={`${CELL} sticky top-0 z-20 bg-stone-50`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-stone-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-stone-500 text-xs font-medium">
                    {rows.length === 0
                      ? 'No inventory has been added yet.'
                      : 'No plots match these filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.key} className="group hover:bg-stone-50">
                    <td className={`${STICKY_CELL} font-bold text-stone-900 group-hover:bg-stone-50`}>
                      {r.unitNumber}
                    </td>
                    <td className={`${CELL} font-mono text-stone-600`}>{r.size}</td>
                    <td className={`${CELL} text-stone-600`}>{r.type}</td>
                    <td className={CELL}>
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold border ${statusChip(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className={`${CELL} font-semibold text-stone-800`}>{r.buyerName || '—'}</td>
                    <td className={`${CELL} text-stone-700`}>
                      {r.agentName || '—'}
                      {r.agentId && <span className="font-mono text-stone-500"> ({r.agentId})</span>}
                    </td>
                    <td className={`${CELL} text-stone-600`}>{r.projectName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <p className="text-[10px] text-stone-500 px-1">
        Showing {filtered.length} of {rows.length} plots
        {view === 'TABLE' && ' · unit column stays pinned while you scroll sideways'}.
      </p>
    </div>
  );
}
