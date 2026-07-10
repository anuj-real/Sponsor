import React, { useState, useEffect } from 'react';
import { Award, Users, Sparkles, X, Star, Trophy } from 'lucide-react';
import { User, MLMConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface DesignationProgressProps {
  agent: User;
  users: User[];
  downlineNetwork: User[];
  config: MLMConfig;
}

export default function DesignationProgress({ agent, users, downlineNetwork, config }: DesignationProgressProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; size: number; delay: number; duration: number; rotate: number }[]>([]);

  // Count direct recruits
  const directRecruitsCount = users.filter(u => u.sponsorId?.toUpperCase() === agent.id?.toUpperCase()).length;
  // Get active KYC/Status of direct recruits
  const activeDirectRecruitsCount = users.filter(u => u.sponsorId?.toUpperCase() === agent.id?.toUpperCase() && u.status === 'ACTIVE').length;
  // Count total downline network
  const teamMembersCount = downlineNetwork.length;

  // Helper to parse condition string
  const parseConditionString = (condition: string) => {
    let reqDirects = 0;
    let reqTeam = 0;
    if (!condition) return { reqDirects, reqTeam };
    const directsMatch = condition.match(/(\d+)\s+Direct/i);
    if (directsMatch) reqDirects = parseInt(directsMatch[1], 10);
    const teamMatch = condition.match(/(\d+)\s+(Group|Team|Member)/i);
    if (teamMatch) reqTeam = parseInt(teamMatch[1], 10);
    return { reqDirects, reqTeam };
  };

  const getDynamicRequirements = (designationName: string, defaultDirects: number, defaultTeam: number) => {
    const leadCfg = (config?.leadershipConfigs || []).find(l => l.designation === designationName);
    if (leadCfg) {
      const parsed = parseConditionString(leadCfg.condition);
      return {
        directsRequired: parsed.reqDirects || defaultDirects,
        teamRequired: parsed.reqTeam || defaultTeam,
        legSetup: `${parsed.reqDirects || defaultDirects} Direct Sales (PTS), ${parsed.reqTeam || defaultTeam} Team Members required to unlock override commissions.`
      };
    }
    return {
      directsRequired: defaultDirects,
      teamRequired: defaultTeam,
      legSetup: `${defaultDirects} Direct Sales (PTS), ${defaultTeam} Team Members required to unlock override commissions.`
    };
  };

  const managerReqs = getDynamicRequirements('Manager', 4, 12);
  const srManagerReqs = getDynamicRequirements('Sr. Manager', 7, 30);
  const agmReqs = getDynamicRequirements('AGM', 9, 60);
  const gmReqs = getDynamicRequirements('GM', 10, 100);
  const srGmReqs = getDynamicRequirements('Sr. GM', 11, 200);

  // Career Matrix definitions
  const designationRequirements = [
    {
      designation: 'Manager' as const,
      directsRequired: managerReqs.directsRequired,
      teamRequired: managerReqs.teamRequired,
      legSetup: managerReqs.legSetup,
      title: 'Managerial Core'
    },
    {
      designation: 'Sr. Manager' as const,
      directsRequired: srManagerReqs.directsRequired,
      teamRequired: srManagerReqs.teamRequired,
      totalLegSetup: 42,
      legSetup: srManagerReqs.legSetup,
      title: 'Senior Leadership Core'
    },
    {
      designation: 'AGM' as const,
      directsRequired: agmReqs.directsRequired,
      teamRequired: agmReqs.teamRequired,
      totalLegSetup: 102,
      legSetup: agmReqs.legSetup,
      title: 'Assistant General Management'
    },
    {
      designation: 'GM' as const,
      directsRequired: gmReqs.directsRequired,
      teamRequired: gmReqs.teamRequired,
      totalLegSetup: 202,
      legSetup: gmReqs.legSetup,
      title: 'General Management Tier'
    },
    {
      designation: 'Sr. GM' as const,
      directsRequired: srGmReqs.directsRequired,
      teamRequired: srGmReqs.teamRequired,
      totalLegSetup: 402,
      legSetup: srGmReqs.legSetup,
      title: 'Senior General Management Principal'
    }
  ];

  // Helper helper to determine status of a milestone level
  const designationRanks = ['Associate', 'Manager', 'Sr. Manager', 'AGM', 'GM', 'Sr. GM'] as const;
  const currentRankIdx = designationRanks.indexOf((agent.designation as any) || 'Associate');
  const nextRank = currentRankIdx < designationRanks.length - 1 ? designationRanks[currentRankIdx + 1] : null;

  const nextReq = designationRequirements.find(req => req.designation === nextRank);

  const isEligible = nextReq ? (agent.totalDirectSales >= nextReq.directsRequired && teamMembersCount >= nextReq.teamRequired) : false;

  useEffect(() => {
    setAutoTriggered(false);
  }, [agent.id]);

  useEffect(() => {
    if (isEligible && !autoTriggered) {
      setShowCelebration(true);
      setAutoTriggered(true);
    }
  }, [isEligible, autoTriggered, agent.id]);

  useEffect(() => {
    if (showCelebration) {
      const colors = ['#10b981', '#059669', '#d97706', '#db2777', '#7c3aed', '#dc2626', '#2563eb'];
      const list = Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage x-axis
        y: -10 - Math.random() * 30, // top offset
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6,
        delay: Math.random() * 0.8,
        duration: Math.random() * 2.5 + 1.5,
        rotate: Math.random() * 360
      }));
      setConfetti(list);
    } else {
      setConfetti([]);
    }
  }, [showCelebration]);

  // Helper function to parse milestone condition to check eligibility
  const parseMilestoneCondition = (condition: string) => {
    let reqDirects = 0;
    let reqTeam = 0;

    // Match digits followed by "Direct"
    const directsMatch = condition.match(/(\d+)\s+Direct/i);
    if (directsMatch) {
      reqDirects = parseInt(directsMatch[1], 10);
    }

    // Match digits followed by "Group" or "Team" or "Member"
    const teamMatch = condition.match(/(\d+)\s+(Group|Team|Member)/i);
    if (teamMatch) {
      reqTeam = parseInt(teamMatch[1], 10);
    }

    return { reqDirects, reqTeam };
  };

  const actualDirects = agent.totalDirectSales;
  const actualTeam = teamMembersCount;

  // Compile active sponsorship milestones from config
  const brokerMilestones = (config?.promotionalMilestones || []).map((m) => {
    const { reqDirects, reqTeam } = parseMilestoneCondition(m.condition);
    // Check if achieved/unlocked based on active downline network metrics
    const isUnlocked = actualDirects >= reqDirects && actualTeam >= reqTeam;

    // Direct progress percent
    const directsPercent = reqDirects > 0 ? Math.min(100, (actualDirects / reqDirects) * 100) : 100;
    const teamPercent = reqTeam > 0 ? Math.min(100, (actualTeam / reqTeam) * 100) : 100;
    const progressPercent = reqDirects > 0 && reqTeam > 0 ? Math.round((directsPercent + teamPercent) / 2) : Math.round(directsPercent);

    return {
      id: m.id,
      condition: m.condition,
      award: m.award,
      reqDirects,
      reqTeam,
      isUnlocked,
      progressPercent
    };
  });

  const achievedRewards = brokerMilestones.filter(m => m.isUnlocked);
  const nextReward = brokerMilestones.find(m => !m.isUnlocked);
  const highestAchieved = achievedRewards.length > 0 ? achievedRewards[achievedRewards.length - 1] : null;

  const isCorporateNode = ['C', 'A1', 'A2'].includes(agent.id);

  if (isCorporateNode) {
    return (
      <div className="bg-white border border-stone-250/90 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-xs border border-amber-200/50">
            <Award className="w-5.5 h-4.5 text-amber-680 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider font-sans flex items-center gap-2">
              Corporate Administrative Node
              <span className="text-[9px] bg-amber-50 text-amber-800 font-extrabold px-2 py-0.5 rounded border border-amber-200/50 uppercase tracking-wider font-sans">
                Grandfathered Profile
              </span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Designation logic and career milestone tracking are disabled for top-level corporate nodes.
            </p>
          </div>
        </div>
        <div className="p-4 bg-stone-50/65 rounded-xl border border-stone-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="block text-[9.5px] uppercase tracking-wider text-stone-400 font-semibold">Corporate Rank Status</span>
            <strong className="text-sm font-bold text-stone-500">Exempt</strong>
          </div>
          <div className="sm:text-right">
            <span className="block text-[9.5px] uppercase tracking-wider text-stone-400 font-semibold">Designation Status</span>
            <strong className="text-sm font-bold text-stone-500">Exempt (Not Applicable)</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-250/90 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Block Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-xs border border-amber-200/50">
            <Award className="w-5.5 h-4.5 text-amber-680 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider font-sans flex items-center gap-2">
              Career Milestone
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200/50 uppercase tracking-wider font-sans">
                Next Target
              </span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Focus on your leadership quota to amplify commission rates and global overrides.
            </p>
          </div>
        </div>
        {/* Quick summary badges with simulate option */}
        <div className="flex flex-wrap gap-2 items-center self-stretch md:self-auto shrink-0">
          <button 
            onClick={() => setShowCelebration(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-100/80 border border-amber-200 hover:bg-amber-100 text-amber-800 transition-all duration-300 shadow-xs"
            title="Preview milestone completion reward splash"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Celebrate Rank</span>
          </button>
          <div className="flex-1 md:flex-none text-center bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-1.5">
            <span className="block text-[9px] uppercase tracking-wider text-stone-500">Direct Sales</span>
            <strong className="text-sm font-bold text-emerald-700">{agent.totalDirectSales} PTS</strong>
          </div>
          <div className="flex-1 md:flex-none text-center bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-1.5">
            <span className="block text-[9px] uppercase tracking-wider text-stone-500">Total Downline</span>
            <strong className="text-sm font-bold text-emerald-700">{teamMembersCount} Members</strong>
          </div>
        </div>
      </div>

      {/* Immediate Milestone Detail */}
      {nextReq ? (() => {
        const directsPercent = Math.min(100, (agent.totalDirectSales / nextReq.directsRequired) * 100);
        const teamPercent = Math.min(100, (teamMembersCount / nextReq.teamRequired) * 100);
        const weightOverall = Math.round((directsPercent + teamPercent) / 2);

        const borderStyle = 'border-stone-200 bg-stone-50/50 hover:bg-stone-50';
        const headingColor = 'text-emerald-800 font-bold';
        const statusBadge = (
          <span className="text-[9px] font-bold tracking-wide px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/50 uppercase flex items-center gap-1 shrink-0">
            Next Rank Candidate
          </span>
        );

        return (
          <div className="space-y-5">
            <div className={`p-5 rounded-xl border transition-all duration-300 ${borderStyle}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-200 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-stone-500 text-xs">Current: <strong className="text-stone-880">{agent.designation || 'Associate'}</strong></span>
                    <span className="text-stone-400 text-xs font-bold">➔</span>
                    <h4 className={`text-sm font-sans tracking-wide uppercase ${headingColor}`}>
                      {nextReq.designation}
                    </h4>
                    {statusBadge}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-sans font-semibold">
                    {weightOverall}% Target Met
                  </span>
                </div>
              </div>

              {/* Two Column Bars: 1-Directs, 2-Team Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Direct sales quota */}
                <div className="space-y-2 bg-white p-3.5 rounded-lg border border-stone-250/80">
                  <div className="flex justify-between items-center">
                    <span className="text-[10.5px] text-stone-600 font-sans flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-700" />
                      Direct Sales (PTS)
                    </span>
                    <span className="text-xs text-stone-700">
                      <strong className="text-emerald-800 font-bold">{agent.totalDirectSales}</strong> / {nextReq.directsRequired} PTS
                    </span>
                  </div>
                  
                  {/* Progress Bar background */}
                  <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden border border-stone-200">
                    <div 
                      className="bg-emerald-700 h-full rounded-full transition-all duration-700 ease-out" 
                      style={{ width: `${directsPercent}%` }}
                    />
                  </div>
                  {/* Progression descriptor */}
                  <div className="flex justify-between text-[9.5px] text-stone-500 pt-0.5">
                    <span>
                      {agent.totalDirectSales >= nextReq.directsRequired ? '✅ Metric Achieved' : `${nextReq.directsRequired - agent.totalDirectSales} more PTS required`}
                    </span>
                    <span className="font-semibold text-stone-700">
                      {Math.round(directsPercent)}% Completed
                    </span>
                  </div>
                </div>

                {/* Team downline quota */}
                <div className="space-y-2 bg-white p-3.5 rounded-lg border border-stone-250/80">
                  <div className="flex justify-between items-center">
                    <span className="text-[10.5px] text-stone-600 font-sans flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      Downline Team Members
                    </span>
                    <span className="text-xs text-stone-700">
                      <strong className="text-emerald-800 font-bold">{teamMembersCount}</strong> / {nextReq.teamRequired} Members
                    </span>
                  </div>
                  
                  {/* Progress Bar background */}
                  <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden border border-stone-200">
                    <div 
                      className="bg-emerald-700 h-full rounded-full transition-all duration-700 ease-out" 
                      style={{ width: `${teamPercent}%` }}
                    />
                  </div>
                  {/* Progression descriptor */}
                  <div className="flex justify-between text-[9.5px] text-stone-500 pt-0.5">
                    <span>
                      {teamMembersCount >= nextReq.teamRequired ? '✅ Metric Achieved' : `${nextReq.teamRequired - teamMembersCount} more required`}
                    </span>
                    <span className="font-semibold text-stone-700">
                      {Math.round(teamPercent)}% Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Leg Matrix condition & Hierarchy notes */}
              <div className="mt-3.5 text-[10.5px] text-stone-600 flex items-start gap-2 bg-stone-100/80 border border-stone-200 p-3 rounded-lg">
                <span className="text-xs mt-0.5">💡</span>
                <div className="space-y-0.5">
                  <span className="font-bold text-stone-800 text-[10px] uppercase tracking-wide block">Requirement Directive</span>
                  <p className="text-[10.5px] text-stone-600 leading-relaxed font-sans">{nextReq.legSetup}</p>
                </div>
              </div>
            </div>

            {/* Motivational message specific to the level */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <Sparkles className="w-4.5 h-4.5 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wide">Next Tier Target</h5>
                <p className="text-[11px] text-stone-650 mt-1 leading-relaxed">
                  By stepping up to <strong className="text-emerald-800">{nextReq.designation}</strong>, you will amplify your team overriding commission structures. Keep coaching your active legs, coordinate with key direct associates, and maximize monthly payouts!
                </p>
              </div>
            </div>
          </div>
        );
      })() : (
        <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-emerald-800 mx-auto" />
          <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Apex Achiever Tier</h4>
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            Congratulations! You have reached the absolute highest career designation of <strong>Senior General Manager (Sr. GM)</strong>. You are now running an automated real estate empire with maximum override structures.
          </p>
        </div>
      )}

      {/* SBR Sponsoring and Promotional Milestones */}
      <div className="border-t border-stone-200 pt-6 mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-250 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider font-sans">
              SBR Sponsoring & Promotional Milestones
            </h4>
            <p className="text-[11px] text-stone-500 font-sans">
              Complete team sponsorship targets and downline building milestones to unlock exciting cash bonuses, gifts, and perks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Standing info (Left part) */}
          <div className="xl:col-span-5 space-y-4">
            <div className="p-4.5 rounded-xl bg-emerald-50/20 border border-emerald-200/60 space-y-3.5 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-stone-500 tracking-wider block font-sans">Active Team Metrics</span>
                  <div className="text-2xl font-mono font-bold text-stone-900 mt-1 flex items-baseline gap-1">
                    {actualDirects}
                    <span className="text-xs uppercase text-stone-500 font-normal font-sans"> / {actualTeam}</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-stone-500 mt-1 block font-sans">Directs / Group members</span>
                </div>
                <div className="bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1 text-center select-none">
                  <span className="block text-[8px] uppercase text-emerald-800 font-bold font-sans">Unlocked</span>
                  <strong className="text-xs font-bold text-emerald-950 font-mono">{achievedRewards.length} / {brokerMilestones.length}</strong>
                </div>
              </div>

              {/* Progress to Next Reward */}
              {nextReward ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-600 flex items-center gap-1 font-sans font-medium">
                      Next Core Goal: <strong className="text-stone-905 font-extrabold uppercase">{nextReward.award}</strong>
                    </span>
                    <span className="text-emerald-800 font-bold font-mono">
                      {nextReward.progressPercent}%
                    </span>
                  </div>

                  {/* Progressive Bar */}
                  <div className="w-full bg-stone-100 rounded-full h-2.5 border border-stone-200 overflow-hidden">
                    <div 
                      className="bg-emerald-700 h-full rounded-full transition-all duration-700"
                      style={{ width: `${nextReward.progressPercent}%` }}
                    />
                  </div>

                  <p className="text-[10.5px] text-stone-600 leading-relaxed font-sans">
                    Requires: <span className="font-bold text-stone-850 font-mono">{nextReward.condition}</span>. Keep building your sponsorship downline to qualify!
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50 border border-emerald-250 rounded-xl text-center">
                  <p className="text-xs text-emerald-800 font-bold flex items-center justify-center gap-1.5 font-sans">
                    <Star className="w-4 h-4 text-emerald-700 fill-current" /> SBR Milestone Master!
                  </p>
                  <p className="text-[10px] text-stone-500 mt-1 font-sans">You have unlocked all configured promotional milestones!</p>
                </div>
              )}
            </div>

            {/* Current unlocked list status */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-500 block font-sans">Milestone Progress Standing</span>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs py-1.5 border-b border-stone-150">
                  <span className="text-stone-500">Highest Achieved Reward:</span>
                  <span className="font-bold text-emerald-850 uppercase text-[10.5px] text-right font-sans truncate max-w-[200px]" title={highestAchieved ? highestAchieved.award : 'None yet'}>
                    {highestAchieved ? highestAchieved.award : 'None yet'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs py-1.5">
                  <span className="text-stone-500">Completed Milestone Steps:</span>
                  <span className="font-bold text-stone-900 font-mono">
                    {achievedRewards.length} Achieved
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Milestones (Right part) */}
          <div className="xl:col-span-7 space-y-2.5 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
            {brokerMilestones.length === 0 ? (
              <p className="text-xs text-stone-400 italic font-sans">No promotional milestones configured by administration.</p>
            ) : (
              brokerMilestones.map((rew, i) => {
                const isUnlocked = rew.isUnlocked;
                const isNextTarget = nextReward?.id === rew.id;

                return (
                  <div 
                    key={rew.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all duration-300 gap-3 ${
                      isUnlocked 
                        ? 'bg-emerald-50/40 border-emerald-200/80 shadow-xs' 
                        : isNextTarget 
                          ? 'bg-amber-50/40 border-amber-300 shadow-xs ring-1 ring-amber-250' 
                          : 'bg-white border-stone-200 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Ring position count / state */}
                      <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isUnlocked 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80' 
                          : isNextTarget 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                            : 'bg-stone-100 text-stone-500 border border-stone-200/80'
                      }`}>
                        {isUnlocked ? '✓' : i + 1}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className={`text-[12px] font-bold uppercase tracking-wider font-sans ${
                            isUnlocked ? 'text-emerald-950' : isNextTarget ? 'text-amber-950' : 'text-stone-700'
                          }`}>
                            Milestone #{i + 1}
                          </h5>
                          {isNextTarget && (
                            <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-250">
                              Target Goal
                            </span>
                          )}
                          {isUnlocked && (
                            <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-250 font-sans">
                              Achieved
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] font-semibold text-stone-850 mt-1 leading-normal font-sans">Reward: {rew.award}</p>
                        <p className="text-[10px] text-stone-550 mt-0.5 font-sans">Condition: <span className="font-bold text-stone-700 font-mono">{rew.condition}</span></p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 sm:pl-3 self-end sm:self-auto font-mono">
                      <span className={`text-[10px] px-2 py-0.8 rounded border font-bold ${
                        isUnlocked 
                          ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
                          : isNextTarget 
                            ? 'bg-amber-50 border-amber-250 text-amber-800' 
                            : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}>
                        {isUnlocked ? 'Achieved' : `${rew.progressPercent}% Met`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Celebration Modal Overlay */}
      <AnimatePresence>
        {showCelebration && (() => {
          const displayRank = nextReq ? nextReq.designation : 'Senior General Manager';
          const leadCfg = (config?.leadershipConfigs || []).find(l => l.designation === displayRank);
          const rewardText = leadCfg 
            ? `Direct Sourcing Incentive: +₹${leadCfg.incentivePrice}/sq yd • Override Rules: ${leadCfg.rules}`
            : 'Ultimate Crown overrides + Lifetime Elite SBR Club';
          const directsTarget = nextReq ? nextReq.directsRequired : 11;
          const teamTarget = nextReq ? nextReq.teamRequired : 200;
          const isSGM = !nextReq;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md overflow-hidden"
            >
              {/* Confetti generator */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {confetti.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ y: `${c.y}%`, x: `${c.x}vw`, rotate: c.rotate, scale: 0.8, opacity: 1 }}
                    animate={{ 
                      y: '110vh', 
                      x: `${c.x + (Math.random() * 20 - 10)}vw`,
                      rotate: c.rotate + 720,
                      opacity: [1, 1, 1, 0.8, 0]
                    }}
                    transition={{ 
                      duration: c.duration, 
                      delay: c.delay, 
                      ease: "easeOut" 
                    }}
                    className="absolute rounded-sm"
                    style={{
                      backgroundColor: c.color,
                      width: c.size,
                      height: c.size * (Math.random() > 0.5 ? 1.6 : 1),
                    }}
                  />
                ))}
              </div>

              {/* Centered Achievement Card */}
              <motion.div
                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  y: 0, 
                  opacity: 1,
                  transition: { type: "spring", damping: 15, stiffness: 100 }
                }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                className="relative w-full max-w-xl bg-white rounded-3xl p-6 md:p-8 border border-stone-250 shadow-xl text-center text-stone-800 overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowCelebration(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 border border-stone-255 hover:bg-stone-200 text-stone-600 transition-all z-10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Big Award Medal */}
                <div className="relative mx-auto w-24 h-24 mb-6 mt-2">
                  <div className="absolute inset-0 bg-amber-500/10 blur-xl rounded-full" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 to-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                    <Trophy className="w-10 h-10 text-white stroke-[2.5]" />
                  </div>
                  {/* Floating mini stars */}
                  <span className="absolute -top-1 -right-1 text-yellow-500 animate-bounce text-lg">✨</span>
                  <span className="absolute -bottom-1 -left-1 text-emerald-600 animate-bounce text-base">⭐</span>
                </div>

                {/* Banner Headings */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200 inline-block font-sans">
                    {isSGM ? 'Supreme Lead Tier Champion' : 'SBR Leadership Rank Unlocked'}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-stone-900 leading-tight py-1 font-serif">
                    CONGRATULATIONS, {agent.name.toUpperCase()}!
                  </h2>
                  <p className="text-stone-605 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
                    {isSGM 
                      ? 'You are at the pinnacle of the SBR sourcing network! Senior General Manager status gives you maximum privileges.'
                      : `Your outstanding direct sales and strong downline active network legs has qualified you as an SBR ${displayRank}!`}
                  </p>
                </div>

                {/* Detailed Metrics Showcase */}
                <div className="my-5 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                    <span className="text-[9.5px] text-stone-500 uppercase tracking-wider block">Direct Sales Volume</span>
                    <div className="text-2xl font-bold text-emerald-800 font-serif">
                      {agent.totalDirectSales} <span className="text-xs text-stone-550 font-sans">/ {directsTarget} PTS</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold">✓ Target Cleared</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                    <span className="text-[9.5px] text-stone-500 uppercase tracking-wider block">Downline size</span>
                    <div className="text-2xl font-bold text-emerald-800 font-serif">
                      {teamMembersCount} <span className="text-xs text-stone-550 font-sans">/ {teamTarget}</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold">✓ Target Cleared</div>
                  </div>
                </div>

                {/* Benefits highlight card */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-left mb-6 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10.5px] text-amber-800 font-bold uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-620" />
                    <span>Incentives & Overrides Unlocked:</span>
                  </div>
                  <p className="text-[11px] text-stone-800 leading-relaxed font-sans font-semibold">
                    {rewardText}
                  </p>
                </div>

                {/* Action Button */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                  <button
                    onClick={() => setShowCelebration(false)}
                    className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 transform"
                  >
                    Close & Claim Promotion
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
