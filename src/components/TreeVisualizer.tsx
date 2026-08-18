import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, User as UserIcon } from 'lucide-react';
import { User } from '../types';

/**
 * Horizontal org chart of the sponsor hierarchy.
 *
 * Shows two levels by default (the root and its directs); deeper branches stay
 * folded behind a "+N more" button so the chart opens small on a phone.
 * Expanding is scroll-anchored: the node you tapped keeps its exact position on
 * screen, so the layout never jumps under your finger.
 *
 * Light/dark follows the `.dark` class App puts on the layout root.
 */
interface TreeVisualizerProps {
  users?: User[];
  onSelectUser?: (userId: string) => void;
  selectedUserId?: string | null;
  hideUpline?: boolean;
}

interface TeamNode {
  id: string;
  name: string;
  designation: string;
  joinedDate: string;
  status: string;
  /** Immediate recruits — "total direct". */
  directCount: number;
  /** Whole downline beneath this node. */
  teamSize: number;
  children: TeamNode[];
}

/* Colour is theme-agnostic here: theme.css re-points these utilities in dark mode. */
const ACCENT: Record<string, string> = {
  'Exempt': 'text-amber-700 bg-amber-50 border-amber-300',
  'Sr. GM': 'text-violet-700 bg-violet-50 border-violet-300',
  'GM': 'text-sky-700 bg-sky-50 border-sky-300',
  'AGM': 'text-cyan-700 bg-cyan-50 border-cyan-300',
  'Sr. Manager': 'text-teal-700 bg-teal-50 border-teal-300',
  'Manager': 'text-emerald-700 bg-emerald-50 border-emerald-300',
  'Associate': 'text-stone-600 bg-stone-100 border-stone-300',
};

const LINE = 'bg-stone-300';

/** Levels visible before anything is expanded: the root and its directs. */
const DEFAULT_DEPTH = 1;

/**
 * Converts the flat user list into nested TeamNodes.
 * `visited` guards against a malformed sponsorId cycle causing infinite recursion.
 */
function buildTree(users: User[]): TeamNode[] {
  const childrenBySponsor = new Map<string, User[]>();
  const known = new Set(users.map(u => u.id?.toUpperCase()));

  users.forEach(u => {
    const parent = u.sponsorId?.toUpperCase() || '';
    if (!parent || !known.has(parent)) return;
    const list = childrenBySponsor.get(parent) || [];
    list.push(u);
    childrenBySponsor.set(parent, list);
  });

  const toNode = (user: User, visited: Set<string>): TeamNode => {
    const key = user.id?.toUpperCase();
    const nextVisited = new Set(visited).add(key);

    const kids = (childrenBySponsor.get(key) || [])
      .filter(child => !nextVisited.has(child.id?.toUpperCase()))
      .map(child => toNode(child, nextVisited));

    return {
      id: user.id,
      name: user.name,
      designation: user.designation || 'Associate',
      joinedDate: user.joinedDate || '',
      status: user.status || '',
      directCount: kids.length,
      teamSize: kids.reduce((sum, k) => sum + 1 + k.teamSize, 0),
      children: kids,
    };
  };

  // Roots are users whose sponsor is absent from this list (top of the visible tree).
  return users
    .filter(u => {
      const parent = u.sponsorId?.toUpperCase();
      return !parent || !known.has(parent);
    })
    .map(root => toNode(root, new Set()));
}

function MemberCard({ node, isRoot }: { node: TeamNode; isRoot: boolean }) {
  const accent = ACCENT[node.designation] || ACCENT['Associate'];

  return (
    <div
      className={`rounded-lg border px-2 py-1.5 text-center ${
        isRoot
          ? 'w-28 sm:w-32 border-amber-400 bg-amber-50 ring-1 ring-amber-300'
          : 'w-26 sm:w-28 border-stone-200 bg-white'
      }`}
    >
      <UserIcon className="mx-auto h-3.5 w-3.5 text-stone-400" strokeWidth={1.75} />

      <h4 className="mt-0.5 truncate text-[10.5px] font-semibold leading-tight text-stone-900" title={node.name}>
        {node.name}
      </h4>

      <p className="font-mono text-[9px] leading-tight text-stone-500">{node.id}</p>

      <span className={`mt-1 inline-block rounded border px-1 text-[8px] font-semibold leading-[13px] ${accent}`}>
        {node.designation}
      </span>

      <div className="mt-1 flex justify-center gap-2 border-t border-stone-200 pt-0.5 font-mono text-[9px] leading-tight text-stone-600">
        <span><span className="text-stone-400">D</span> {node.directCount}</span>
        <span><span className="text-stone-400">T</span> {node.teamSize}</span>
      </div>
    </div>
  );
}

function TreeBranch({
  node, depth, expanded, onToggle,
}: {
  node: TeamNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  // Levels 0 and 1 are always drawn; anything deeper needs an explicit expand.
  const isOpen = depth < DEFAULT_DEPTH || expanded.has(node.id);
  const showChildren = hasChildren && isOpen;

  return (
    <div className="flex flex-col items-center">
      {/* id is the anchor the scroll-preserving expand measures against */}
      <div id={`tree-node-${node.id}`}>
        <MemberCard node={node} isRoot={depth === 0} />
      </div>

      {/* Expand / collapse control, only where it can do something */}
      {hasChildren && depth >= DEFAULT_DEPTH && (
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          className="mt-1 flex items-center gap-0.5 rounded-full border border-stone-300 bg-white px-1.5 py-0.5 text-[9px] font-bold text-stone-600 hover:bg-stone-100 cursor-pointer whitespace-nowrap"
        >
          {expanded.has(node.id)
            ? <>Hide <ChevronUp className="h-2.5 w-2.5" /></>
            : <>+{node.children.length} more <ChevronDown className="h-2.5 w-2.5" /></>}
        </button>
      )}

      {showChildren && (
        <>
          {/* Stem dropping out of this card */}
          <div className={`h-4 w-px ${LINE}`} />

          <div className="flex items-start">
            {node.children.map((child, i) => {
              const isFirst = i === 0;
              const isLast = i === node.children.length - 1;

              return (
                <div key={child.id} className="flex flex-col items-center px-1.5">
                  {/* Horizontal bridge across siblings + vertical drop into this child */}
                  <div className="relative -mx-1.5 h-4 self-stretch">
                    {node.children.length > 1 && (
                      <div
                        className={`absolute top-0 h-px ${LINE} ${
                          isFirst ? 'left-1/2 right-0' : isLast ? 'left-0 right-1/2' : 'left-0 right-0'
                        }`}
                      />
                    )}
                    <div className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 ${LINE}`} />
                  </div>

                  <TreeBranch
                    node={child}
                    depth={depth + 1}
                    expanded={expanded}
                    onToggle={onToggle}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/** One cell of the detail grid below the chart. */
function Detail({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 min-w-0">
      <span className="block text-[8.5px] font-bold uppercase tracking-wider text-stone-400">{label}</span>
      <span className={`block text-[11.5px] font-semibold truncate ${muted ? 'text-stone-400 italic' : 'text-stone-900'}`}>
        {value}
      </span>
    </div>
  );
}

export default function TreeVisualizer({ users = [] }: TreeVisualizerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const roots = useMemo(() => buildTree(users), [users]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  /** Where the tapped node sat before the re-render, so we can put it back. */
  const anchorRef = useRef<{ id: string; left: number; top: number } | null>(null);
  const hasCenteredRef = useRef(false);

  // The chart always describes the main user — the root of this tree. Nodes are
  // not selectable, so there is nothing else the detail panel could show.
  const mainUser = roots[0] || null;

  /** Everyone drawn in the chart, roots included. */
  const totalMembers = useMemo(
    () => roots.reduce((sum, r) => sum + 1 + r.teamSize, 0),
    [roots],
  );

  const handleToggle = (id: string) => {
    // Record the node's on-screen offset first; useLayoutEffect restores it
    // after the extra branches mount, so nothing shifts under the tap.
    const container = scrollRef.current;
    const el = document.getElementById(`tree-node-${id}`);
    if (container && el) {
      const node = el.getBoundingClientRect();
      const box = container.getBoundingClientRect();
      anchorRef.current = { id, left: node.left - box.left, top: node.top - box.top };
    }
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    anchorRef.current = null;
    const container = scrollRef.current;
    if (!anchor || !container) return;
    const el = document.getElementById(`tree-node-${anchor.id}`);
    if (!el) return;
    const node = el.getBoundingClientRect();
    const box = container.getBoundingClientRect();
    container.scrollLeft += (node.left - box.left) - anchor.left;
    container.scrollTop += (node.top - box.top) - anchor.top;
  }, [expanded]);

  // Centre the root once. Deliberately NOT keyed on `roots`: the 10-second
  // background poll rebuilds that array, which would re-centre (and visibly
  // jump) the chart every tick.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || hasCenteredRef.current || roots.length === 0) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    hasCenteredRef.current = true;
  }, [roots]);

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      {/* Minimal header: the chart starts immediately below it. */}
      <div className="border-b border-stone-200 px-3 py-1.5 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold tracking-tight text-stone-900">Team Structure</h3>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 shrink-0">
          {totalMembers} {totalMembers === 1 ? 'member' : 'members'}
        </span>
      </div>

      <div ref={scrollRef} className="max-h-[52vh] overflow-auto p-3 bg-stone-50/60">
        {roots.length === 0 ? (
          <p className="py-8 text-center text-[11px] text-stone-400">
            No sponsor records available yet.
          </p>
        ) : (
          <div className="flex w-max min-w-full justify-center gap-5">
            {roots.map(root => (
              <TreeBranch
                key={root.id}
                node={root}
                depth={0}
                expanded={expanded}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details of the main user only. */}
      {mainUser && (
        <div className="border-t border-stone-200 p-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <Detail label="User ID" value={mainUser.id} />
          <Detail label="Name" value={mainUser.name} />
          <Detail label="Activation Date" value={mainUser.joinedDate || '—'} />
          <Detail label="Total Direct" value={String(mainUser.directCount)} />
          <Detail label="Total Team" value={String(mainUser.teamSize)} />
          <Detail label="Designation" value={mainUser.designation} />
          {/* Leg volumes are not modelled yet — shown so the row set is final. */}
          <Detail label="Bigger Leg" value="—" muted />
          <Detail label="Other Leg" value="—" muted />
        </div>
      )}
    </div>
  );
}
