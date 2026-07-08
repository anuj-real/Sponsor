import React, { useState, useEffect } from 'react';
import { User, Sale, CommissionPayout, Notification, MLMConfig, RealEstateProject } from '../types';
import { Users, TrendingUp, DollarSign, Wallet, Award, Bell, Clipboard, CheckCircle2, History, IndianRupee, Key, Star, ShieldAlert, Check, Layers, Map, Eye, Download, CreditCard, ZoomIn, ZoomOut, Maximize2, ShieldCheck, Lock, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import DesignationProgress from './DesignationProgress';
import TreeVisualizer from './TreeVisualizer';

interface AgentPanelProps {
  users: User[];
  sales: Sale[];
  payouts: CommissionPayout[];
  notifications: Notification[];
  activeAgentId: string;
  onSelectAgentId: (id: string) => void;
  onClearNotification: (noId: string) => void;
  config: MLMConfig;
  projects?: RealEstateProject[];
  onUpdateUserProfile?: (userId: string, updatedFields: Partial<User>) => Promise<void>;
}

export default function AgentPanel({
  users,
  sales,
  payouts,
  notifications,
  activeAgentId,
  onSelectAgentId,
  onClearNotification,
  config,
  projects = [],
  onUpdateUserProfile
}: AgentPanelProps) {
  const [copied, setCopied] = useState(false);
  const [activePanelTab, setActivePanelTab] = useState<'LEDGER' | 'INVENTORY'>('LEDGER');
  const [selectedInventoryProjId, setSelectedInventoryProjId] = useState<string>('ALL');
  const [selectedInventoryStatus, setSelectedInventoryStatus] = useState<string>('ALL');
  const [expandedMapProjId, setExpandedMapProjId] = useState<string | null>(null);
  const [selectedTreeUserId, setSelectedTreeUserId] = useState<string | null>(null);

  // Zoomed Map state
  const [zoomedMap, setZoomedMap] = useState<{ url: string; title: string } | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Broker Profile States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isKycExpanded, setIsKycExpanded] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [nominee, setNominee] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('');
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Campaign date status checker logic
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const getOfferStatusAndBadge = (startDate?: string, endDate?: string) => {
    if (!startDate && !endDate) {
      return { 
        status: 'ACTIVE',
        text: 'Active', 
        color: 'text-emerald-700 bg-emerald-50 border border-emerald-150 font-bold' 
      };
    }
    try {
      if (startDate) {
        const start = new Date(startDate + 'T00:00:00');
        if (now < start) {
          return { 
            status: 'UPCOMING',
            text: 'Upcoming', 
            color: 'text-blue-700 bg-blue-50 border border-blue-150 font-semibold' 
          };
        }
      }
      if (endDate) {
        const end = new Date(endDate + 'T23:59:59');
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          return { 
            status: 'EXPIRED',
            text: 'Expired', 
            color: 'text-rose-600 bg-rose-50 border border-rose-100 font-medium' 
          };
        } else if (diffDays === 0) {
          return { 
            status: 'ACTIVE',
            text: 'Expires Today!', 
            color: 'text-rose-605 bg-rose-50 border border-rose-100 animate-pulse font-extrabold' 
          };
        } else if (diffDays === 1) {
          return { 
            status: 'ACTIVE',
            text: 'Expires Tomorrow', 
            color: 'text-amber-700 bg-amber-50 border border-amber-150 font-bold' 
          };
        } else if (diffDays <= 7) {
          return { 
            status: 'ACTIVE',
            text: `Only ${diffDays} days left`, 
            color: 'text-amber-600 bg-amber-50 border border-amber-150 font-semibold' 
          };
        } else {
          return { 
            status: 'ACTIVE',
            text: `${diffDays} days left`, 
            color: 'text-emerald-700 bg-emerald-50 border border-emerald-150 font-medium' 
          };
        }
      }
      return { 
        status: 'ACTIVE',
        text: 'Active', 
        color: 'text-emerald-750 bg-emerald-50 border border-emerald-150 font-bold' 
      };
    } catch {
      return { 
        status: 'ACTIVE',
        text: 'Active', 
        color: 'text-emerald-750 bg-emerald-50 border border-emerald-150 font-bold' 
      };
    }
  };

  const sortedMonthlyOffers = [...(config.specialMonthlyOffers || [])].sort((a, b) => {
    const statusA = getOfferStatusAndBadge(a.startDate, a.endDate).status;
    const statusB = getOfferStatusAndBadge(b.startDate, b.endDate).status;
    
    const rankMap: Record<string, number> = { 'ACTIVE': 1, 'UPCOMING': 2, 'EXPIRED': 3 };
    return (rankMap[statusA] || 3) - (rankMap[statusB] || 3);
  });

  // Active broker profile
  const agent = users.find(u => u.id === activeAgentId) || users[0];

  // Sync profile form states
  useEffect(() => {
    if (agent) {
      setBankAccountNumber(agent.bankAccountNumber || '');
      setIfscCode(agent.ifscCode || '');
      setBranchName(agent.branchName || '');
      setNominee(agent.nominee || '');
      setNomineeRelation(agent.nomineeRelation || '');
      setFatherOrHusbandName(agent.fatherOrHusbandName || '');
    }
    if (isProfileOpen) {
      setIsKycExpanded(false);
      setIsProfileExpanded(false);
    }
  }, [agent, isProfileOpen]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateUserProfile) return;
    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      await onUpdateUserProfile(agent.id, {
        bankAccountNumber: bankAccountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        branchName: branchName.trim(),
        nominee: nominee.trim(),
        nomineeRelation: nomineeRelation.trim(),
        fatherOrHusbandName: fatherOrHusbandName.trim()
      });
      setProfileSuccess('Profile updated successfully in SBR secure records! 👤');
      setTimeout(() => {
        setProfileSuccess(null);
        setIsProfileOpen(false);
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setProfileError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!agent) {
    return (
      <div className="p-8 text-center text-stone-500">
        Please register or designate an active SBR broker to simulate Agent dashboards.
      </div>
    );
  }

  // Calculate stats for this agent
  const directDeals = sales.filter(s => s.agentId === agent.id);
  const myPayouts = payouts.filter(p => p.agentId === agent.id);

  const earningsNetPaid = myPayouts.filter(p => p.status === 'DISBURSED').reduce((acc, p) => acc + p.netCommission, 0);
  const earningsNetPending = myPayouts.filter(p => p.status !== 'DISBURSED').reduce((acc, p) => acc + p.netCommission, 0);

  // Get recursive downline partners list
  const getDownlineList = (userId: string, level: number = 1): { user: User; relativeLevel: number }[] => {
    const directRecruits = users.filter(u => u.sponsorId === userId);
    let list = directRecruits.map(u => ({ user: u, relativeLevel: level }));
    
    directRecruits.forEach(u => {
      list = [...list, ...getDownlineList(u.id, level + 1)];
    });
    
    return list;
  };

  const downlineNetwork = getDownlineList(agent.id);

  const handleCopySponsorId = () => {
    navigator.clipboard.writeText(agent.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helpers
  const formatPoints = (val: number) => {
    return `${Math.round(val).toLocaleString()} PTS`;
  };

  return (
    <div className="space-y-6">
      {/* Partner Identity Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <div 
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 cursor-pointer group"
                title="Click to view/edit SBR profile details"
              >
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 group-hover:text-emerald-850 transition-colors">
                  {agent.name}
                </h2>
                <span className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-150 flex items-center gap-1 transition-all">
                  <span>SBR Profile 👤</span>
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-stone-50 text-stone-700 border border-stone-200">
                {agent.designation || 'Associate'}
              </span>
            </div>
            <p className="text-xs text-stone-550 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Associate Sponsor ID:</span>
              <span className="font-mono font-bold text-stone-900 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">{agent.id}</span>
              <span>• Joined {agent.joinedDate}</span>
              {agent.bankAccountNumber && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-850 bg-emerald-50/70 px-1.5 py-0.5 rounded border border-emerald-150/30">
                    <CreditCard className="w-3 h-3 shrink-0 text-emerald-700" />
                    <span>A/C: *{agent.bankAccountNumber.slice(-4)} ({agent.ifscCode})</span>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Active Team Member Count */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-150 rounded-xl px-4 py-2 shrink-0 md:self-center">
          <Users className="w-5 h-5 text-emerald-800" />
          <div>
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block font-sans">Active Team Members</span>
            <span className="font-mono font-extrabold text-sm sm:text-base text-emerald-900">
              {downlineNetwork.filter(item => item.user.status === 'ACTIVE').length} {downlineNetwork.filter(item => item.user.status === 'ACTIVE').length === 1 ? 'Associate' : 'Associates'}
            </span>
          </div>
        </div>
      </div>

      {/* Sizing & Points standard Notice for the active broker */}
      <div className="p-3.5 sm:p-4 bg-emerald-50/40 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-800 font-bold shrink-0 border border-emerald-200/30">
            💡
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider font-sans">Real-time Sizing Conversion Rule</h4>
            <p className="text-[11px] text-stone-650 mt-0.5 leading-normal">
              Plot points are derived from plot size (e.g. up to 80 Sq Yd = <span className="font-bold text-emerald-850">1.0 Point</span>, 81-130 = <span className="font-bold text-emerald-850">2.0 Points</span>, 131-180 = <span className="font-bold text-emerald-850">3.0 Points</span>, and up to 10.0 Points for 481-530 Sq Yd). Commission and levels are derived purely in points.
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-right px-4 py-2 bg-white rounded-xl border border-stone-200 shrink-0">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-sans">Platform Standard</span>
          <span className="font-mono font-extrabold text-xs text-emerald-850">Tiered Points System</span>
        </div>
      </div>

      {/* Sharing and Payout Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Direct Sourced Volume */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Closed Sourced Volume</span>
              <h3 className="font-mono font-bold text-xl sm:text-lg text-stone-900 mt-2">
                {formatPoints(agent.totalDirectSales)}
              </h3>
              <p className="text-[10.5px] text-stone-500 mt-1.5">
                From {directDeals.length} direct property agreements
              </p>
            </div>

            {/* Paid-out commissions */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Commissions Received</span>
              <h3 className="font-mono font-bold text-xl sm:text-lg text-emerald-800 mt-2">
                {formatPoints(earningsNetPaid)}
              </h3>
              <p className="text-[10.5px] text-emerald-700 mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Confirmed ledger clearance
              </p>
            </div>

            {/* Pending commissions */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Pending Points</span>
              <h3 className="font-mono font-bold text-xl sm:text-lg text-amber-700 mt-2">
                {formatPoints(earningsNetPending)}
              </h3>
              <p className="text-[10.5px] text-stone-500 mt-1.5">
                Calculated overrides in pipeline
              </p>
            </div>

            {/* Active Team Network */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Active Team Network</span>
              <h3 className="font-mono font-bold text-xl sm:text-lg text-indigo-900 mt-2">
                {downlineNetwork.filter(item => item.user.status === 'ACTIVE').length} / {downlineNetwork.length}
              </h3>
              <p className="text-[10.5px] text-stone-550 mt-1.5">
                Active sub-brokers in your downline
              </p>
            </div>
          </div>

          {/* Designation Progress Multi-bar Component */}
          <DesignationProgress 
            agent={agent} 
            users={users} 
            downlineNetwork={downlineNetwork.map(item => item.user)} 
            config={config}
          />

          {/* Sourced property listings & Inventory sub-panel switcher */}
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-150 bg-stone-50/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  {activePanelTab === 'LEDGER' ? 'Your Direct Booking Ledger' : 'Live Real Estate Inventory'}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {activePanelTab === 'LEDGER' 
                    ? 'Audited list of actual sales you directly sourced for SBR Sponsors.' 
                    : 'Real-time property map availability and class listings.'}
                </p>
              </div>
              <div className="flex gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0 self-stretch sm:self-auto select-none">
                <button
                  type="button"
                  onClick={() => setActivePanelTab('LEDGER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                    activePanelTab === 'LEDGER'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-550 hover:text-stone-900'
                  }`}
                >
                  <Clipboard className="w-3.5 h-3.5" /> Direct Ledger
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanelTab('INVENTORY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                    activePanelTab === 'INVENTORY'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-stone-550 hover:text-stone-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-700 font-bold" /> Live Inventory
                </button>
              </div>
            </div>

            {activePanelTab === 'LEDGER' ? (
              <div className="overflow-x-auto max-h-[350px] overflow-y-auto custom-scrollbar">
                {directDeals.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                        <th className="px-5 py-3">Agreement Reference</th>
                        <th className="px-5 py-3">Real Estate Sizing</th>
                        <th className="px-5 py-3 font-mono">Points Volume</th>
                        <th className="px-5 py-3 font-mono">Date Booked</th>
                        <th className="px-5 py-3">Booking Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-150 text-xs text-stone-850">
                      {directDeals.map((deal) => (
                        <tr key={deal.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-5 py-3 font-mono text-stone-800 font-bold">{deal.id}</td>
                          <td className="px-5 py-3">
                            <div>
                              <p className="font-semibold text-stone-900">{deal.project}</p>
                              <p className="text-[10px] text-stone-500 mt-0.5">Unit: {deal.unitNumber} • Buyer: {deal.buyerName}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-mono font-bold text-emerald-800">{formatPoints(deal.saleValue)}</td>
                          <td className="px-5 py-3 font-mono text-stone-550">{deal.saleDate}</td>
                          <td className="px-5 py-3">
                            {!deal.bookingStatus || deal.bookingStatus === 'TOKEN_RECEIVED' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                                Token received (₹{(deal.tokenAmount !== undefined ? deal.tokenAmount : 75000).toLocaleString('en-IN')})
                              </span>
                            ) : deal.bookingStatus === 'BOOKING_DONE' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                Booking Done (30% paid)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                Registry Done (100% paid)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-stone-500">
                    You have not registered any direct deals. Work with administration to book inventory!
                  </div>
                )}
              </div>
            ) : (
              /* New Live Inventory sub-panel */
              <div className="p-5 space-y-4">
                {/* Filters block */}
                <div className="flex flex-col sm:flex-row gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9.5px] font-bold text-stone-500 uppercase block font-sans">Active Project Filter</label>
                    <select
                      value={selectedInventoryProjId}
                      onChange={(e) => setSelectedInventoryProjId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg outline-none cursor-pointer"
                    >
                      <option value="ALL">All Active Projects ({projects.length})</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[9.5px] font-bold text-stone-500 uppercase block font-sans">Allotment Status Filter</label>
                    <select
                      value={selectedInventoryStatus}
                      onChange={(e) => {
                        setSelectedInventoryStatus(e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg outline-none cursor-pointer"
                    >
                      <option value="ALL">All Statuses (Green / Yellow / Red)</option>
                      <option value="AVAILABLE">Available Only</option>
                      <option value="HOLD">Hold Only</option>
                      <option value="BOOKED">Booked Only</option>
                    </select>
                  </div>
                </div>

                {/* Projects/Units display with live matching */}
                <div className="space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                  {projects.filter(proj => selectedInventoryProjId === 'ALL' || proj.id === selectedInventoryProjId).length === 0 ? (
                    <div className="p-8 text-center text-stone-400 italic">No real estate projects configured in SBR pipeline yet.</div>
                  ) : (
                    projects
                      .filter(proj => selectedInventoryProjId === 'ALL' || proj.id === selectedInventoryProjId)
                      .map((proj) => {
                        // Filter the project categories/units based on our status selection
                        const filteredInventory = proj.inventory.map(group => {
                          const units = group.units.filter(unit => {
                            if (selectedInventoryStatus === 'ALL') return true;
                            return unit.status === selectedInventoryStatus;
                          });
                          return { ...group, units };
                        }).filter(group => group.units.length > 0);

                        const totalUnitsCount = proj.inventory.reduce((sum, g) => sum + g.units.length, 0);
                        const availableUnitsCount = proj.inventory.reduce((sum, g) => sum + g.units.filter(u => u.status === 'AVAILABLE').length, 0);

                        return (
                          <div key={proj.id} className="border border-stone-200 bg-stone-50/30 rounded-xl p-4 space-y-3.5 hover:shadow-xs transition-shadow">
                            <div className="flex justify-between items-center border-b border-stone-200/80 pb-2.5 flex-wrap gap-2">
                              <div>
                                <h4 className="font-extrabold text-stone-900 text-sm">{proj.name}</h4>
                                <p className="text-[10px] text-stone-500 font-sans font-semibold uppercase tracking-wider mt-0.5">{proj.location}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10.5px] font-extrabold text-emerald-800 font-mono block">
                                  {availableUnitsCount} / {totalUnitsCount} Units Available
                                </span>
                                <div className="w-32 bg-stone-200 rounded-full h-1.5 mt-1 overflow-hidden ml-auto">
                                  <div 
                                    className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${totalUnitsCount > 0 ? (availableUnitsCount / totalUnitsCount) * 100 : 0}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Project Map and Legal details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-3 rounded-xl border border-stone-150 shadow-2xs">
                              {/* Left: Interactive Layout Map with click-to-zoom */}
                              <div className="relative group cursor-zoom-in overflow-hidden rounded-lg border border-stone-200 h-28 bg-stone-50">
                                <img 
                                  src={proj.imageMapUrl || 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&q=80&w=350'} 
                                  alt={proj.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&q=80&w=600';
                                  }}
                                />
                                <div 
                                  onClick={() => {
                                    setZoomedMap({ 
                                      url: proj.imageMapUrl || 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&q=80&w=800', 
                                      title: proj.name 
                                    });
                                    setZoomScale(1);
                                  }}
                                  className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10.5px] font-bold gap-1.5 cursor-pointer"
                                >
                                  <ZoomIn className="w-3.5 h-3.5 text-white shrink-0" />
                                  <span>Zoom Layout Map</span>
                                </div>
                              </div>

                              {/* Right: SBR Project Legal & Milestones Metadata details */}
                              <div className="space-y-1.5 flex flex-col justify-center">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-stone-500 font-bold uppercase tracking-wider text-[8px]">Project Stage:</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    proj.projectStage === 'Launched / Ready to Move' 
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                      : proj.projectStage === 'Near Possession'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : proj.projectStage === 'Under Construction'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                                      : 'bg-stone-100 text-stone-800 border border-stone-200'
                                  }`}>
                                    {proj.projectStage || 'Pre-Launch'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-stone-50/70 rounded-lg p-1.5 border border-stone-150 text-[10px] space-y-0.5">
                                    <div className="flex justify-between items-center border-b border-stone-100 pb-0.5">
                                      <span className="font-bold text-stone-500 uppercase text-[7px] tracking-wider">Registry</span>
                                      <span className={`px-1 rounded-sm text-[8px] font-bold ${
                                        proj.registryStatus === 'Completed'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : proj.registryStatus === 'In Progress'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-stone-150 text-stone-600'
                                      }`}>
                                        {proj.registryStatus || 'Not Started'}
                                      </span>
                                    </div>
                                    <div className="text-[8px] text-stone-600 font-mono">
                                      {proj.registryDate ? proj.registryDate : <span className="text-stone-400 italic">No date</span>}
                                    </div>
                                    {proj.sroOffice && (
                                      <div className="text-[7.5px] text-stone-500 uppercase font-sans">
                                        SRO: <span className="font-bold text-emerald-800">{proj.sroOffice}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="bg-stone-50/70 rounded-lg p-1.5 border border-stone-150 text-[10px] space-y-0.5">
                                    <div className="flex justify-between items-center border-b border-stone-100 pb-0.5">
                                      <span className="font-bold text-stone-500 uppercase text-[7px] tracking-wider">Mutation</span>
                                      <span className={`px-1 rounded-sm text-[8px] font-bold ${
                                        proj.mutationStatus === 'Approved'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : proj.mutationStatus === 'Applied'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-stone-150 text-stone-600'
                                      }`}>
                                        {proj.mutationStatus || 'Pending'}
                                      </span>
                                    </div>
                                    <div className="text-[8px] text-stone-600 font-mono">
                                      {proj.mutationDate ? proj.mutationDate : <span className="text-stone-400 italic">No date</span>}
                                    </div>
                                    {proj.mutationNumber && (
                                      <div className="text-[7.5px] text-stone-500 font-mono truncate" title={proj.mutationNumber}>
                                        No: <span className="font-bold text-stone-700">{proj.mutationNumber}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {filteredInventory.length === 0 ? (
                              <p className="text-xs text-stone-400 italic text-center py-2">No units match standard search criteria.</p>
                            ) : (
                              filteredInventory.map((inv, idx) => (
                                <div key={idx} className="space-y-2">
                                  <span className="text-[10px] font-extrabold text-stone-550 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                                    <Layers className="w-3.5 h-3.5 text-emerald-700 shrink-0 animate-pulse" /> Sizing Slab: {inv.size}
                                  </span>
                                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {inv.units.map((u, uIdx) => (
                                      <div
                                        key={uIdx}
                                        className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold font-mono border flex flex-col items-center select-none min-w-[75px] ${
                                          u.status === 'BOOKED'
                                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                                            : u.status === 'HOLD'
                                            ? 'bg-amber-50 border-amber-200 text-amber-850 animate-pulse'
                                            : 'bg-emerald-50 border-emerald-250 text-emerald-805 hover:bg-emerald-100/50 cursor-help'
                                        }`}
                                        title={`Allotment state: ${u.status}`}
                                      >
                                        <span>{u.unitNumber}</span>
                                        <span className="text-[8px] opacity-85 mt-0.5 lowercase font-sans font-bold tracking-wide">
                                          {u.status === 'BOOKED' ? u.buyerName || 'booked' : u.status}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Widget: Sponsor sharing & alerts stream */}
        <div className="space-y-6">
          {/* Quick Share Sponsor ID */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block font-sans">Sponsor Reference Code</span>
            <p className="text-xs text-stone-550 mt-1.5 leading-relaxed font-sans">
              Copy and share your unique ID to register associates. When they register sales, you obtain team overrides up to 10 tier levels!
            </p>
            
            <div className="flex gap-2 mt-4">
              <div className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 flex-grow font-mono font-bold text-sm text-emerald-800 flex items-center select-all">
                {agent.id}
              </div>
              <button
                onClick={handleCopySponsorId}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  copied 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SBR Referral Organigram for Associate Downline */}
      <TreeVisualizer 
        users={[agent, ...downlineNetwork.map(item => item.user)]}
        onSelectUser={(id) => setSelectedTreeUserId(id)}
        selectedUserId={selectedTreeUserId}
        hideUpline={true}
      />

      {/* SBR BROKER MOTIVATIONAL DECK */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden animate-fade-in">
        <div className="p-5 border-b border-stone-200 bg-stone-50/40 flex justify-between items-center flex-col sm:flex-row gap-3">
          <div>
            <h3 className="font-bold text-stone-900 text-base">✨ SBR Partner Incentives & Motivational Locker</h3>
            <p className="text-xs text-stone-500 mt-1">Unlock milestones, complete monthly offers and trace clear-cut leadership commission designations.</p>
          </div>
          <span className="inline-block px-3 py-1.5 bg-emerald-50 text-emerald-800 text-[10.5px] font-bold tracking-wider rounded-xl border border-emerald-150 uppercase">
            Active Campaign Phase
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Special Monthly Offers */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-200 pb-2 font-sans">
              <Star className="w-4 h-4 text-emerald-800" /> Special Monthly Blitz
            </h4>
            <div className="space-y-3">
              {sortedMonthlyOffers.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No special monthly blitz runtime programs currently active.</p>
              ) : (
                sortedMonthlyOffers.map((o, idx) => {
                  const expiry = getOfferStatusAndBadge(o.startDate, o.endDate);
                  return (
                    <div key={idx} className={`p-3 rounded-xl border flex gap-3 items-start hover:shadow-xs transition-shadow ${
                      expiry.status === 'EXPIRED' 
                        ? 'bg-stone-50/50 border-stone-200/65 opacity-70' 
                        : expiry.status === 'UPCOMING'
                          ? 'bg-blue-50/20 border-blue-150'
                          : 'bg-stone-50 border-stone-200'
                    }`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 mt-0.5 ${
                        expiry.status === 'EXPIRED'
                          ? 'bg-stone-100 border-stone-200'
                          : expiry.status === 'UPCOMING'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-amber-50 border-amber-200'
                      }`}>
                        <Star className={`w-3 h-3 ${
                          expiry.status === 'EXPIRED'
                            ? 'text-stone-400'
                            : expiry.status === 'UPCOMING'
                              ? 'text-blue-500 fill-blue-500'
                              : 'text-amber-600 fill-amber-600'
                        }`} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-stone-100 mb-1.5">
                          <span className="text-[11px] text-stone-500 uppercase tracking-wider font-bold font-mono">Special Program #{idx + 1}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-wide uppercase ${expiry.color}`}>
                            {expiry.text}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-stone-850 font-bold leading-normal">Settle {o.volumeSqYds} Square Yards</p>
                        <p className="text-[10px] text-stone-550 mt-0.5">Requires Down Payment: <strong className="text-stone-800 font-mono">{o.paymentPercentage}%</strong></p>
                        {o.startDate && o.endDate && (
                          <p className="text-[9.5px] text-stone-600 font-medium mt-1">
                            Available: <span className="font-mono text-stone-800">{o.startDate}</span> to <span className="font-mono text-stone-800">{o.endDate}</span>
                          </p>
                        )}
                        <span className={`text-[11px] font-extrabold block mt-2 max-w-max px-2 py-0.5 rounded border ${
                          expiry.status === 'EXPIRED'
                            ? 'bg-stone-100 text-stone-500 border-stone-200'
                            : expiry.status === 'UPCOMING'
                              ? 'bg-blue-50 text-blue-900 border-blue-150'
                              : 'bg-amber-50 text-amber-900 border-amber-100'
                        }`}>
                          Reward: {o.perkName}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Leadership designations */}
          <div className="space-y-4 border-t md:border-t-0 md:border-l border-stone-200 pt-6 md:pt-0 md:pl-6">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-200 pb-2 font-sans">
              <Award className="w-4 h-4 text-emerald-800" /> Designation Ranks & Direct Incentive
            </h4>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {['C', 'A1', 'A2'].includes(agent.id) ? (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-500 text-xs leading-relaxed space-y-2">
                  <p className="font-semibold text-stone-700">Administrative Exemption</p>
                  <p>Leadership override tiers and direct incentive eligibility calculations are disabled for SBR corporate nodes.</p>
                  <p className="text-[11px] text-stone-400">Your profile is exempt from designation tracks based on the company's grandfathered structure.</p>
                </div>
              ) : (config.leadershipConfigs || []).length === 0 ? (
                <p className="text-xs text-stone-400 italic">No team designation tracks set up.</p>
              ) : (() => {
                const directRecruitsCount = users.filter(u => u.sponsorId === agent.id).length;
                const teamMembersCount = downlineNetwork.length;
                const designationRanks = ['Associate', 'Manager', 'Sr. Manager', 'AGM', 'GM', 'Sr. GM'] as const;
                const currentRankIdx = designationRanks.indexOf((agent.designation as any) || 'Associate');

                const parseCondition = (condition: string) => {
                  let reqDirects = 0;
                  let reqTeam = 0;
                  const directsMatch = condition.match(/(\d+)\s+Direct/i);
                  if (directsMatch) reqDirects = parseInt(directsMatch[1], 10);
                  const teamMatch = condition.match(/(\d+)\s+(Group|Team|Member)/i);
                  if (teamMatch) reqTeam = parseInt(teamMatch[1], 10);
                  return { reqDirects, reqTeam };
                };

                return config.leadershipConfigs.map((cfg, idx) => {
                  const { reqDirects, reqTeam } = parseCondition(cfg.condition || '');
                  const cfgRankIdx = designationRanks.indexOf(cfg.designation as any);
                  const isCurrent = agent.designation === cfg.designation;
                  const isUnlocked = cfgRankIdx !== -1 && currentRankIdx >= cfgRankIdx;
                  const isEligible = reqDirects > 0 && reqTeam > 0 && directRecruitsCount >= reqDirects && teamMembersCount >= reqTeam;

                  let statusBadge = null;
                  if (isCurrent) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ● Current Rank
                      </span>
                    );
                  } else if (isUnlocked) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200/55">
                        ✓ Achieved
                      </span>
                    );
                  } else if (isEligible) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                        ★ Eligible (Pending)
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-stone-100 text-stone-500 border border-stone-200">
                        {directRecruitsCount}/{reqDirects} Dir • {teamMembersCount}/{reqTeam} Team
                      </span>
                    );
                  }

                  return (
                    <div key={idx} className={`p-3 border rounded-xl flex justify-between items-center text-xs transition-all ${
                      isCurrent 
                        ? 'bg-emerald-50/45 border-emerald-200 shadow-2xs' 
                        : isUnlocked 
                          ? 'bg-stone-50/70 border-stone-200/80 opacity-90' 
                          : isEligible 
                            ? 'bg-amber-50/30 border-amber-250 animate-pulse' 
                            : 'bg-stone-50/30 border-stone-150'
                    }`}>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-sans font-extrabold text-stone-900 uppercase text-[11px] tracking-wide">{cfg.designation}</h5>
                          {statusBadge}
                        </div>
                        <span className="text-[9.5px] text-stone-550 block mt-1">Condition: <strong className="text-stone-805">{cfg.condition}</strong></span>
                        <p className="text-[9px] text-stone-500 leading-normal italic mt-0.5">Lineage: {cfg.rules}</p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono font-bold px-2 py-1 rounded shrink-0 ml-3">
                        +₹{cfg.incentivePrice}/sq yd
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Global Compliance footer */}
        {(config.termsAndConditions || []).length > 0 && (
          <div className="bg-stone-50 border-t border-stone-200 p-4 font-sans">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-stone-400" /> SBR Operations Terms & Compliance Agreement
            </span>
            <ul className="space-y-1.5 list-none">
              {config.termsAndConditions.map((term, idx) => (
                <li key={idx} className="text-[10.5px] text-stone-600 leading-relaxed font-sans">
                  • {term}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recruiting Downline Map */}
        <div className="lg:col-span-12 bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200 bg-stone-50/40">
            <h3 className="font-bold text-stone-900 text-base">Your Active Team Network</h3>
            <p className="text-xs text-stone-500 mt-1 font-sans">
              Real-time tracker of sub-brokers mapped down your sourcing hierarchy network.
            </p>
          </div>

          <div className="overflow-x-auto max-h-[350px] overflow-y-auto custom-scrollbar font-medium">
            {downlineNetwork.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                    <th className="px-5 py-3">Sourcing Tier Depth</th>
                    <th className="px-5 py-3">Agent Sponsor ID</th>
                    <th className="px-5 py-3">Agent Details</th>
                    <th className="px-5 py-3">Sourced Property Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 text-xs text-stone-800 font-medium">
                  {downlineNetwork.map(({ user, relativeLevel }) => (
                    <tr key={user.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          relativeLevel === 1 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' 
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}>
                          Level {relativeLevel} {relativeLevel === 1 ? '(Direct)' : '(Indirect)'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-stone-900">{user.id}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-stone-900">{user.name}</p>
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        <p className="font-bold text-stone-900">{formatPoints(user.totalDirectSales)}</p>
                        <p className="text-[9.5px] text-stone-500 mt-0.5">Indirect Team Network: {formatPoints(user.totalDownlineSales)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-10 text-center text-stone-400 flex flex-col items-center justify-center min-h-[200px]">
                <Users className="w-10 h-10 text-stone-300 stroke-1 mx-auto mb-2" />
                <h5 className="font-semibold text-stone-700 text-sm">No Recruited Active Associates Yet</h5>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Share your Associate Sponsor ID to start building your network core and unlocking override payouts.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Override Ledger */}
        <div className="lg:col-span-12 bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200 bg-stone-50/40">
            <h3 className="font-bold text-stone-900 text-base">Calculated Override Receipts</h3>
            <p className="text-xs text-stone-500 mt-1">
              Detailed tracking of multitier commission shares calculated on SBR inventory sales.
            </p>
          </div>

          <div className="overflow-y-auto max-h-[350px] divide-y divide-stone-150 custom-scrollbar">
            {myPayouts.length > 0 ? (
              myPayouts.map((payout) => (
                <div key={payout.id} className="p-4 hover:bg-stone-50/50 flex items-start justify-between gap-3 font-medium transition-colors">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-stone-900">{payout.project}</p>
                    <p className="text-[10px] text-stone-500">Unit: {payout.unitNumber} • Total Sourced: {formatPoints(payout.saleValue)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                        payout.level === 1 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-150' 
                          : 'bg-amber-50 text-amber-800 border-amber-150'
                      }`}>
                        {payout.level === 1 ? 'Direct L1 Sourcing' : `Indirect Level ${payout.level} Overrides`}
                      </span>
                      <span className="text-[10px] font-bold font-mono text-stone-500">
                        {payout.percentage}% Cut
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-1 shrink-0 font-mono">
                    <p className="font-bold text-emerald-800 text-xs">{formatPoints(payout.netCommission)}</p>
                    <p className="text-[9.5px] text-stone-500 font-sans">Gross: {formatPoints(payout.grossCommission)}</p>
                    <span className={`inline-block text-[9px] font-bold py-0.5 px-2 rounded-full border ${
                      payout.status === 'DISBURSED' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-150' 
                        : payout.status === 'APPROVED'
                          ? 'bg-emerald-50/50 text-emerald-700 border-emerald-150'
                          : 'bg-amber-50 text-amber-800 border-amber-150'
                    }`}>
                      {payout.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-stone-400 flex flex-col items-center justify-center min-h-[220px]">
                <Wallet className="w-10 h-10 text-stone-300 stroke-1 mb-2" />
                <p className="text-xs">No receipt calculations issued to your account ledger.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zoomable Map Image Lightbox Modal */}
      {zoomedMap && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-stone-900 text-stone-100 rounded-2xl max-w-4xl w-full border border-stone-800 shadow-2xl overflow-hidden flex flex-col h-[85vh]">
            {/* Header */}
            <div className="bg-stone-950 p-4 border-b border-stone-850 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Project Layout Map Zoom</h4>
                <p className="text-[10px] text-stone-400 mt-0.5">{zoomedMap.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-stone-850 px-2.5 py-1 rounded-lg flex items-center gap-2 border border-stone-750">
                  <button 
                    type="button"
                    onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
                    className="p-1 hover:bg-stone-750 rounded text-stone-300 hover:text-white transition-all cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-stone-200 min-w-[40px] text-center font-bold">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button 
                    type="button"
                    onClick={() => setZoomScale(prev => Math.min(4, prev + 0.25))}
                    className="p-1 hover:bg-stone-750 rounded text-stone-300 hover:text-white transition-all cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="px-1.5 py-0.5 bg-stone-750 hover:bg-stone-700 rounded text-[9px] font-bold text-stone-300 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setZoomedMap(null);
                    setZoomScale(1);
                  }}
                  className="p-1.5 bg-stone-850 hover:bg-rose-950 hover:text-rose-400 border border-stone-750 rounded-lg text-stone-300 transition-all cursor-pointer text-xs"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Map Body: Zoom and Scrollable area */}
            <div className="flex-1 bg-stone-950 overflow-auto flex items-center justify-center p-6 relative cursor-grab active:cursor-grabbing">
              <div className="transition-all duration-150 ease-out" style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}>
                <img 
                  src={zoomedMap.url} 
                  alt={zoomedMap.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[60vh] max-w-full rounded-lg shadow-xl object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&q=80&w=800';
                  }}
                />
              </div>
            </div>

            {/* Instruction Footer */}
            <div className="bg-stone-950 p-2 text-center text-[9px] text-stone-550 border-t border-stone-850">
              Use the + and - buttons to adjust map scale. Drag or scroll to navigate large project layouts.
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Profile Modal - Screen Overlay on Mobile */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
          <form onSubmit={handleSaveProfile} className="bg-white w-full max-w-2xl h-[82dvh] sm:h-auto sm:max-h-[85vh] md:max-h-[90vh] rounded-2xl border border-stone-200 shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-950 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b border-stone-850">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="text-stone-400 hover:text-white p-1.5 hover:bg-stone-850 rounded-lg transition-all shrink-0 cursor-pointer"
                  aria-label="Close"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-emerald-800/25 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-serif font-bold text-sm shrink-0">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-100 truncate">Partner Profile</h4>
                  <p className="text-[10px] text-stone-400 truncate">
                    Sponsor ID: <span className="font-mono font-bold text-emerald-400">{agent.id}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-stone-800 disabled:text-stone-500 disabled:border-stone-800 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] border border-emerald-500/30"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden xs:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Fields Content */}
            <div className="p-5 md:p-6 space-y-6 font-sans bg-white overflow-y-auto flex-1">
                
                {/* Profile alerts / banners */}
                {profileSuccess && (
                  <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-xl text-emerald-850 text-xs font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="bg-rose-50 border border-rose-250 p-3 rounded-xl text-rose-850 text-xs font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                {/* SECTION 1: Locked KYC fields */}
                <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50/30">
                  <button
                    type="button"
                    onClick={() => setIsKycExpanded(!isKycExpanded)}
                    className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-stone-500 shrink-0" />
                      <div>
                        <h5 className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">KYC Compliance (Locked)</h5>
                        <p className="text-[9.5px] text-stone-450 font-sans mt-0.5">Verified identity & sponsor records</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${isKycExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isKycExpanded && (
                    <div className="p-4 space-y-4 bg-white border-t border-stone-200 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div>
                          <label className="text-[10px] font-bold text-stone-450 uppercase block mb-1">Full Name</label>
                          <div className="px-3 py-2 text-xs rounded-lg border border-stone-150 bg-stone-50 text-stone-500 font-medium cursor-not-allowed flex justify-between items-center">
                            <span>{agent.name}</span>
                            <Lock className="w-3 h-3 text-stone-300" />
                          </div>
                        </div>

                        {/* Mobile */}
                        <div>
                          <label className="text-[10px] font-bold text-stone-450 uppercase block mb-1">Mobile Sourcing Phone</label>
                          <div className="px-3 py-2 text-xs rounded-lg border border-stone-150 bg-stone-50 text-stone-500 font-mono cursor-not-allowed flex justify-between items-center">
                            <span>{agent.phone}</span>
                            <Lock className="w-3 h-3 text-stone-300" />
                          </div>
                        </div>

                        {/* Sponsor */}
                        <div>
                          <label className="text-[10px] font-bold text-stone-450 uppercase block mb-1">Upstream Sponsor</label>
                          <div className="px-3 py-2 text-xs rounded-lg border border-stone-150 bg-stone-50 text-stone-500 font-medium cursor-not-allowed flex justify-between items-center">
                            <span>{users.find(u => u.id === agent.sponsorId)?.name ? `${users.find(u => u.id === agent.sponsorId)?.name} (${agent.sponsorId})` : (agent.sponsorId || 'SBR Root Core')}</span>
                            <Lock className="w-3 h-3 text-stone-300" />
                          </div>
                        </div>

                        {/* DOB */}
                        <div>
                          <label className="text-[10px] font-bold text-stone-450 uppercase block mb-1">Date of Birth (DOB)</label>
                          <div className="px-3 py-2 text-xs rounded-lg border border-stone-150 bg-stone-50 text-stone-500 font-mono cursor-not-allowed flex justify-between items-center">
                            <span>{agent.dob || 'Not Provided'}</span>
                            <Lock className="w-3 h-3 text-stone-300" />
                          </div>
                        </div>

                        {/* Aadhar */}
                        <div>
                          <label className="text-[10px] font-bold text-stone-450 uppercase block mb-1">Aadhar Card Number</label>
                          <div className="px-3 py-2 text-xs rounded-lg border border-stone-150 bg-stone-50 text-stone-500 font-mono cursor-not-allowed flex justify-between items-center">
                            <span>{agent.aadhar || 'Not Provided'}</span>
                            <Lock className="w-3 h-3 text-stone-300" />
                          </div>
                        </div>

                        {/* PAN */}
                        <div>
                          <label className="text-[10px] font-bold text-stone-450 uppercase block mb-1">Permanent Account Number (PAN)</label>
                          <div className="px-3 py-2 text-xs rounded-lg border border-stone-150 bg-stone-50 text-stone-500 font-mono cursor-not-allowed flex justify-between items-center">
                            <span>{agent.pan || 'Not Provided'}</span>
                            <Lock className="w-3 h-3 text-stone-300" />
                          </div>
                        </div>
                      </div>

                      <p className="text-[9.5px] text-stone-450 italic font-sans">
                        * Locked fields can only be modified with administrative verification of legal identity documents.
                      </p>
                    </div>
                  )}
                </div>

                {/* SECTION 2: Editable bank/nominee details */}
                <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50/30">
                  <button
                    type="button"
                    onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                    className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-emerald-850 shrink-0" />
                      <div>
                        <h5 className="text-[11px] font-bold text-emerald-850 uppercase tracking-wider">Profile Info & Bank Details</h5>
                        <p className="text-[9.5px] text-emerald-700/70 font-sans mt-0.5">Edit nominee, father/husband & bank accounts</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-emerald-800 transition-transform duration-200 ${isProfileExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileExpanded && (
                    <div className="p-4 space-y-4 bg-white border-t border-stone-200 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Father's / Husband's Name */}
                        <div className="col-span-1 sm:col-span-2">
                          <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">Father's / Husband's Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Satpute"
                            value={fatherOrHusbandName}
                            onChange={(e) => setFatherOrHusbandName(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                          />
                        </div>

                        {/* Bank Account Number */}
                        <div>
                          <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">Bank Account Number</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 501002931289"
                            value={bankAccountNumber}
                            onChange={(e) => setBankAccountNumber(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                          />
                        </div>

                        {/* IFSC */}
                        <div>
                          <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">IFSC Code</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. HDFC0000240"
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-emerald-700"
                          />
                        </div>

                        {/* Branch Name */}
                        <div className="col-span-1 sm:col-span-2">
                          <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">Branch Name & Location</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. HDFC Bank, Sector 56, Gurgaon"
                            value={branchName}
                            onChange={(e) => setBranchName(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                          />
                        </div>

                        {/* Nominee Name */}
                        <div>
                          <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">Nominee Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sarita Devi"
                            value={nominee}
                            onChange={(e) => setNominee(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                          />
                        </div>

                        {/* Nominee Relation */}
                        <div>
                          <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">Nominee Relation</label>
                          <select
                            value={nomineeRelation}
                            onChange={(e) => setNomineeRelation(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                          >
                            <option value="">Select Relation</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Mother">Mother</option>
                            <option value="Father">Father</option>
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons (pinned at bottom of modal) */}
              <div className="bg-stone-50 border-t border-stone-150 p-4 sm:p-5 flex gap-3 justify-end shrink-0 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-800/60 text-white text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </button>
              </div>
          </form>
        </div>
      )}
    </div>
  );
}
