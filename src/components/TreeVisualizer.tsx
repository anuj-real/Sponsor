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
    // Smooth scroll to the details card on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const detailsCard = document.getElementById('selected-node-details');
        if (detailsCard) {
          detailsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 350);
    }
  };

  // Detect mobile device on mount to default to MLM Tree with zoomed out view
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode('MLM');
      setZoom(0.85); // Nice, crisp readable default zoom on mobile
      setPan({ x: 0, y: 30 });
    } else {
      setViewMode('MLM');
      setZoom(1.0); // Full scale on desktop
      setPan({ x: 0, y: 10 });
    }
  }, []);

  // Auto-center the selected node in the viewport smoothly
  useEffect(() => {
    if (viewMode === 'MLM' && selectedUserId) {
      const timer = setTimeout(() => {
        const nodeEl = document.getElementById(`mlm-node-${selectedUserId}`);
        const viewportEl = treeContainerRef.current;
        if (nodeEl && viewportEl) {
          const rectNode = nodeEl.getBoundingClientRect();
          const rectViewport = viewportEl.getBoundingClientRect();
          
          // Calculate screen center delta
          const viewportCenterX = rectViewport.left + rectViewport.width / 2;
          const viewportCenterY = rectViewport.top + rectViewport.height / 2;
          
          const nodeCenterX = rectNode.left + rectNode.width / 2;
          const nodeCenterY = rectNode.top + rectNode.height / 2;
          
          const dx = viewportCenterX - nodeCenterX;
          const dy = viewportCenterY - nodeCenterY;
          
          setPan(prev => ({
            x: prev.x + dx,
            y: prev.y + dy
          }));
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedUserId, viewMode]);

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

  // Drag handlers for pan (Mouse)
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

  // Multi-touch gesture states for pinch-to-zoom on mobile
  const touchDistanceStart = useRef<number | null>(null);
  const lastTouchZoom = useRef<number>(0.85);

  // Drag handlers for pan (Touch/Mobile with Pinch-to-zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
      touchDistanceStart.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false); // Stop standard panning when pinching
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceStart.current = dist;
      lastTouchZoom.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y
      });
    } else if (e.touches.length === 2 && touchDistanceStart.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchDistanceStart.current;
      const newZoom = Math.min(1.2, Math.max(0.65, lastTouchZoom.current * factor));
      setZoom(newZoom);
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomIntensity = 0.05;
    const delta = e.deltaY < 0 ? 1 : -1;
    setZoom(prev => Math.min(1.2, Math.max(0.65, prev + delta * zoomIntensity)));
  };

  const resetPanAndZoom = () => {
    if (window.innerWidth < 768) {
      setZoom(0.85);
      setPan({ x: 0, y: 30 });
    } else {
      setZoom(1.0);
      setPan({ x: 0, y: 10 });
    }
  };

  const adjustZoom = (amount: number) => {
    setZoom(prev => Math.min(1.2, Math.max(0.65, prev + amount)));
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
                w-28 bg-white border rounded-lg p-1.5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center text-center gap-1 relative
                ${isSelected 
                  ? 'border-emerald-600 bg-emerald-50/5 ring-2 ring-emerald-600/30 shadow-md shadow-emerald-100' 
                  : matchesSearch 
                    ? 'border-amber-500 bg-amber-50/10 ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:border-emerald-400'
                }
              `}
            >
              {/* Status dot + Name */}
              <div className="flex items-center gap-1 justify-center w-full min-w-0">
                <span className={`w-1 h-1 rounded-full flex-shrink-0 ${
                  user.status === 'ACTIVE' ? 'bg-emerald-500 shadow-xs animate-pulse' : 'bg-stone-300'
                }`} />
                <h4 className="font-bold text-stone-900 text-[9.5px] tracking-tight truncate leading-tight w-full" title={user.name}>
                  {user.name}
                </h4>
              </div>

              {/* User ID */}
              <span className="text-[7.5px] font-mono font-bold text-stone-500 bg-stone-50 px-1 py-0.2 rounded border border-stone-200/30 leading-none">
                {user.id}
              </span>
            </div>

            {/* Dedicated Expand/Collapse Floating Toggle Button */}
            {hasChildren && (
              <button
                onClick={(e) => toggleExpand(user.id, e)}
                className={`
                  absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5.5 h-5.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 hover:border-emerald-400 text-stone-500 shadow-xs flex items-center justify-center transition-all z-10
                  ${isExpanded ? 'text-emerald-600 hover:text-emerald-700' : 'text-stone-500'}
                `}
                aria-label={isExpanded ? 'Collapse tree branch' : 'Expand tree branch'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[8px] font-bold font-mono flex items-center justify-center">
                    +{directChildren.length}
                  </span>
                )}
              </button>
            )}
          </div>

        {/* Orthogonal Connections and Children Row */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col items-center pt-2 sm:pt-4">
            {/* Direct vertical line dropping from current node */}
            <div className="w-px h-3 sm:h-5 bg-stone-300" />

            {/* Row container of child columns */}
            <div className="relative flex gap-x-2.5 sm:gap-x-4 pt-3 sm:pt-4">
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
                  <div className="w-px h-3 sm:h-5 bg-stone-300 absolute top-0" />
                  
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
      <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-250 p-4 sm:p-5 shadow-xs flex flex-col h-[680px] md:h-[650px] lg:h-[700px]">
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
              <Move className="w-3.5 h-3.5" /> Drag or Swipe to pan
            </div>

            {/* Interactive Tree Viewport */}
            <div
              ref={treeContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUpOrLeave}
              onTouchCancel={handleMouseUpOrLeave}
              onWheel={handleWheel}
              className={`w-full h-full overflow-hidden select-none relative ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {/* Inner container applying the pan-and-zoom transformation */}
              <div
                className={`absolute origin-top ${isDragging ? 'transition-none' : 'transition-all duration-500 ease-out'}`}
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
      <div id="selected-node-details" className="bg-white rounded-2xl border border-stone-250 p-4 sm:p-5 shadow-xs flex flex-col justify-between h-[520px] md:h-[650px] lg:h-[700px] overflow-y-auto custom-scrollbar">
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
