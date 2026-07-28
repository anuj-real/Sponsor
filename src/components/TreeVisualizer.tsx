import { useEffect, useRef } from 'react';
import { User as UserIcon } from 'lucide-react';
import { User } from '../types';

/**
 * Props are accepted only so existing call sites keep type-checking.
 * This component is intentionally static and renders from DUMMY_TREE below.
 * Light/dark follows the `.dark` class that App puts on the layout root.
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

// 4-level dummy org structure. Root → leaders → managers → associates.
const DUMMY_TREE: TeamNode = {
  id: 'C',
  name: 'Rajesh Malhotra',
  designation: 'Exempt',
  directPts: 0,
  networkPts: 18420,
  teamSize: 25,
  children: [
    {
      id: 'MANORANJAN',
      name: 'Manoranjan Sahu',
      designation: 'Sr. GM',
      directPts: 320,
      networkPts: 6240,
      teamSize: 8,
      children: [
        {
          id: 'SBR0004',
          name: 'Anita Sharma',
          designation: 'Manager',
          directPts: 145,
          networkPts: 1980,
          teamSize: 2,
          children: [
            { id: 'SBR0013', name: 'Rohit Verma', designation: 'Associate', directPts: 62, networkPts: 62, teamSize: 0 },
            { id: 'SBR0014', name: 'Sneha Pillai', designation: 'Associate', directPts: 48, networkPts: 48, teamSize: 0 },
          ],
        },
        {
          id: 'SBR0005',
          name: 'Suresh Rana',
          designation: 'Manager',
          directPts: 118,
          networkPts: 1240,
          teamSize: 1,
          children: [
            { id: 'SBR0015', name: 'Mohit Gupta', designation: 'Associate', directPts: 54, networkPts: 54, teamSize: 0 },
          ],
        },
        { id: 'SBR0006', name: 'Pooja Nair', designation: 'Associate', directPts: 76, networkPts: 76, teamSize: 0 },
      ],
    },
    {
      id: 'RAM',
      name: 'Ram Prakash',
      designation: 'GM',
      directPts: 280,
      networkPts: 4860,
      teamSize: 6,
      children: [
        {
          id: 'SBR0007',
          name: 'Imran Qureshi',
          designation: 'Sr. Manager',
          directPts: 162,
          networkPts: 2140,
          teamSize: 2,
          children: [
            { id: 'SBR0016', name: 'Deepak Rawat', designation: 'Associate', directPts: 71, networkPts: 71, teamSize: 0 },
            { id: 'SBR0017', name: 'Ritu Chawla', designation: 'Associate', directPts: 39, networkPts: 39, teamSize: 0 },
          ],
        },
        {
          id: 'SBR0008',
          name: 'Kavita Joshi',
          designation: 'Manager',
          directPts: 104,
          networkPts: 890,
          teamSize: 1,
          children: [
            { id: 'SBR0018', name: 'Sanjay Dubey', designation: 'Associate', directPts: 45, networkPts: 45, teamSize: 0 },
          ],
        },
      ],
    },
    {
      id: 'DK',
      name: 'Dinesh Kumar',
      designation: 'AGM',
      directPts: 245,
      networkPts: 3910,
      teamSize: 5,
      children: [
        {
          id: 'SBR0009',
          name: 'Harpreet Singh',
          designation: 'Manager',
          directPts: 132,
          networkPts: 1620,
          teamSize: 2,
          children: [
            { id: 'SBR0019', name: 'Aisha Khan', designation: 'Associate', directPts: 58, networkPts: 58, teamSize: 0 },
            { id: 'SBR0020', name: 'Gaurav Sethi', designation: 'Associate', directPts: 41, networkPts: 41, teamSize: 0 },
          ],
        },
        { id: 'SBR0010', name: 'Neha Bansal', designation: 'Associate', directPts: 67, networkPts: 67, teamSize: 0 },
      ],
    },
    {
      id: 'VIKAS',
      name: 'Vikas Yadav',
      designation: 'Sr. Manager',
      directPts: 198,
      networkPts: 3410,
      teamSize: 5,
      children: [
        {
          id: 'SBR0011',
          name: 'Arjun Mehta',
          designation: 'Manager',
          directPts: 121,
          networkPts: 1480,
          teamSize: 2,
          children: [
            { id: 'SBR0021', name: 'Meena Iyer', designation: 'Associate', directPts: 63, networkPts: 63, teamSize: 0 },
            { id: 'SBR0022', name: 'Tarun Bose', designation: 'Associate', directPts: 52, networkPts: 52, teamSize: 0 },
          ],
        },
        {
          id: 'SBR0012',
          name: 'Farhan Ali',
          designation: 'Associate',
          directPts: 88,
          networkPts: 430,
          teamSize: 1,
          children: [
            { id: 'SBR0023', name: 'Zoya Sheikh', designation: 'Associate', directPts: 34, networkPts: 34, teamSize: 0 },
          ],
        },
      ],
    },
  ],
};

const ACCENT: Record<string, string> = {
  'Exempt': 'text-amber-700 bg-amber-50 border-amber-300 dark:text-amber-300 dark:bg-amber-400/10 dark:border-amber-400/25',
  'Sr. GM': 'text-violet-700 bg-violet-50 border-violet-300 dark:text-violet-300 dark:bg-violet-400/10 dark:border-violet-400/25',
  'GM': 'text-sky-700 bg-sky-50 border-sky-300 dark:text-sky-300 dark:bg-sky-400/10 dark:border-sky-400/25',
  'AGM': 'text-cyan-700 bg-cyan-50 border-cyan-300 dark:text-cyan-300 dark:bg-cyan-400/10 dark:border-cyan-400/25',
  'Sr. Manager': 'text-teal-700 bg-teal-50 border-teal-300 dark:text-teal-300 dark:bg-teal-400/10 dark:border-teal-400/25',
  'Manager': 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-400/10 dark:border-emerald-400/25',
  'Associate': 'text-stone-600 bg-stone-100 border-stone-300 dark:text-slate-300 dark:bg-slate-400/10 dark:border-slate-400/25',
};

const LINE = 'bg-stone-300 dark:bg-white/12';

function MemberCard({ node, isRoot = false }: { node: TeamNode; isRoot?: boolean }) {
  const accent = ACCENT[node.designation] || ACCENT['Associate'];

  return (
    <div
      className={`rounded-lg border px-2 py-1.5 text-center ${
        isRoot
          ? 'w-36 border-amber-400 bg-amber-50 ring-1 ring-amber-300 dark:border-amber-400/30 dark:bg-slate-800/80 dark:ring-amber-400/20'
          : 'w-32 border-stone-200 bg-white dark:border-white/10 dark:bg-slate-800/50'
      }`}
    >
      <UserIcon className="mx-auto h-3.5 w-3.5 text-stone-400 dark:text-slate-400" strokeWidth={1.75} />

      <h4 className="mt-1 truncate text-[11px] font-semibold leading-tight text-stone-900 dark:text-slate-50">
        {node.name}
      </h4>

      <p className="font-mono text-[9px] leading-tight text-stone-500 dark:text-slate-500">{node.id}</p>

      <span className={`mt-1 inline-block rounded border px-1.5 text-[8.5px] font-semibold leading-[14px] ${accent}`}>
        {node.designation}
      </span>

      <div className="mt-1 flex justify-center gap-2 border-t border-stone-200 pt-1 font-mono text-[9px] leading-tight text-stone-600 dark:border-white/10 dark:text-slate-400">
        <span><span className="text-stone-400 dark:text-slate-600">D</span> {node.directPts.toLocaleString()}</span>
        <span><span className="text-stone-400 dark:text-slate-600">N</span> {node.networkPts.toLocaleString()}</span>
        <span><span className="text-stone-400 dark:text-slate-600">T</span> {node.teamSize}</span>
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

export default function TreeVisualizer(_props: TreeVisualizerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Park the root card in the middle of the viewport on first paint.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="border-b border-stone-200 px-3 py-2 text-center dark:border-white/10">
        <h3 className="text-xs font-semibold tracking-tight text-stone-900 dark:text-slate-100">SBR Team Structure</h3>
        <p className="text-[10px] text-stone-500 dark:text-slate-500">
          Sample hierarchy · D direct · N network · T team
        </p>
      </div>

      <div ref={scrollRef} className="max-h-[70vh] overflow-auto p-4 bg-stone-50/60 dark:bg-slate-950">
        <div className="flex w-max min-w-full justify-center">
          <TreeBranch node={DUMMY_TREE} isRoot />
        </div>
      </div>
    </div>
  );
}
