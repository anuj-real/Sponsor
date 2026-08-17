import { useEffect, useMemo, useRef } from 'react';
import { User as UserIcon } from 'lucide-react';
import { User } from '../types';

/**
 * Static horizontal org chart of the sponsor hierarchy.
 *
 * Renders from the live `users` prop (App -> AdminPanel/AgentPanel).
 * No interactivity: no expand/collapse, pan/zoom, search or buttons.
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
  directPts: number;
  networkPts: number;
  teamSize: number;
  children?: TeamNode[];
}

/*
 * ---------------------------------------------------------------------------
 * DUMMY DATA (retained for reference / offline design work only).
 * The component now renders the real sponsor tree from the `users` prop.
 * ---------------------------------------------------------------------------
 *
 * const DUMMY_TREE: TeamNode = {
 *   id: 'C',
 *   name: 'Rajesh Malhotra',
 *   designation: 'Exempt',
 *   directPts: 0,
 *   networkPts: 18420,
 *   teamSize: 25,
 *   children: [
 *     {
 *       id: 'MANORANJAN', name: 'Manoranjan Sahu', designation: 'Sr. GM',
 *       directPts: 320, networkPts: 6240, teamSize: 8,
 *       children: [
 *         {
 *           id: 'SBR0004', name: 'Anita Sharma', designation: 'Manager',
 *           directPts: 145, networkPts: 1980, teamSize: 2,
 *           children: [
 *             { id: 'SBR0013', name: 'Rohit Verma', designation: 'Associate', directPts: 62, networkPts: 62, teamSize: 0 },
 *             { id: 'SBR0014', name: 'Sneha Pillai', designation: 'Associate', directPts: 48, networkPts: 48, teamSize: 0 },
 *           ],
 *         },
 *         { id: 'SBR0006', name: 'Pooja Nair', designation: 'Associate', directPts: 76, networkPts: 76, teamSize: 0 },
 *       ],
 *     },
 *     { id: 'RAM', name: 'Ram Prakash', designation: 'GM', directPts: 280, networkPts: 4860, teamSize: 6 },
 *     { id: 'DK', name: 'Dinesh Kumar', designation: 'AGM', directPts: 245, networkPts: 3910, teamSize: 5 },
 *     { id: 'VIKAS', name: 'Vikas Yadav', designation: 'Sr. Manager', directPts: 198, networkPts: 3410, teamSize: 5 },
 *   ],
 * };
 */

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

    const direct = Math.round(user.totalDirectSales || 0);
    const network = direct + kids.reduce((sum, k) => sum + k.networkPts, 0);
    const teamSize = kids.reduce((sum, k) => sum + 1 + k.teamSize, 0);

    return {
      id: user.id,
      name: user.name,
      designation: user.designation || 'Associate',
      directPts: direct,
      networkPts: network,
      teamSize,
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

function MemberCard({ node, isRoot = false }: { node: TeamNode; isRoot?: boolean }) {
  const accent = ACCENT[node.designation] || ACCENT['Associate'];

  return (
    <div
      className={`rounded-lg border px-2 py-1.5 text-center ${
        isRoot
          ? 'w-36 border-amber-400 bg-amber-50 ring-1 ring-amber-300'
          : 'w-32 border-stone-200 bg-white'
      }`}
    >
      <UserIcon className="mx-auto h-3.5 w-3.5 text-stone-400" strokeWidth={1.75} />

      <h4 className="mt-1 truncate text-[11px] font-semibold leading-tight text-stone-900" title={node.name}>
        {node.name}
      </h4>

      <p className="font-mono text-[9px] leading-tight text-stone-500">{node.id}</p>

      <span className={`mt-1 inline-block rounded border px-1.5 text-[8.5px] font-semibold leading-[14px] ${accent}`}>
        {node.designation}
      </span>

      <div className="mt-1 flex justify-center gap-2 border-t border-stone-200 pt-1 font-mono text-[9px] leading-tight text-stone-600">
        <span><span className="text-stone-400">D</span> {node.directPts.toLocaleString()}</span>
        <span><span className="text-stone-400">N</span> {node.networkPts.toLocaleString()}</span>
        <span><span className="text-stone-400">T</span> {node.teamSize}</span>
      </div>
    </div>
  );
}

function TreeBranch({ node, isRoot = false }: { node: TeamNode; isRoot?: boolean }) {
  const children = node.children ?? [];

  return (
    <div className="flex flex-col items-center">
      <MemberCard node={node} isRoot={isRoot} />

      {children.length > 0 && (
        <>
          {/* Stem dropping out of this card */}
          <div className={`h-4 w-px ${LINE}`} />

          <div className="flex items-start">
            {children.map((child, i) => {
              const isFirst = i === 0;
              const isLast = i === children.length - 1;

              return (
                <div key={child.id} className="flex flex-col items-center px-1.5">
                  {/* Horizontal bridge across siblings + vertical drop into this child */}
                  <div className="relative -mx-1.5 h-4 self-stretch">
                    {children.length > 1 && (
                      <div
                        className={`absolute top-0 h-px ${LINE} ${
                          isFirst ? 'left-1/2 right-0' : isLast ? 'left-0 right-1/2' : 'left-0 right-0'
                        }`}
                      />
                    )}
                    <div className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 ${LINE}`} />
                  </div>

                  <TreeBranch node={child} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function TreeVisualizer({ users = [] }: TreeVisualizerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const roots = useMemo(() => buildTree(users), [users]);

  // Park the root card in the middle of the viewport on first paint.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, [roots]);

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-3 py-2 text-center">
        <h3 className="text-xs font-semibold tracking-tight text-stone-900">SBR Team Structure</h3>
        <p className="text-[10px] text-stone-500">
          D direct · N network · T team
        </p>
      </div>

      <div ref={scrollRef} className="max-h-[70vh] overflow-auto p-4 bg-stone-50/60">
        {roots.length === 0 ? (
          <p className="py-8 text-center text-[11px] text-stone-400">
            No sponsor records available yet.
          </p>
        ) : (
          <div className="flex w-max min-w-full justify-center gap-6">
            {roots.map(root => (
              <TreeBranch key={root.id} node={root} isRoot />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
