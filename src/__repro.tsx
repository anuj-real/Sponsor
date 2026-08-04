import { createRoot } from 'react-dom/client';
import SalesReport from './components/SalesReport';
import { Sale, User } from './types';
import './index.css';

// 40 fake bookings so the table body overflows its max-h-[68vh] cap.
const sales: Sale[] = Array.from({ length: 40 }, (_, i) => ({
  id: `SALE-${i}`,
  agentId: 'SBR0001',
  agentName: 'Test Agent',
  project: 'IMT Sohna',
  unitNumber: `A-${100 + i}`,
  sizeSqYards: 100 + i,
  saleValue: 2,
  saleDate: '2026-01-01',
  buyerName: `Buyer ${i}`,
  status: 'CONFIRMED',
  bookingStatus: 'TOKEN_RECEIVED',
  tokenAmount: 100000,
} as unknown as Sale));

const users: User[] = [{ id: 'SBR0001', name: 'Test Agent' } as unknown as User];

/** Replica of App.tsx's shell: same root div / header / main / footer classes. */
function Shell() {
  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#1c1917] flex flex-col antialiased font-sans relative overflow-x-clip">
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-25%] left-[-10%] w-[60%] h-[110%] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      {/* App.tsx:1523 */}
      <header id="banner" className="border-b border-stone-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-30 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 flex items-center gap-3">
          <div className="flex-1 flex justify-start">
            <button className="p-2 rounded-lg border border-stone-200 bg-white text-stone-700 shadow-xs shrink-0">
              <span className="block w-4 h-4">=</span>
            </button>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-white font-serif font-semibold select-none shadow-sm shrink-0">P</div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-stone-900 font-serif whitespace-nowrap">
              SBR <span className="text-emerald-800 font-normal">Sponsors</span>
            </h1>
          </div>
          <div className="flex-1 flex justify-end items-center gap-2" />
        </div>
      </header>

      {/* App.tsx:1751 */}
      <main id="sbr-top" className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="space-y-4">
          <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500">← Back to dashboard</button>
          <SalesReport users={users} sales={sales} scopeNote="Full booking ledger · scroll sideways for all columns" />
        </div>
      </main>

      {/* App.tsx:1879 */}
      <footer className="bg-stone-100 border-t border-stone-200/80 py-6.5 px-4 md:px-6 shrink-0 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 SBR Associates. Standard Sourcing Operations. All rights reserved.</p>
          <div className="flex gap-4 justify-center text-stone-400">
            <span>Support: malav.nitin199@gmail.com</span>
            <span>|</span>
            <span>Policy: Standard Compliance Manual</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Shell />);

// Measure + optionally scroll, then report into <title> and a #probe div.
setTimeout(() => {
  const params = new URLSearchParams(location.search);
  const banner = document.getElementById('banner')!;
  const corner = document.querySelector('thead th') as HTMLElement;
  const scroller = corner.closest('.overflow-auto') as HTMLElement;

  const bannerH = banner.getBoundingClientRect().height;
  const tableTopDoc = scroller.getBoundingClientRect().top + window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const neededScroll = tableTopDoc - bannerH;

  const want = params.get('scroll');
  window.scrollTo(0, want === 'max' ? maxScroll : Number(want || 0));

  setTimeout(() => {
    const c = corner.getBoundingClientRect();
    const b = banner.getBoundingClientRect();
    const overlaps = c.top < b.bottom && c.bottom > b.top;
    // Hit test: which element actually paints at the overlap point?
    const px = c.left + c.width / 2;
    const py = Math.min(c.bottom, b.bottom) - 2;
    const hit = document.elementFromPoint(px, py);
    const probe = document.createElement('div');
    probe.id = 'probe';
    probe.textContent = JSON.stringify({
      innerHeight: window.innerHeight,
      bannerH: Math.round(bannerH),
      tableTopDoc: Math.round(tableTopDoc),
      maxScroll: Math.round(maxScroll),
      neededScroll: Math.round(neededScroll),
      reachable: maxScroll > neededScroll,
      scrollY: Math.round(window.scrollY),
      cornerRect: { top: Math.round(c.top), bottom: Math.round(c.bottom) },
      bannerRect: { top: Math.round(b.top), bottom: Math.round(b.bottom) },
      overlaps,
      hitTagAtOverlap: hit ? `${hit.tagName}.${(hit.className || '').toString().slice(0, 40)}` : null,
      hitIsCorner: hit === corner,
    });
    probe.style.cssText = 'position:fixed;bottom:0;left:0;font:10px monospace;background:#ff0;z-index:99999;max-width:100%;word-break:break-all';
    document.body.appendChild(probe);
    document.title = 'READY';
  }, 300);
}, 1200);
