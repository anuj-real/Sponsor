import React, { useState, useEffect } from 'react';
import { User, RealEstateProject, Sale, CommissionPayout, Notification, MLMConfig, UserRole } from './types';
import { 
  INITIAL_MLM_CONFIG, 
  INITIAL_PROJECTS, 
  INITIAL_USERS, 
  INITIAL_SALES, 
  INITIAL_PAYOUTS, 
  INITIAL_NOTIFICATIONS 
} from './data/seedData';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  IndianRupee, 
  Briefcase, 
  ShieldCheck, 
  Award, 
  BookOpen, 
  Lock, 
  HelpCircle,
  LogOut
} from 'lucide-react';
import TreeVisualizer from './components/TreeVisualizer';
import AdminPanel from './components/AdminPanel';
import AgentPanel from './components/AgentPanel';
import LoginScreen from './components/LoginScreen';
import { 
  seedDatabase, 
  setDocumentData, 
  deleteDocument, 
  COLLECTIONS 
} from './lib/firebase';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('ADMIN');
  const [activeAgentId, setActiveAgentId] = useState<string>('SBR0005'); // Simulated default agent (Neha Patel)
  const [session, setSession] = useState<{ role: UserRole; agentId?: string; name: string } | null>(null);
  
  // Master states
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<RealEstateProject[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [config, setConfig] = useState<MLMConfig>(INITIAL_MLM_CONFIG);
  const [dbLoading, setDbLoading] = useState(true);

  // Selected User in the Tree diagram
  const [selectedTreeUserId, setSelectedTreeUserId] = useState<string | null>('SBR0005');

  // Load from Firestore on mount
  useEffect(() => {
    async function initFirestore() {
      try {
        const data = await seedDatabase({
          users: INITIAL_USERS,
          projects: INITIAL_PROJECTS,
          sales: INITIAL_SALES,
          payouts: INITIAL_PAYOUTS,
          config: INITIAL_MLM_CONFIG,
          notifications: INITIAL_NOTIFICATIONS
        });

        setUsers(data.users);
        setProjects(data.projects);
        setSales(data.sales);
        setPayouts(data.payouts);
        setConfig(data.config);
        setNotifications(data.notifications);
      } catch (error) {
        console.error("Firebase Initialization failed, falling back to LocalStorage:", error);
        
        // Local fallback
        const storedUsers = localStorage.getItem('SBR_USERS');
        const storedProjects = localStorage.getItem('SBR_PROJECTS');
        const storedSales = localStorage.getItem('SBR_SALES');
        const storedPayouts = localStorage.getItem('SBR_PAYOUTS');
        const storedConfig = localStorage.getItem('SBR_CONFIG');
        const storedNotifs = localStorage.getItem('SBR_NOTIFICATIONS');

        if (storedUsers) setUsers(JSON.parse(storedUsers));
        else setUsers(INITIAL_USERS);

        if (storedProjects) setProjects(JSON.parse(storedProjects));
        else setProjects(INITIAL_PROJECTS);

        if (storedSales) setSales(JSON.parse(storedSales));
        else setSales(INITIAL_SALES);

        if (storedPayouts) setPayouts(JSON.parse(storedPayouts));
        else setPayouts(INITIAL_PAYOUTS);

        if (storedConfig) {
          try {
            const parsed = JSON.parse(storedConfig);
            setConfig(parsed);
          } catch (e) {
            setConfig(INITIAL_MLM_CONFIG);
          }
        } else {
          setConfig(INITIAL_MLM_CONFIG);
        }

        if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
        else setNotifications(INITIAL_NOTIFICATIONS);
      } finally {
        setDbLoading(false);
      }
    }

    initFirestore();

    const storedSession = localStorage.getItem('SBR_SESSION');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setSession(parsed);
        setActiveRole(parsed.role);
        if (parsed.agentId) {
          setActiveAgentId(parsed.agentId);
        }
      } catch (e) {
        console.error('Error loading stored session', e);
      }
    }
  }, []);

  const handleLogin = (role: UserRole, agentId?: string) => {
    let name = '';
    if (role === 'ADMIN') {
      name = 'Rahul Deshmukh (Owner)';
    } else if (agentId) {
      const agent = users.find((u: User) => u.id === agentId);
      name = agent ? agent.name : 'SBR Broker';
    }

    const newSession = { role, agentId, name };
    setSession(newSession);
    setActiveRole(role);
    if (agentId) {
      setActiveAgentId(agentId);
    }
    localStorage.setItem('SBR_SESSION', JSON.stringify(newSession));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('SBR_SESSION');
  };

  // State Change triggers
  const handleUpdateConfig = async (newConfig: MLMConfig) => {
    setConfig(newConfig);
    try {
      await setDocumentData(COLLECTIONS.CONFIG, 'main_config', newConfig);
    } catch (e) {
      console.error('Firestore save failed', e);
    }
  };

  const handleAddProject = async (newProj: RealEstateProject) => {
    const updated = [...projects, newProj];
    setProjects(updated);
    
    // Create audit notification for admin actions
    const notif: Notification = {
      id: `NOT-${Math.floor(500 + Math.random() * 500)}`,
      userId: 'SBR0001',
      title: 'New SBR Project Created',
      message: `Project ${newProj.name} created at ${newProj.location} with Starting Price ${newProj.sqYardStartingPrice} PTS/sq yard.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false
    };

    const updatedNotifs = [notif, ...notifications];
    setNotifications(updatedNotifs);
    
    try {
      await setDocumentData(COLLECTIONS.PROJECTS, newProj.id, newProj);
      await setDocumentData(COLLECTIONS.NOTIFICATIONS, notif.id, notif);
    } catch (e) {
      console.error('Firestore save failed', e);
    }
  };

  const handleUpdateProjects = async (updatedProjects: RealEstateProject[]) => {
    setProjects(updatedProjects);
    try {
      for (const proj of updatedProjects) {
        await setDocumentData(COLLECTIONS.PROJECTS, proj.id, proj);
      }
    } catch (e) {
      console.error('Firestore save failed', e);
    }
  };

  const handleAddUser = async (newUserData: Omit<User, 'totalDirectSales' | 'totalDownlineSales'>) => {
    const newUser: User = {
      ...newUserData,
      totalDirectSales: 0,
      totalDownlineSales: 0
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Create audit notification for admin actions
    const notif: Notification = {
      id: `NOT-${Math.floor(500 + Math.random() * 500)}`,
      userId: newUserData.sponsorId || 'SBR0001',
      title: 'New Sourcing Partner Appointed',
      message: `Associate ${newUserData.name} onboarded onto SBR hierarchy with Sponsor ID: ${newUserData.id}.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false
    };

    const updatedNotifs = [notif, ...notifications];
    setNotifications(updatedNotifs);
    
    try {
      await setDocumentData(COLLECTIONS.USERS, newUser.id, newUser);
      await setDocumentData(COLLECTIONS.NOTIFICATIONS, notif.id, notif);
    } catch (e) {
      console.error('Firestore save failed', e);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const updatedUser = { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' as const : 'ACTIVE' as const };
        setDocumentData(COLLECTIONS.USERS, userId, updatedUser).catch(console.error);
        return updatedUser;
      }
      return u;
    });
    setUsers(updatedUsers);
  };

  const handleClearNotification = async (notifId: string) => {
    const updatedNotifs = notifications.filter(n => n.id !== notifId);
    setNotifications(updatedNotifs);
    try {
      await deleteDocument(COLLECTIONS.NOTIFICATIONS, notifId);
    } catch (e) {
      console.error('Firestore delete failed', e);
    }
  };

  // SPREAD OVERRIDE PAYOUT GENERATOR FOR MULTI-LEVEL AGREEMENTS
  const handleAddSale = async (saleData: {
    project: string;
    projectId: string;
    unitNumber: string;
    buyerName: string;
    saleValue: number;
    agentId: string;
    saleDate: string;
    referenceNumber: string;
    sizeSqYards: string;
    status: 'BOOKED' | 'CONFIRMED' | 'HOLD';
    bookingStatus?: 'TOKEN_RECEIVED' | 'BOOKING_DONE' | 'REGISTRY_DONE';
    tokenAmount?: number;
    ratePerSqYard?: number;
  }) => {
    // 1. Log Sales Node
    const newSaleId = `SALE-${Math.floor(300 + Math.random() * 700)}`;
    const sourcingAgent = users.find(u => u.id === saleData.agentId);
    const agentName = sourcingAgent ? sourcingAgent.name : 'Sub Broker';

    const newSale: Sale = {
      id: newSaleId,
      ...saleData,
      agentName,
      payments: saleData.tokenAmount !== undefined ? [{
        id: `PAY-INIT-${newSaleId}`,
        amount: saleData.tokenAmount,
        date: saleData.saleDate,
        paymentMode: 'BANK_TRANSFER',
        notes: 'Initial token amount'
      }] : []
    };

    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);

    // Update targeted project unit status
    let targetProj: RealEstateProject | null = null;
    const selectedUnits = saleData.unitNumber.split(',').map(u => u.trim());
    const updatedProjects = projects.map(proj => {
      if (proj.id === saleData.projectId) {
        const nextProj = {
          ...proj,
          inventory: proj.inventory.map(category => ({
            ...category,
            units: category.units.map(unit => {
              if (selectedUnits.includes(unit.unitNumber)) {
                return {
                  ...unit,
                  status: saleData.status === 'HOLD' ? ('HOLD' as const) : ('BOOKED' as const),
                  bookedByAgentId: saleData.agentId,
                  buyerName: saleData.buyerName
                };
              }
              return unit;
            })
          }))
        };
        targetProj = nextProj;
        return nextProj;
      }
      return proj;
    });
    setProjects(updatedProjects);

    // 2. Build multi-tiered commission payouts
    const newPayoutsList: CommissionPayout[] = [];
    const newNotifications: Notification[] = [];
    let currentAgentId: string | null = saleData.agentId;
    let currentLevel = 1;

    let updatedUsers = [...users];
    const modifiedUsers: User[] = [];

    // Propagate up the sponsor/recruit tree structure
    while (currentAgentId && currentLevel <= config.levels.length) {
      const levelConfig = config.levels.find(l => l.level === currentLevel);
      if (!levelConfig) break;

      const currentAgent = updatedUsers.find(u => u.id === currentAgentId);
      if (!currentAgent) break;

      // Extract raw computations
      const value = saleData.saleValue;
      const pct = levelConfig.percentage;
      const gross = (value * pct) / 100;
      const tds = (gross * config.tdsPercentage) / 100;
      const admin = (gross * config.adminFeePercentage) / 100;
      const net = gross - tds - admin;

      const payoutId = `PAY-${Math.floor(200 + Math.random() * 800)}`;
      const payout: CommissionPayout = {
        id: payoutId,
        saleId: newSaleId,
        project: saleData.project,
        unitNumber: saleData.unitNumber,
        saleValue: value,
        agentId: currentAgent.id,
        agentName: currentAgent.name,
        level: currentLevel,
        percentage: pct,
        grossCommission: gross,
        tdsDeduction: tds,
        adminFee: admin,
        netCommission: net,
        status: 'PENDING',
        payoutDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0] // Scheduled disbursement in 2 weeks
      };

      newPayoutsList.push(payout);

      // Trigger user-notification
      const notifId = `NOT-${Math.floor(100 + Math.random() * 900)}`;
      const notifTitle = currentLevel === 1 
        ? 'Personal Sourcing Commission Due'
        : `Indirect Network Overrides (L${currentLevel})`;
      const notifMsg = currentLevel === 1
        ? `We registered your sale of ${saleData.project} (${saleData.unitNumber}) of value ${value.toLocaleString()} PTS. Scheduled net payout is ${net.toLocaleString()} PTS.`
        : `A Level ${currentLevel} override of ${net.toLocaleString()} PTS is pending collection, sourced by downline representative ${agentName} at ${saleData.project}.`;

      newNotifications.push({
        id: notifId,
        userId: currentAgent.id,
        title: notifTitle,
        message: notifMsg,
        amount: net,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false
      });

      // Increment stats for this agent dynamically
      updatedUsers = updatedUsers.map(u => {
        if (u.id === currentAgent.id) {
          const nextUser = {
            ...u,
            totalDirectSales: currentLevel === 1 ? u.totalDirectSales + value : u.totalDirectSales,
            totalDownlineSales: currentLevel === 1 ? u.totalDownlineSales : u.totalDownlineSales + value
          };
          modifiedUsers.push(nextUser);
          return nextUser;
        }
        return u;
      });

      // Target immediate grandparent sponsor next
      currentAgentId = currentAgent.sponsorId;
      currentLevel++;
    }

    const updatedPayouts = [...newPayoutsList, ...payouts];
    const updatedNotifs = [...newNotifications, ...notifications];

    setPayouts(updatedPayouts);
    setUsers(updatedUsers);
    setNotifications(updatedNotifs);

    try {
      await setDocumentData(COLLECTIONS.SALES, newSale.id, newSale);
      if (targetProj) {
        await setDocumentData(COLLECTIONS.PROJECTS, (targetProj as RealEstateProject).id, targetProj);
      }
      for (const p of newPayoutsList) {
        await setDocumentData(COLLECTIONS.PAYOUTS, p.id, p);
      }
      for (const n of newNotifications) {
        await setDocumentData(COLLECTIONS.NOTIFICATIONS, n.id, n);
      }
      for (const u of modifiedUsers) {
        await setDocumentData(COLLECTIONS.USERS, u.id, u);
      }
    } catch (e) {
      console.error('Firestore save failed', e);
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    let targetPayout: CommissionPayout | undefined;
    const updatedPayouts = payouts.map(p => {
      if (p.id === payoutId) {
        const nextPay = { ...p, status: 'APPROVED' as const };
        targetPayout = nextPay;
        return nextPay;
      }
      return p;
    });
    setPayouts(updatedPayouts);

    if (targetPayout) {
      const notif: Notification = {
        id: `NOT-${Math.floor(100 + Math.random() * 900)}`,
        userId: targetPayout.agentId,
        title: 'Commission Approved for Disbursal',
        message: `Your override of ${targetPayout.netCommission.toLocaleString()} PTS for ${targetPayout.project} (${targetPayout.unitNumber}) was verified by Accounting.`,
        amount: targetPayout.netCommission,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false
      };
      const updatedNotifs = [notif, ...notifications];
      setNotifications(updatedNotifs);
      try {
        await setDocumentData(COLLECTIONS.PAYOUTS, payoutId, targetPayout);
        await setDocumentData(COLLECTIONS.NOTIFICATIONS, notif.id, notif);
      } catch (e) {
        console.error('Firestore save failed', e);
      }
    }
  };

  const handleDisbursePayout = async (payoutId: string) => {
    let targetPayout: CommissionPayout | undefined;
    const updatedPayouts = payouts.map(p => {
      if (p.id === payoutId) {
        const nextPay = { ...p, status: 'DISBURSED' as const, payoutDate: new Date().toISOString().split('T')[0] };
        targetPayout = nextPay;
        return nextPay;
      }
      return p;
    });
    setPayouts(updatedPayouts);

    if (targetPayout) {
      const notif: Notification = {
        id: `NOT-${Math.floor(100 + Math.random() * 900)}`,
        userId: targetPayout.agentId,
        title: 'Payout Bank Clearance Cleared',
        message: `Clearance settled for ${targetPayout.netCommission.toLocaleString()} PTS. Ledger finalized.`,
        amount: targetPayout.netCommission,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false
      };
      const updatedNotifs = [notif, ...notifications];
      setNotifications(updatedNotifs);
      try {
        await setDocumentData(COLLECTIONS.PAYOUTS, payoutId, targetPayout);
        await setDocumentData(COLLECTIONS.NOTIFICATIONS, notif.id, notif);
      } catch (e) {
        console.error('Firestore save failed', e);
      }
    }
  };

  const handleUpdateSaleBookingStatus = async (saleId: string, bookingStatus: 'TOKEN_RECEIVED' | 'BOOKING_DONE' | 'REGISTRY_DONE', tokenAmount?: number) => {
    let targetSale: Sale | undefined;
    const updatedSales = sales.map(s => {
      if (s.id === saleId) {
        const nextSale = { ...s, bookingStatus, tokenAmount };
        targetSale = nextSale;
        return nextSale;
      }
      return s;
    });
    setSales(updatedSales);
    if (targetSale) {
      try {
        await setDocumentData(COLLECTIONS.SALES, saleId, targetSale);
      } catch (e) {
        console.error('Firestore save failed', e);
      }
    }
  };

  const handleUpdateSale = async (updatedSale: Sale) => {
    const updatedSales = sales.map(s => s.id === updatedSale.id ? updatedSale : s);
    setSales(updatedSales);
    try {
      await setDocumentData(COLLECTIONS.SALES, updatedSale.id, updatedSale);
    } catch (e) {
      console.error('Firestore save failed', e);
    }
  };

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf7] flex flex-col items-center justify-center p-6 antialiased font-sans">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h3 className="text-stone-900 font-bold text-sm tracking-wide uppercase font-mono">Connecting SBR Cloud Core</h3>
            <p className="text-stone-500 text-xs mt-1">Establishing high-availability Firestore cluster connection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }


  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#1c1917] flex flex-col antialiased font-sans relative overflow-x-hidden">
      {/* Soft Elegant Warm Ambient Light Gradients - highly subtle */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-25%] left-[-10%] w-[60%] h-[110%] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[90%] rounded-full bg-stone-500/5 blur-[120px]" />
      </div>

      {/* Top Banner */}
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-white font-serif font-semibold text-lg select-none shadow-sm">
                P
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-stone-900 font-serif">SBR <span className="text-emerald-850 font-normal">CRM</span></h1>
              </div>
            </div>
          </div>

          {/* Interactive Role Selector / User Identity Block */}
          {session ? (
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 z-20 self-center md:self-auto">
              
              {/* Authenticated Broker or Admin Badge */}
              <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-700">
                <div className={`w-2 h-2 rounded-full ${session.role === 'ADMIN' ? 'bg-amber-500' : 'bg-emerald-600'}`} />
                <span className="font-semibold text-stone-900">{session.name}</span>
                <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 font-mono">
                  {session.role}
                </span>
              </div>

              {/* Interactive Role selector ONLY FOR ADMINISTRATOR SESSIONS */}
              {session.role === 'ADMIN' ? (
                <div className="flex p-0.5 bg-stone-100 border border-stone-250 rounded-xl shadow-xs">
                  <button
                    onClick={() => setActiveRole('ADMIN')}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeRole === 'ADMIN' 
                        ? 'bg-emerald-800 text-white shadow-sm' 
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    👑 Owner/Admin
                  </button>
                  <button
                    onClick={() => setActiveRole('AGENT')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeRole === 'AGENT' 
                        ? 'bg-emerald-800 text-white shadow-sm' 
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    💼 Channel Partner Panel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-1.5 text-xs text-emerald-800 font-medium font-sans">
                  🔑 Session Verified
                </div>
              )}

              {/* Log Out Button */}
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 font-bold text-xs rounded-xl bg-stone-200/60 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-stone-300/80 text-stone-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Disconnect from session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Primary Dashboard Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6 z-10">
        {activeRole === 'ADMIN' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
              <h2 className="text-lg font-bold text-stone-900 font-serif">Owner Dashboard & Structural Settings</h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Oversee the SBR organization, define percentage payouts and view real-time commission pipelines in PTS.
              </p>
            </div>

            <AdminPanel 
              users={users}
              onAddUser={handleAddUser}
              config={config}
              onUpdateConfig={handleUpdateConfig}
              sales={sales}
              payouts={payouts}
              onToggleUserStatus={handleToggleUserStatus}
              projects={projects}
              onAddProject={handleAddProject}
              onAddSale={handleAddSale}
              onUpdateProjects={handleUpdateProjects}
              onApprovePayout={handleApprovePayout}
              onDisbursePayout={handleDisbursePayout}
              onUpdateSaleBookingStatus={handleUpdateSaleBookingStatus}
              onUpdateSale={handleUpdateSale}
            />

            <TreeVisualizer 
              users={users}
              onSelectUser={(id) => setSelectedTreeUserId(id)}
              selectedUserId={selectedTreeUserId}
            />
          </div>
        )}



        {activeRole === 'AGENT' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
              <h2 className="text-lg font-bold text-stone-900 font-serif">SBR Channel Partner Deck</h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Simulated point of view profile. Track direct sales volumes, strategic team downlines, and check your commission bank slip alerts.
              </p>
            </div>

            <AgentPanel 
              users={users}
              sales={sales}
              payouts={payouts}
              notifications={notifications}
              activeAgentId={activeAgentId}
              onSelectAgentId={(id) => setActiveAgentId(id)}
              onClearNotification={handleClearNotification}
              config={config}
              projects={projects}
            />
          </div>
        )}
      </main>

      {/* Bottom Professional Whitelabel Footer */}
      <footer className="bg-stone-100 border-t border-stone-200/80 py-6.5 px-4 md:px-6 shrink-0 text-center z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 SBR Associates. Standard Sourcing Operations. All rights reserved.</p>
          <div className="flex gap-4 justify-center text-stone-400">
            <span>Support: helpdesk@propspire.in</span>
            <span>|</span>
            <span>Policy: Standard Compliance Manual</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

