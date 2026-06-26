import React, { useState } from 'react';
import { User } from '../types';
import { ChevronRight, ChevronDown, UserCheck, ShieldAlert, Award, Search, Users, Landmark, TrendingUp } from 'lucide-react';

interface TreeVisualizerProps {
  users: User[];
  onSelectUser?: (userId: string) => void;
  selectedUserId?: string | null;
}

export default function TreeVisualizer({ users, onSelectUser, selectedUserId }: TreeVisualizerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'SBR-1001': true, // Auto-expand crown sponsor by default
  });
  const [searchQuery, setSearchQuery] = useState('');

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

  // Rank-based styling classes
  const getRankBadgeClasses = (rank: User['rank']) => {
    switch (rank) {
      case 'Crown Club':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Platinum Elite':
        return 'bg-slate-150 text-slate-900 border-slate-350';
      case 'Gold Partner':
        return 'bg-yellow-10 border-yellow-300 text-yellow-900';
      case 'Silver Agent':
        return 'bg-zinc-100 border-zinc-300 text-zinc-900';
      default:
        return 'bg-emerald-50 text-emerald-900 border-emerald-200';
    }
  };

  // Recursive tree rendering
  const renderTreeNode = (user: User, level: number = 0) => {
    const directChildren = users.filter(u => u.sponsorId === user.id);
    const hasChildren = directChildren.length > 0;
    const isExpanded = !!expandedNodes[user.id];
    const isSelected = selectedUserId === user.id;
    const totalDownlines = getDownlineCount(user.id);
    const networkVolume = getNetworkVolume(user.id);

    // Filter children based on search if needed (but usually we search to highlight)
    const matchesSearch = searchQuery 
      ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.id.toLowerCase().includes(searchQuery.toLowerCase())
      : false;

    return (
      <div key={user.id} className="relative pl-6 select-none" id={`node-${user.id}`}>
        {/* Hierarchical Connecting Line */}
        {level > 0 && (
          <div 
            className="absolute left-0 top-0 bottom-0 border-l border-zinc-200"
            style={{ 
              height: '24px', 
              top: '0px', 
              left: '12px' 
            }} 
          />
        )}
        {level > 0 && (
          <div 
            className="absolute border-t border-zinc-200"
            style={{ 
              width: '16px', 
              top: '24px', 
              left: '12px' 
            }} 
          />
        )}

        {/* Node Container */}
        <div className="pt-2 pb-1">
          <div
            onClick={() => handleNodeClick(user.id)}
            className={`
              flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer max-w-2xl
              ${isSelected 
                ? 'border-indigo-600 bg-indigo-50/10 shadow-sm ring-2 ring-indigo-600/20' 
                : matchesSearch 
                  ? 'border-pink-500 bg-pink-50/10 animate-pulse'
                  : 'border-zinc-200 bg-white hover:border-indigo-300 hover:bg-zinc-50'
              }
            `}
          >
            <div className="flex items-center gap-3">
              {/* Expand Toggle Button */}
              {hasChildren ? (
                <button
                  onClick={(e) => toggleExpand(user.id, e)}
                  className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition-colors"
                  aria-label={isExpanded ? 'Collapse downlines' : 'Expand downlines'}
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <div className="w-5.5 h-5.5 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                </div>
              )}

              {/* Agent Detail */}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-zinc-900 text-sm">{user.name}</h4>
                  <span className="text-[11px] font-mono font-medium text-indigo-600 px-1.5 py-0.5 rounded-md bg-indigo-50">
                    {user.id}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-teal-200 bg-teal-55 text-teal-850">
                    {user.designation || 'Associate'}
                  </span>
                  <span className="text-[10.5px] text-zinc-500 flex items-center gap-0.5">
                    <Users className="w-3 h-3" /> {totalDownlines} Downlines
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Overview on Node */}
            <div className="mt-2.5 sm:mt-0 pt-2.5 sm:pt-0 sm:text-right border-t sm:border-t-0 border-zinc-100 flex justify-between sm:block">
              <span className="text-[10px] uppercase tracking-wider font-medium text-zinc-400 block">Network Vol.</span>
              <span className="font-mono font-bold text-zinc-800 text-xs sm:text-sm">
                {networkVolume >= 1000 ? `${(networkVolume).toFixed(2)} PTS` : `${networkVolume} PTS`}
              </span>
            </div>
          </div>
        </div>

        {/* Child Nodes */}
        {hasChildren && isExpanded && (
          <div className="relative pl-4 border-l border-dashed border-zinc-200 ml-3">
            {directChildren.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Find user to show inline upline stats if searched
  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visual Tree */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-250 p-5 shadow-xs flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-indigo-600" /> SBR Referral Organigram
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Click node to select. Collapse/expand downstream sponsor branches with toggles.
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search partner by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-full sm:w-60 text-xs rounded-lg border border-zinc-200 outline-none focus:ring-2 focus:ring-indigo-600/25 transition-all"
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
          </div>
        </div>

        <div className="overflow-x-auto py-4 min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar">
          {rootUsers.map(rootUser => renderTreeNode(rootUser))}
        </div>
      </div>

      {/* Selected Node Details Card */}
      <div className="bg-white rounded-2xl border border-zinc-250 p-5 shadow-xs flex flex-col justify-between">
        {selectedUser ? (
          <div className="space-y-5 animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider">Selected Associate</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedUser.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedUser.status}
                </span>
              </div>
              <h3 className="font-bold text-zinc-900 text-lg mt-1">{selectedUser.name}</h3>
              <div className="flex flex-wrap gap-1.5 items-center mt-1.5">
                <span className="text-xs text-zinc-500 font-mono font-bold bg-zinc-100 px-1.5 py-0.5 rounded">{selectedUser.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 border border-teal-200/40 text-teal-700 rounded-md font-mono">{selectedUser.designation || 'Associate'}</span>
              </div>
            </div>

            {/* Hierarchical Connections Info */}
            <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-200/50 space-y-3">
              <div>
                <dt className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Upline Sponsor</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-zinc-400" />
                  {selectedUser.sponsorId ? (
                    <div className="text-xs font-medium text-zinc-800 bg-white px-2 py-1.5 rounded border border-zinc-150 inline-flex items-center gap-1">
                      <span className="font-bold text-indigo-600">{selectedUser.sponsorId}</span>
                      <span>({users.find(u => u.id === selectedUser.sponsorId)?.name || 'Direct Associate'})</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded font-medium border border-amber-200 select-none">
                      Direct (Top Level Director)
                    </span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Immediate Recruits</dt>
                <dd className="mt-1 flex gap-1.5 flex-wrap">
                  {users.filter(u => u.sponsorId === selectedUser.id).length > 0 ? (
                    users.filter(u => u.sponsorId === selectedUser.id).map(u => (
                      <span key={u.id} className="text-[10.5px] bg-white border border-zinc-200 px-2 py-1 rounded text-zinc-700 font-medium font-mono">
                        {u.name} ({u.id})
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400 italic">No direct boots onboarded yet</span>
                  )}
                </dd>
              </div>
            </div>

            {/* Downline Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-zinc-150 rounded-xl p-3 bg-zinc-50/50">
                <span className="text-[10px] font-medium text-zinc-400 block uppercase">Network Size</span>
                <span className="font-mono font-bold text-zinc-800 text-lg block mt-1">
                  {getDownlineCount(selectedUser.id)} Agents
                </span>
                <span className="text-[9px] text-zinc-400 mt-0.5 block">Direct & Indirect partners</span>
              </div>

              <div className="border border-zinc-150 rounded-xl p-3 bg-zinc-50/50">
                <span className="text-[10px] font-medium text-zinc-400 block uppercase">Network Sales</span>
                <span className="font-mono font-bold text-zinc-800 text-lg block mt-1">
                  {getNetworkVolume(selectedUser.id).toLocaleString()} PTS
                </span>
                <span className="text-[9px] text-zinc-400 mt-0.5 block">Sum of downline + direct</span>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Personal Portfolio Contribution</span>
                <span className="font-mono font-semibold text-zinc-800">
                  {getNetworkVolume(selectedUser.id) > 0 
                    ? `${((selectedUser.totalDirectSales / getNetworkVolume(selectedUser.id)) * 100).toFixed(0)}%`
                    : '0%'}
                </span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-1.5">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full" 
                  style={{ 
                    width: `${getNetworkVolume(selectedUser.id) > 0 
                      ? Math.min(100, (selectedUser.totalDirectSales / getNetworkVolume(selectedUser.id)) * 100)
                      : 0}%` 
                  }}
                />
              </div>
            </div>

            {/* SBR Career Designation Requirements Progress Tracker */}
            <div className="bg-teal-50/50 border border-teal-200/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 border-b border-teal-200/50 pb-2">
                <Users className="w-4.5 h-4.5 text-teal-600" />
                <h4 className="text-xs font-bold text-teal-900 uppercase font-mono tracking-wider">Designation Eligibility Status</h4>
              </div>
              
              <div className="text-[11px] text-teal-800 space-y-1 bg-white/25 p-2.5 rounded-lg border border-teal-150 font-mono">
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
                    : 'bg-zinc-50/70 text-zinc-700 border-zinc-200'
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
                  <div className="text-[10px] text-zinc-500 mt-1 font-sans font-medium">Requirement: 4 Direct Sales (PTS) and 12 Team Members.</div>
                </div>

                {/* Sr. Manager Requirement */}
                <div className={`p-2.5 rounded-lg border transition-all ${
                  getDownlineCount(selectedUser.id) >= 30 && selectedUser.totalDirectSales >= 7 
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-250 font-semibold' 
                    : 'bg-zinc-50/70 text-zinc-700 border-zinc-200'
                }`}>
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1.5">
                      {getDownlineCount(selectedUser.id) >= 30 && selectedUser.totalDirectSales >= 7 ? '🟢' : '⚪'}
                      Sr. Manager
                    </span>
                    <span className="font-mono text-[10.5px]">
                      {selectedUser.totalDirectSales}/7 PTS • {getDownlineCount(selectedUser.id)}/30 Team (Total 42)
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 font-sans font-medium">Requirement: 7 Direct Sales (PTS) and 30 Team Members.</div>
                </div>

                {/* AGM Requirement */}
                <div className={`p-2.5 rounded-lg border transition-all ${
                  getDownlineCount(selectedUser.id) >= 60 && selectedUser.totalDirectSales >= 9 
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-250 font-semibold' 
                    : 'bg-zinc-50/70 text-zinc-700 border-zinc-200'
                }`}>
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1.5">
                      {getDownlineCount(selectedUser.id) >= 60 && selectedUser.totalDirectSales >= 9 ? '🟢' : '⚪'}
                      AGM
                    </span>
                    <span className="font-mono text-[10.5px]">
                      {selectedUser.totalDirectSales}/9 PTS • {getDownlineCount(selectedUser.id)}/60 Team (Total 102)
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 font-sans font-medium">Requirement: 9 Direct Sales (PTS) and 60 Team Members.</div>
                </div>

                {/* GM Requirement */}
                <div className={`p-2.5 rounded-lg border transition-all ${
                  getDownlineCount(selectedUser.id) >= 100 && selectedUser.totalDirectSales >= 10 
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-250 font-semibold' 
                    : 'bg-zinc-50/70 text-zinc-700 border-zinc-200'
                }`}>
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1.5">
                      {getDownlineCount(selectedUser.id) >= 100 && selectedUser.totalDirectSales >= 10 ? '🟢' : '⚪'}
                      GM
                    </span>
                    <span className="font-mono text-[10.5px]">
                      {selectedUser.totalDirectSales}/10 PTS • {getDownlineCount(selectedUser.id)}/100 Team (Total 202)
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 font-sans font-medium">Requirement: 10 Direct Sales (PTS) and 100 Team Members.</div>
                </div>

                {/* Sr. GM Requirement */}
                <div className={`p-2.5 rounded-lg border transition-all ${
                  getDownlineCount(selectedUser.id) >= 200 && selectedUser.totalDirectSales >= 11 
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-250 font-semibold' 
                    : 'bg-zinc-50/70 text-zinc-700 border-zinc-200'
                }`}>
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1.5">
                      {getDownlineCount(selectedUser.id) >= 200 && selectedUser.totalDirectSales >= 11 ? '🟢' : '⚪'}
                      Sr. GM
                    </span>
                    <span className="font-mono text-[10.5px]">
                      {selectedUser.totalDirectSales}/11 PTS • {getDownlineCount(selectedUser.id)}/200 Team (Total 402)
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 font-sans font-medium">Requirement: 11 Direct Sales (PTS) and 200 Team Members.</div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <Users className="w-12 h-12 text-zinc-300 stroke-1 mb-3" />
            <h4 className="font-bold text-zinc-800 text-sm">Select an Associate</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-[200px] leading-relaxed mx-auto">
              Select any associate node from the tree to examine uplines, recruits, and downline volume.
            </p>
          </div>
        )}

        {/* Whitelabel watermark */}
        <div className="border-t border-zinc-100 pt-3 mt-6 text-center">
          <p className="text-[10px] text-zinc-400 font-mono">
            SBR Associates • Whitelabel ID Management
          </p>
        </div>
      </div>
    </div>
  );
}
