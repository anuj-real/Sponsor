import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { 
  ChevronRight, 
  ChevronDown, 
  Users, 
  Landmark, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Move, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle,
  Network,
  List
} from 'lucide-react';

interface TreeVisualizerProps {
  users: User[];
  onSelectUser?: (userId: string) => void;
  selectedUserId?: string | null;
  hideUpline?: boolean;
}

export default function TreeVisualizer({ users, onSelectUser, selectedUserId, hideUpline }: TreeVisualizerProps) {
  const [viewMode, setViewMode] = useState<'MLM' | 'LIST'>('MLM');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'SBR': true,
    'C': true,
    'ADMIN1': true,
    'A1': true,
    'ADMIN2': true,
    'A2': true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pan and Zoom State
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Find root users (users who do not have an active sponsor in the system)
  const rootUsers = users.filter(u => !u.sponsorId || !users.some(parent => parent.id === u.sponsorId));

  // Get dynamic downline counts
  const getDownlineCount = (userId: string): number => {
    const directChildren = users.filter(u => u.sponsorId === userId);
    return directChildren.length + directChildren.reduce((acc, child) => acc + getDownlineCount(child.id), 0);
  };

  // Get total network sales value
  const getNetworkVolume = (userId: string): number => {
    const directSales = users.find(u => u.id === userId)?.totalDirectSales || 0;
    const directChildren = users.filter(u => u.sponsorId === userId);
    const subVolume = directChildren.reduce((acc, child) => acc + getNetworkVolume(child.id), 0);
    return directSales + subVolume;
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleNodeClick = (userId: string) => {
    if (onSelectUser) {
      onSelectUser(userId);
    }
  };

  // Auto-expand ancestors when searched or selected
  useEffect(() => {
    if (searchQuery) {
      const matched = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matched.length > 0) {
        setExpandedNodes(prev => {
          const next = { ...prev };
          matched.forEach(user => {
            let current = user;
            while (current && current.sponsorId) {
              next[current.sponsorId] = true;
              current = users.find(u => u.id === current.sponsorId)!;
            }
          });
          return next;
        });
      }
    }
  }, [searchQuery, users]);

  useEffect(() => {
    if (selectedUserId) {
      setExpandedNodes(prev => {
        const next = { ...prev };
        let current = users.find(u => u.id === selectedUserId);
        while (current && current.sponsorId) {
          next[current.sponsorId] = true;
          current = users.find(u => u.id === current.sponsorId)!;
        }
        return next;
      });
    }
  }, [selectedUserId, users]);

  // Drag handlers for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if left click and clicking background or nodes with pan intent
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const resetPanAndZoom = () => {
    setZoom(0.85);
    setPan({ x: 0, y: 0 });
  };

  const adjustZoom = (amount: number) => {
    setZoom(prev => Math.min(1.5, Math.max(0.3, prev + amount)));
  };

  // Rank-based styling classes
  const getDesignationColorClasses = (designation?: string) => {
    const d = designation?.toUpperCase() || '';
    if (d.includes('CROWN')) return 'from-amber-500 to-yellow-600 text-white shadow-amber-200';
    if (d.includes('PLATINUM')) return 'from-slate-600 to-zinc-800 text-white shadow-zinc-300';
    if (d.includes('GOLD') || d.includes('GM')) return 'from-yellow-500 to-amber-600 text-white shadow-yellow-200';
    if (d.includes('SILVER') || d.includes('MANAGER')) return 'from-teal-500 to-emerald-600 text-white shadow-teal-200';
    return 'from-emerald-500 to-emerald-600 text-white shadow-emerald-200';
  };

  // Recursive Directory Tree (LIST View)
  const renderTreeNodeList = (user: User, level: number = 0) => {
    const directChildren = users.filter(u => u.sponsorId === user.id);
    const hasChildren = directChildren.length > 0;
    const isExpanded = !!expandedNodes[user.id];
    const isSelected = selectedUserId === user.id;
    const totalDownlines = getDownlineCount(user.id);
    const networkVolume = getNetworkVolume(user.id);

    const matchesSearch = searchQuery 
      ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.id.toLowerCase().includes(searchQuery.toLowerCase())
      : false;

    return (
      <div key={user.id} className="relative pl-6 select-none" id={`node-list-${user.id}`}>
        {level > 0 && (
          <div 
            className="absolute left-0 top-0 bottom-0 border-l border-stone-200"
            style={{ height: '24px', top: '0px', left: '12px' }} 
          />
        )}
        {level > 0 && (
          <div 
            className="absolute border-t border-stone-200"
            style={{ width: '16px', top: '24px', left: '12px' }} 
          />
        )}

        <div className="pt-2 pb-1">
          <div
            onClick={() => handleNodeClick(user.id)}
            className={`
              flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer max-w-2xl
              ${isSelected 
                ? 'border-emerald-600 bg-emerald-55 shadow-sm ring-2 ring-emerald-600/25' 
                : matchesSearch 
                  ? 'border-amber-500 bg-amber-50/20'
                  : 'border-stone-200 bg-white hover:border-emerald-300 hover:bg-stone-50'
              }
            `}
          >
            <div className="flex items-center gap-3">
              {hasChildren ? (
                <button
                  onClick={(e) => toggleExpand(user.id, e)}
                  className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors"
                  aria-label={isExpanded ? 'Collapse downlines' : 'Expand downlines'}
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <div className="w-5.5 h-5.5 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-stone-900 text-sm">{user.name}</h4>
                  <span className="text-[11px] font-mono font-medium text-emerald-700 px-1.5 py-0.5 rounded-md bg-emerald-50">
                    {user.id}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-teal-800">
                    {user.designation || 'Associate'}
                  </span>
                  <span className="text-[10.5px] text-stone-500 flex items-center gap-0.5">
                    <Users className="w-3 h-3" /> {totalDownlines} Downlines
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 sm:mt-0 pt-2.5 sm:pt-0 sm:text-right border-t sm:border-t-0 border-stone-100 flex justify-between sm:block">
              <span className="text-[10px] uppercase tracking-wider font-medium text-stone-400 block">Network Vol.</span>
              <span className="font-mono font-bold text-stone-800 text-xs sm:text-sm">
                {Math.round(networkVolume).toLocaleString()} PTS
              </span>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="relative pl-4 border-l border-dashed border-stone-200 ml-3">
            {directChildren.map(child => renderTreeNodeList(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Recursive MLM Orthogonal Tree Node
  const renderMLMNode = (user: User) => {
    const directChildren = users.filter(u => u.sponsorId === user.id);
    const hasChildren = directChildren.length > 0;
    const isExpanded = !!expandedNodes[user.id];
    const isSelected = selectedUserId === user.id;
    const totalDownlines = getDownlineCount(user.id);
    const networkVolume = getNetworkVolume(user.id);

    const matchesSearch = searchQuery 
      ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.id.toLowerCase().includes(searchQuery.toLowerCase())
      : false;

    return (
      <div key={user.id} className="flex flex-col items-center flex-shrink-0" id={`mlm-node-${user.id}`}>
        {/* Node Card wrapper with floating collapse toggle */}
        <div className="relative flex flex-col items-center group">
          <div
            onClick={() => handleNodeClick(user.id)}
            className={`
              w-56 bg-white border rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center text-center
              ${isSelected 
                ? 'border-emerald-600 bg-emerald-50/5 ring-2 ring-emerald-600/30 shadow-lg shadow-emerald-150' 
                : matchesSearch 
                  ? 'border-amber-500 bg-amber-50/10 ring-2 ring-amber-500/20'
                  : 'border-stone-200 hover:border-emerald-400'
              }
            `}
          >
            {/* Associate Info & Compact Status Dot */}
            <div className="flex items-center gap-1.5 justify-center">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                user.status === 'ACTIVE' ? 'bg-emerald-500 shadow-sm animate-pulse' : 'bg-stone-300'
              }`} />
              <h4 className="font-bold text-stone-900 text-xs tracking-tight line-clamp-1">{user.name}</h4>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[9.5px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50">
                {user.id}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200/50 text-stone-600">
                {user.designation || 'Associate'}
              </span>
            </div>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-2 gap-x-2 w-full mt-3 pt-2 border-t border-stone-150 text-[10px]">
              <div className="text-left border-r border-stone-100 pr-1">
                <span className="text-stone-400 block text-[8px] uppercase font-semibold">Team Size</span>
                <span className="font-bold text-stone-700 font-mono flex items-center gap-0.5">
                  <Users className="w-2.5 h-2.5 text-stone-400" /> {totalDownlines}
                </span>
              </div>
              <div className="text-right pl-1">
                <span className="text-stone-400 block text-[8px] uppercase font-semibold">Volume</span>
                <span className="font-bold text-stone-700 font-mono">
                  {Math.round(networkVolume)} PTS
                </span>
              </div>
            </div>
          </div>

          {/* Dedicated Expand/Collapse Floating Toggle Button */}
          {hasChildren && (
            <button
              onClick={(e) => toggleExpand(user.id, e)}
              className={`
                absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full border border-stone-200 bg-white hover:bg-stone-50 hover:border-emerald-400 text-stone-500 shadow-xs flex items-center justify-center transition-all z-10
                ${isExpanded ? 'text-emerald-600 hover:text-emerald-700' : 'text-stone-500'}
              `}
              aria-label={isExpanded ? 'Collapse tree branch' : 'Expand tree branch'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <span className="text-[10px] font-bold font-mono flex items-center justify-center gap-0.5">
                  +{directChildren.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Orthogonal Connections and Children Row */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col items-center pt-5">
            {/* Direct vertical line dropping from current node */}
            <div className="w-px h-6 bg-stone-300" />

            {/* Row container of child columns */}
            <div className="relative flex gap-x-8 pt-6">
              {/* Horizontal bridge connecting all children */}
              {directChildren.length > 1 && (
                <div 
                  className="absolute top-0 h-px bg-stone-300"
                  style={{ 
                    left: `${100 / (directChildren.length * 2)}%`, 
                    right: `${100 / (directChildren.length * 2)}%` 
                  }}
                />
              )}

              {directChildren.map((child) => (
                <div key={child.id} className="relative flex flex-col items-center">
                  {/* Vertical drop line connected to the horizontal bridge */}
                  <div className="w-px h-6 bg-stone-300 absolute top-0" />
                  
                  {/* Recurse to render grandchildren */}
                  {renderMLMNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Primary Tree Canvas */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-250 p-5 shadow-xs flex flex-col h-[650px]">
        {/* Toolbar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-150 z-10 bg-white">
          <div>
            <h3 className="font-bold text-stone-900 flex items-center gap-2 text-base font-serif">
              <Network className="w-5 h-5 text-emerald-800" /> SBR Referral Organigram
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Select any node to inspect metrics. Use controls or drag canvas to explore the MLM structure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5">
              <button
                onClick={() => setViewMode('MLM')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'MLM' 
                    ? 'bg-white text-emerald-950 shadow-xs border border-stone-200/50' 
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Network className="w-3.5 h-3.5" /> MLM Tree
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'LIST' 
                    ? 'bg-white text-emerald-950 shadow-xs border border-stone-200/50' 
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <List className="w-3.5 h-3.5" /> List View
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search partner by name/ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-full sm:w-52 text-xs rounded-lg border border-stone-200 outline-none focus:ring-2 focus:ring-emerald-800/20 transition-all bg-stone-50/50 focus:bg-white"
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-400" />
            </div>
          </div>
        </div>

        {/* Dynamic Canvas Container */}
        {viewMode === 'MLM' ? (
          <div className="relative flex-1 bg-stone-50/40 rounded-xl border border-stone-100 overflow-hidden mt-4">
            {/* Floating Navigation Controls */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white rounded-lg border border-stone-200 p-1 shadow-sm z-20">
              <button
                onClick={() => adjustZoom(0.1)}
                className="p-1.5 rounded hover:bg-stone-50 text-stone-600 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => adjustZoom(-0.1)}
                className="p-1.5 rounded hover:bg-stone-50 text-stone-600 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-stone-200 mx-1" />
              <button
                onClick={resetPanAndZoom}
                className="p-1.5 rounded hover:bg-stone-50 text-stone-600 transition-colors flex items-center gap-1 text-[11px] font-bold"
                title="Fit Canvas"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Fit
              </button>
            </div>

            {/* Drag Help Overlay */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-stone-400 text-[10px] font-medium font-mono pointer-events-none z-20">
              <Move className="w-3.5 h-3.5" /> Drag canvas to pan
            </div>

            {/* Interactive Tree Viewport */}
            <div
              ref={treeContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className={`w-full h-full overflow-hidden select-none relative ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {/* Inner container applying the pan-and-zoom transformation */}
              <div
                className="absolute origin-top transition-transform duration-75"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  left: '50%',
                  top: '40px',
                  transformOrigin: 'top center'
                }}
              >
                {/* Centering spacer */}
                <div className="relative -left-1/2 flex justify-center pb-20">
                  {rootUsers.map((rootUser) => (
                    <div key={rootUser.id} className="mx-6">
                      {renderMLMNode(rootUser)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Directory List Mode (Expanded Scrollable List) */
          <div className="flex-1 overflow-y-auto overflow-x-auto py-4 pr-2 custom-scrollbar mt-4">
            <div className="space-y-2 min-w-max">
              {rootUsers.map(rootUser => renderTreeNodeList(rootUser))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Node Details Card */}
      <div className="bg-white rounded-2xl border border-stone-250 p-5 shadow-xs flex flex-col justify-between h-[650px] overflow-y-auto custom-scrollbar">
        {selectedUser ? (
          <div className="space-y-5 animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-stone-400 font-mono tracking-wider">Selected Associate</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedUser.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-800'
                }`}>
                  {selectedUser.status}
                </span>
              </div>
              <h3 className="font-bold text-stone-900 text-lg mt-1 font-serif">{selectedUser.name}</h3>
              <div className="flex flex-wrap gap-1.5 items-center mt-1.5">
                <span className="text-xs text-stone-500 font-mono font-bold bg-stone-100 px-1.5 py-0.5 rounded">{selectedUser.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 border border-teal-200/40 text-teal-700 rounded-md font-mono">{selectedUser.designation || 'Associate'}</span>
              </div>
            </div>

            {/* Hierarchical Connections Info */}
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/50 space-y-3">
              {!hideUpline && (
                <div>
                  <dt className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Upline Sponsor</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5 text-stone-400" />
                    {selectedUser.sponsorId && users.some(u => u.id === selectedUser.sponsorId) ? (
                      <div className="text-xs font-medium text-stone-800 bg-white px-2 py-1.5 rounded border border-stone-150 inline-flex items-center gap-1">
                        <span className="font-bold text-emerald-800">{selectedUser.sponsorId}</span>
                        <span>({users.find(u => u.id === selectedUser.sponsorId)?.name || 'Direct Associate'})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded font-medium border border-amber-200 select-none">
                        Direct (Top Level Director)
                      </span>
                    )}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Immediate Recruits</dt>
                <dd className="mt-1 flex gap-1.5 flex-wrap">
                  {users.filter(u => u.sponsorId === selectedUser.id).length > 0 ? (
                    users.filter(u => u.sponsorId === selectedUser.id).map(u => (
                      <span key={u.id} className="text-[10.5px] bg-white border border-stone-200 px-2 py-1 rounded text-stone-700 font-medium font-mono">
                        {u.name} ({u.id})
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-400 italic">No direct boots onboarded yet</span>
                  )}
                </dd>
              </div>
            </div>

            {/* Downline Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-stone-150 rounded-xl p-3 bg-stone-50/50">
                <span className="text-[10px] font-medium text-stone-400 block uppercase">Network Size</span>
                <span className="font-mono font-bold text-stone-800 text-lg block mt-1">
                  {getDownlineCount(selectedUser.id)} Agents
                </span>
                <span className="text-[9px] text-stone-400 mt-0.5 block">Direct & Indirect partners</span>
              </div>

              <div className="border border-stone-150 rounded-xl p-3 bg-stone-50/50">
                <span className="text-[10px] font-medium text-stone-400 block uppercase">Network Sales</span>
                <span className="font-mono font-bold text-stone-800 text-lg block mt-1">
                  {getNetworkVolume(selectedUser.id).toLocaleString()} PTS
                </span>
                <span className="text-[9px] text-stone-400 mt-0.5 block">Sum of downline + direct</span>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-xs text-stone-500">
                <span>Personal Portfolio Contribution</span>
                <span className="font-mono font-semibold text-stone-800">
                  {getNetworkVolume(selectedUser.id) > 0 
                    ? `${((selectedUser.totalDirectSales / getNetworkVolume(selectedUser.id)) * 100).toFixed(0)}%`
                    : '0%'}
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5">
                <div 
                  className="bg-emerald-800 h-1.5 rounded-full" 
                  style={{ 
                    width: `${getNetworkVolume(selectedUser.id) > 0 
                      ? Math.min(100, (selectedUser.totalDirectSales / getNetworkVolume(selectedUser.id)) * 100)
                      : 0}%` 
                  }}
                />
              </div>
            </div>

            {/* SBR Career Designation Requirements Progress Tracker */}
            <div className="bg-teal-55/50 border border-teal-200/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 border-b border-teal-200/50 pb-2">
                <Users className="w-4.5 h-4.5 text-teal-700" />
                <h4 className="text-xs font-bold text-teal-900 uppercase font-mono tracking-wider">Designation Eligibility Status</h4>
              </div>
              
              <div className="text-[11px] text-teal-800 space-y-1 bg-white/45 p-2.5 rounded-lg border border-teal-150 font-mono">
                <div className="flex justify-between">
                  <span>Direct Sales (PTS):</span>
                  <span className="font-bold text-teal-950">{selectedUser.totalDirectSales} PTS</span>
                </div>
                <div className="flex justify-between">
                  <span>Downline Team Members:</span>
                  <span className="font-bold text-teal-950">{getDownlineCount(selectedUser.id)} Members</span>
                </div>
                <div className="flex justify-between border-t border-teal-200/40 pt-1 mt-1 font-sans">
                  <span className="text-[10.5px]">Assigned Designation:</span>
                  <strong className="text-teal-900">{selectedUser.designation || 'Associate'}</strong>
                </div>
              </div>

              <div className="space-y-2.5 text-xs pt-1">
                {/* Manager Requirement */}
                <div className={`p-2.5 rounded-lg border transition-all ${
                  getDownlineCount(selectedUser.id) >= 12 && selectedUser.totalDirectSales >= 4 
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-250 font-semibold' 
                    : 'bg-stone-50/70 text-stone-700 border-stone-200'
                }`}>
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1.5">
                      {getDownlineCount(selectedUser.id) >= 12 && selectedUser.totalDirectSales >= 4 ? '🟢' : '⚪'}
                      Manager
                    </span>
                    <span className="font-mono text-[10.5px]">
                      {selectedUser.totalDirectSales}/4 PTS • {getDownlineCount(selectedUser.id)}/12 Team
                    </span>
                  </div>
                </div>

                {/* Sr. Manager Requirement */}
                <div className={`p-2.5 rounded-lg border transition-all ${
                  getDownlineCount(selectedUser.id) >= 30 && selectedUser.totalDirectSales >= 7 
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-250 font-semibold' 
                    : 'bg-stone-50/70 text-stone-700 border-stone-200'
                }`}>
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1.5">
                      {getDownlineCount(selectedUser.id) >= 30 && selectedUser.totalDirectSales >= 7 ? '🟢' : '⚪'}
                      Sr. Manager
                    </span>
                    <span className="font-mono text-[10.5px]">
                      {selectedUser.totalDirectSales}/7 PTS • {getDownlineCount(selectedUser.id)}/30 Team
                    </span>
                  </div>
                </div>

                {/* AGM Requirement */}
                <div className={`p-2.5 rounded-lg border transition-all ${
                  getDownlineCount(selectedUser.id) >= 60 && selectedUser.totalDirectSales >= 9 
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-250 font-semibold' 
                    : 'bg-stone-50/70 text-stone-700 border-stone-200'
                }`}>
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1.5">
                      {getDownlineCount(selectedUser.id) >= 60 && selectedUser.totalDirectSales >= 9 ? '🟢' : '⚪'}
                      AGM
                    </span>
                    <span className="font-mono text-[10.5px]">
                      {selectedUser.totalDirectSales}/9 PTS • {getDownlineCount(selectedUser.id)}/60 Team
                    </span>
                  </div>
                </div>

                {/* GM Requirement */}
                <div className={`p-2.5 rounded-lg border transition-all ${
                  getDownlineCount(selectedUser.id) >= 100 && selectedUser.totalDirectSales >= 10 
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-250 font-semibold' 
                    : 'bg-stone-50/70 text-stone-700 border-stone-200'
                }`}>
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1.5">
                      {getDownlineCount(selectedUser.id) >= 100 && selectedUser.totalDirectSales >= 10 ? '🟢' : '⚪'}
                      GM
                    </span>
                    <span className="font-mono text-[10.5px]">
                      {selectedUser.totalDirectSales}/10 PTS • {getDownlineCount(selectedUser.id)}/100 Team
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <Users className="w-12 h-12 text-stone-300 stroke-1 mb-3" />
            <h4 className="font-bold text-stone-800 text-sm font-serif">Select an Associate</h4>
            <p className="text-xs text-stone-400 mt-1 max-w-[200px] leading-relaxed mx-auto">
              Select any associate node from the tree to examine uplines, recruits, and downline volume.
            </p>
          </div>
        )}

        {/* Whitelabel watermark */}
        <div className="border-t border-stone-100 pt-3 mt-6 text-center">
          <p className="text-[10px] text-stone-400 font-mono">
            SBR Associates • Whitelabel ID Management
          </p>
        </div>
      </div>
    </div>
  );
}
