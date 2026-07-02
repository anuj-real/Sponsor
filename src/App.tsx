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
  LogOut,
  RefreshCw
} from 'lucide-react';
import TreeVisualizer from './components/TreeVisualizer';
import AdminPanel from './components/AdminPanel';
import AgentPanel from './components/AgentPanel';
import LoginScreen from './components/LoginScreen';
import { normalizeUsers, normalizeUsersWithSales, rebuildPayoutsFromSales } from './lib/designation';
import { 
  seedDatabase, 
  setDocumentData, 
  deleteDocument, 
  resetDatabaseToDefaults,
  COLLECTIONS 
} from './lib/firebase';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('ADMIN');
  const [activeAgentId, setActiveAgentId] = useState<string>('C'); // Simulated default agent (Company Profile C)
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
  const [selectedTreeUserId, setSelectedTreeUserId] = useState<string | null>('C');

  // Security Modal States
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Load from Firestore on mount
  useEffect(() => {
    async function initFirestore() {
      try {
        let data = await seedDatabase({
          users: INITIAL_USERS,
          projects: INITIAL_PROJECTS,
          sales: INITIAL_SALES,
          payouts: INITIAL_PAYOUTS,
          config: INITIAL_MLM_CONFIG,
          notifications: INITIAL_NOTIFICATIONS
        });

        // Auto-migration: Check if database has old data (contains SBR0005 or is missing top-level C)
        const hasOldData = data.users.some(u => u.id === 'SBR0005') || !data.users.some(u => u.id === 'C');
        if (hasOldData) {
          console.log("SBR Cloud Core: Old seed data detected in Firestore. Auto-migrating to the new 7-user SBR MLM Corporate Structure...");
          await resetDatabaseToDefaults({
            users: INITIAL_USERS,
            projects: INITIAL_PROJECTS,
            sales: INITIAL_SALES,
            payouts: INITIAL_PAYOUTS,
            config: INITIAL_MLM_CONFIG,
            notifications: INITIAL_NOTIFICATIONS
          });
          data = {
            users: INITIAL_USERS,
            projects: INITIAL_PROJECTS,
            sales: INITIAL_SALES,
            payouts: INITIAL_PAYOUTS,
            config: INITIAL_MLM_CONFIG,
            notifications: INITIAL_NOTIFICATIONS
          };
          
          localStorage.setItem('SBR_SESSION', JSON.stringify({
            role: 'ADMIN',
            agentId: 'C',
            name: 'Company Profile C'
          }));
        }

        const activeConfig = data.config || INITIAL_MLM_CONFIG;
        
        // Strictly filter to "IMT Sohna" across the platform
        const loadedSales = (data.sales || INITIAL_SALES).filter(s => s.project === 'IMT Sohna');
        const loadedProjects = (data.projects || INITIAL_PROJECTS).filter(p => p.name === 'IMT Sohna');
        
        const loadedUsers = normalizeUsersWithSales(data.users || INITIAL_USERS, loadedSales, activeConfig);
        const loadedPayouts = rebuildPayoutsFromSales(loadedSales, loadedUsers, activeConfig, data.payouts || INITIAL_PAYOUTS);

        // Filter notifications to match
        const loadedNotifs = (data.notifications || INITIAL_NOTIFICATIONS).filter(n => {
          return loadedUsers.some(u => u.id === n.userId);
        });

        setUsers(loadedUsers);
        setProjects(loadedProjects);
        setSales(loadedSales);
        setPayouts(loadedPayouts);
        setConfig(activeConfig);
        setNotifications(loadedNotifs);
      } catch (error) {
        console.error("Firebase Initialization failed, falling back to LocalStorage:", error);
        
        // Local fallback
        const storedUsers = localStorage.getItem('SBR_USERS');
        const storedProjects = localStorage.getItem('SBR_PROJECTS');
        const storedSales = localStorage.getItem('SBR_SALES');
        const storedPayouts = localStorage.getItem('SBR_PAYOUTS');
        const storedConfig = localStorage.getItem('SBR_CONFIG');
        const storedNotifs = localStorage.getItem('SBR_NOTIFICATIONS');

        let activeConfig = INITIAL_MLM_CONFIG;
        if (storedConfig) {
          try {
            activeConfig = JSON.parse(storedConfig);
            setConfig(activeConfig);
          } catch (e) {
            setConfig(INITIAL_MLM_CONFIG);
          }
        } else {
          setConfig(INITIAL_MLM_CONFIG);
        }

        let localSales = (storedSales ? JSON.parse(storedSales) : INITIAL_SALES).filter((s: any) => s.project === 'IMT Sohna');
        let localProjects = (storedProjects ? JSON.parse(storedProjects) : INITIAL_PROJECTS).filter((p: any) => p.name === 'IMT Sohna');
        let localUsers = normalizeUsersWithSales(storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS, localSales, activeConfig);

        // Auto-migration for local fallback
        const hasOldLocalData = localUsers.some(u => u.id === 'SBR0005') || !localUsers.some(u => u.id === 'C');
        if (hasOldLocalData) {
          console.log("SBR Cloud Core: Old seed data detected in LocalStorage. Auto-migrating to the new 7-user SBR MLM Corporate Structure...");
          localSales = INITIAL_SALES;
          localProjects = INITIAL_PROJECTS;
          localUsers = normalizeUsersWithSales(INITIAL_USERS, localSales, activeConfig);
          
          localStorage.setItem('SBR_USERS', JSON.stringify(localUsers));
          localStorage.setItem('SBR_PROJECTS', JSON.stringify(localProjects));
          localStorage.setItem('SBR_SALES', JSON.stringify(localSales));
          localStorage.setItem('SBR_PAYOUTS', JSON.stringify(INITIAL_PAYOUTS));
          localStorage.setItem('SBR_NOTIFICATIONS', JSON.stringify(INITIAL_NOTIFICATIONS));
          
          localStorage.setItem('SBR_SESSION', JSON.stringify({
            role: 'ADMIN',
            agentId: 'C',
            name: 'Company Profile C'
          }));
        }

        const localPayouts = rebuildPayoutsFromSales(localSales, localUsers, activeConfig, storedPayouts ? JSON.parse(storedPayouts) : INITIAL_PAYOUTS);
        const localNotifs = (storedNotifs ? JSON.parse(storedNotifs) : INITIAL_NOTIFICATIONS).filter((n: any) => localUsers.some(u => u.id === n.userId));

        setUsers(localUsers);
        setProjects(localProjects);
        setSales(localSales);
        setPayouts(localPayouts);
        setNotifications(localNotifs);
      } finally {
        setDbLoading(false);
      }
    }

    initFirestore();

    const storedSession = localStorage.getItem('SBR_SESSION');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        // If stored session is for Neha Patel, redirect it to C
        if (parsed.agentId === 'SBR0005') {
          parsed.agentId = 'C';
          parsed.name = 'Company Profile C';
          parsed.role = 'ADMIN';
        }
        setSession(parsed);
        setActiveRole(parsed.role);
        if (parsed.agentId) {
          setActiveAgentId(parsed.agentId);
          setSelectedTreeUserId(parsed.agentId);
        }
      } catch (e) {
        console.error('Error loading stored session', e);
      }
    } else {
      // By default if no session exists, default to Admin Company Profile C session
      const defaultSession = {
        role: 'ADMIN' as UserRole,
        agentId: 'C',
        name: 'Company Profile C'
      };
      setSession(defaultSession);
      setActiveRole('ADMIN');
      setActiveAgentId('C');
      setSelectedTreeUserId('C');
      localStorage.setItem('SBR_SESSION', JSON.stringify(defaultSession));
    }
  }, []);

  const handleLogin = (role: UserRole, agentId?: string) => {
    let name = '';
    if (role === 'ADMIN' && !agentId) {
      name = 'Company Profile C';
      agentId = 'C';
    } else if (agentId) {
      const agent = users.find((u: User) => u.id === agentId);
      name = agent ? agent.name : 'SBR Broker';
    } else {
      name = 'SBR Administrator';
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
    const normalized = normalizeUsersWithSales(users, sales, newConfig);
    setUsers(normalized);
    try {
      await setDocumentData(COLLECTIONS.CONFIG, 'main_config', newConfig);
      // Save any users whose designations have changed
      for (const u of normalized) {
        const original = users.find(o => o.id === u.id);
        if (original && original.designation !== u.designation) {
          await setDocumentData(COLLECTIONS.USERS, u.id, u);
        }
      }
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
      userId: 'C',
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
    const normalizedUsers = normalizeUsersWithSales([...users, newUser], sales, config);
    setUsers(normalizedUsers);
    
    // Create audit notification for admin actions
    const notif: Notification = {
      id: `NOT-${Math.floor(500 + Math.random() * 500)}`,
      userId: newUserData.sponsorId || 'C',
      title: 'New Sourcing Partner Appointed',
      message: `Associate ${newUserData.name} onboarded onto SBR hierarchy with Sponsor ID: ${newUserData.id}.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false
    };

    const updatedNotifs = [notif, ...notifications];
    setNotifications(updatedNotifs);
    
    try {
      // Find the finalized version of the new user in normalizedUsers
      const finalNewUser = normalizedUsers.find(u => u.id === newUser.id) || newUser;
      await setDocumentData(COLLECTIONS.USERS, finalNewUser.id, finalNewUser);

      // Save any other users whose designations might have changed due to this addition
      for (const u of normalizedUsers) {
        if (u.id === newUser.id) continue;
        const oldUser = users.find(old => old.id === u.id);
        if (oldUser && oldUser.designation !== u.designation) {
          await setDocumentData(COLLECTIONS.USERS, u.id, u);
        }
      }

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

    // 2. Build multi-tiered commission payouts and notifications
    const newNotifications: Notification[] = [];
    let currentAgentId: string | null = saleData.agentId;
    let currentLevel = 1;

    let updatedUsers = [...users];

    // Propagate up the sponsor/recruit tree structure to generate notifications
    while (currentAgentId && currentLevel <= config.levels.length) {
      const levelConfig = config.levels.find(l => l.level === currentLevel);
      if (!levelConfig) break;

      const currentAgent = updatedUsers.find(u => u.id === currentAgentId);
      if (!currentAgent) break;

      const value = Math.round(saleData.saleValue);
      const net = value;

      // Trigger user-notification
      const notifId = `NOT-${Math.floor(100 + Math.random() * 900)}`;
      const notifTitle = currentLevel === 1 
        ? 'Personal Sourcing Commission Due'
        : `Indirect Network Overrides (L${currentLevel})`;
      const notifMsg = currentLevel === 1
        ? `We registered your sale of ${saleData.project} (${saleData.unitNumber}) of value ${value} PTS. Scheduled net payout is ${net} PTS.`
        : `A Level ${currentLevel} override of ${net} PTS is pending collection, sourced by downline representative ${agentName} at ${saleData.project}.`;

      newNotifications.push({
        id: notifId,
        userId: currentAgent.id,
        title: notifTitle,
        message: notifMsg,
        amount: net,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false
      });

      // Target immediate grandparent sponsor next
      currentAgentId = currentAgent.sponsorId;
      currentLevel++;
    }

    const normalizedUsers = normalizeUsersWithSales(users, updatedSales, config);
    const updatedPayouts = rebuildPayoutsFromSales(updatedSales, normalizedUsers, config, payouts);
    const updatedNotifs = [...newNotifications, ...notifications];

    setPayouts(updatedPayouts);
    setUsers(normalizedUsers);
    setNotifications(updatedNotifs);

    try {
      await setDocumentData(COLLECTIONS.SALES, newSale.id, newSale);
      if (targetProj) {
        await setDocumentData(COLLECTIONS.PROJECTS, (targetProj as RealEstateProject).id, targetProj);
      }
      for (const p of updatedPayouts) {
        await setDocumentData(COLLECTIONS.PAYOUTS, p.id, p);
      }
      for (const n of newNotifications) {
        await setDocumentData(COLLECTIONS.NOTIFICATIONS, n.id, n);
      }
      
      // Save any user who has modified stats or modified designation
      for (const u of normalizedUsers) {
        const original = users.find(o => o.id === u.id);
        if (!original) {
          await setDocumentData(COLLECTIONS.USERS, u.id, u);
        } else if (
          original.designation !== u.designation ||
          original.totalDirectSales !== u.totalDirectSales ||
          original.totalDownlineSales !== u.totalDownlineSales
        ) {
          await setDocumentData(COLLECTIONS.USERS, u.id, u);
        }
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
    const normalizedUsers = normalizeUsersWithSales(users, updatedSales, config);
    const updatedPayouts = rebuildPayoutsFromSales(updatedSales, normalizedUsers, config, payouts);

    setSales(updatedSales);
    setUsers(normalizedUsers);
    setPayouts(updatedPayouts);

    try {
      await setDocumentData(COLLECTIONS.SALES, updatedSale.id, updatedSale);
      for (const p of updatedPayouts) {
        await setDocumentData(COLLECTIONS.PAYOUTS, p.id, p);
      }
      for (const u of normalizedUsers) {
        const original = users.find(o => o.id === u.id);
        if (original && (original.totalDirectSales !== u.totalDirectSales || original.totalDownlineSales !== u.totalDownlineSales || original.designation !== u.designation)) {
          await setDocumentData(COLLECTIONS.USERS, u.id, u);
        }
      }
    } catch (e) {
      console.error('Firestore save failed', e);
    }
  };

  const handleResetUserPassword = async (userId: string, newPass: string) => {
    setIsSavingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) {
        throw new Error("User profile not found in active session.");
      }
      const updatedUser = { ...userToUpdate, password: newPass };
      
      // Update in Firestore
      await setDocumentData(COLLECTIONS.USERS, userId, updatedUser);
      
      // Update locally
      const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
      setUsers(updatedUsers);
      
      setPasswordSuccess("Password updated successfully! This change is now secure in SBR Cloud Core.");
      setTimeout(() => {
        setIsSecurityModalOpen(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess('');
      }, 2000);
    } catch (e: any) {
      console.error(e);
      setPasswordError("Failed to save password: " + e.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleAdminUpdateUserProfile = async (userId: string, updatedFields: Partial<User>) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) {
        throw new Error("User profile not found in SBR organization.");
      }
      if (['C', 'A1', 'A2'].includes(userId)) {
        throw new Error("Security Violation: Core Administrative nodes are exempt from manual updates.");
      }
      const updatedUser = { ...userToUpdate, ...updatedFields };
      await setDocumentData(COLLECTIONS.USERS, userId, updatedUser);
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? updatedUser : u));
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message || "Failed to update broker credentials.");
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm("Are you sure you want to reset the database? This will overwrite all custom data and seed the standard SBR Corporate MLM structure with Neha Patel and other agents.")) {
      return;
    }
    setDbLoading(true);
    try {
      const filteredSales = INITIAL_SALES.filter(s => s.project === 'IMT Sohna');
      const filteredProjects = INITIAL_PROJECTS.filter(p => p.name === 'IMT Sohna');
      const filteredUsers = normalizeUsersWithSales(INITIAL_USERS, filteredSales, INITIAL_MLM_CONFIG);
      const filteredPayouts = rebuildPayoutsFromSales(filteredSales, filteredUsers, INITIAL_MLM_CONFIG, INITIAL_PAYOUTS);
      const filteredNotifs = INITIAL_NOTIFICATIONS.filter(n => filteredUsers.some(u => u.id === n.userId));

      await resetDatabaseToDefaults({
        users: filteredUsers,
        projects: filteredProjects,
        sales: filteredSales,
        payouts: filteredPayouts,
        config: INITIAL_MLM_CONFIG,
        notifications: filteredNotifs
      });
      
      setUsers(filteredUsers);
      setProjects(filteredProjects);
      setSales(filteredSales);
      setPayouts(filteredPayouts);
      setConfig(INITIAL_MLM_CONFIG);
      setNotifications(filteredNotifs);
      
      setSelectedTreeUserId('C');
      setActiveAgentId('C');
      
      setSession({
        role: 'ADMIN',
        agentId: 'C',
        name: 'Company Profile C'
      });
      setActiveRole('ADMIN');
      localStorage.setItem('SBR_SESSION', JSON.stringify({
        role: 'ADMIN',
        agentId: 'C',
        name: 'Company Profile C'
      }));
      
      alert("Database successfully reset and seeded with the clean 7-user SBR MLM Corporate Hierarchy!");
    } catch (e) {
      console.error("Reset failed", e);
      alert("Failed to reset database: " + e);
    } finally {
      setDbLoading(false);
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
                <h1 className="text-xl font-bold tracking-tight text-stone-900 font-serif">SBR <span className="text-emerald-850 font-normal">Sponsors</span></h1>
              </div>
            </div>
          </div>

          {/* Interactive Role Selector / User Identity Block */}
          {session ? (
            <div className="flex flex-row flex-wrap items-center justify-end gap-1.5 sm:gap-2 z-20 self-center md:self-auto w-auto">
              
              {/* Authenticated Broker or Admin Badge */}
              <div className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 text-[10.5px] sm:text-xs text-stone-700">
                <div className={`w-1.5 h-1.5 rounded-full ${session.role === 'ADMIN' ? 'bg-amber-500' : 'bg-emerald-600'}`} />
                <span className="font-semibold text-stone-900 truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">{session.name}</span>
                <span className="text-[8px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-stone-200 text-stone-800 font-mono scale-90 origin-right">
                  {session.role === 'ADMIN' ? 'ADMIN' : 'ASSOCIATE'}
                </span>
              </div>

              {/* Interactive Role selector ONLY FOR ADMINISTRATOR SESSIONS */}
              {session.role === 'ADMIN' ? (
                <div className="flex p-0.5 bg-stone-100 border border-stone-250 rounded-lg shadow-xs">
                  <button
                    onClick={() => setActiveRole('ADMIN')}
                    className={`px-2 py-1 rounded text-[10px] sm:text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      activeRole === 'ADMIN' 
                        ? 'bg-emerald-800 text-white shadow-xs' 
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    👑 <span className="hidden xs:inline">Owner/Admin</span>
                  </button>
                  <button
                    onClick={() => setActiveRole('AGENT')}
                    className={`px-1.5 py-1 rounded text-[10px] sm:text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      activeRole === 'AGENT' 
                        ? 'bg-emerald-800 text-white shadow-xs' 
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    💼 <span className="hidden xs:inline">Channel Partner Panel</span>
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 text-[10.5px] sm:text-xs text-emerald-800 font-medium">
                  🔑 Session Verified
                </div>
              )}

              {/* Reset Database Button */}
              {session.role === 'ADMIN' && (
                <button
                  onClick={handleResetDatabase}
                  className="px-2 py-1 font-bold text-[10.5px] sm:text-xs rounded-lg bg-amber-600 hover:bg-amber-700 text-white border border-amber-700/50 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  title="Reset database to the standard 7-user SBR Corporate Tree"
                >
                  <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin-slow" />
                  <span className="hidden md:inline">Reset SBR Hierarchy</span>
                </button>
              )}

              {/* Security Credentials Button */}
              {session.agentId && (
                <button
                  onClick={() => setIsSecurityModalOpen(true)}
                  className="px-2 py-1 font-bold text-[10.5px] sm:text-xs rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300/80 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  title="Change your secure login passcode"
                >
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-600" />
                  <span className="hidden sm:inline">Passcode Settings</span>
                </button>
              )}

              {/* Log Out Button */}
              <button
                onClick={handleLogout}
                className="px-2 py-1 font-bold text-[10.5px] sm:text-xs rounded-lg bg-stone-200/60 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-stone-300/80 text-stone-700 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                title="Disconnect from session"
              >
                <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Disconnect</span>
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
              onUpdateUserProfile={handleAdminUpdateUserProfile}
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
                Track direct sales volumes, strategic team downlines, and check your commission bank slip alerts.
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

      {/* Security Passcode Modal */}
      {isSecurityModalOpen && session?.agentId && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-white/10 text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">Secure Passcode Settings</h3>
                  <p className="text-[10px] text-stone-300">Protected by SBR Cloud Core</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSecurityModalOpen(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
                className="text-stone-400 hover:text-white transition-colors cursor-pointer text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPassword.trim()) {
                  setPasswordError('Please enter a valid password.');
                  return;
                }
                if (newPassword !== confirmPassword) {
                  setPasswordError('Passwords do not match.');
                  return;
                }
                handleResetUserPassword(session.agentId!, newPassword);
              }}
              className="p-6 space-y-4"
            >
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-xs">
                <div className="text-stone-500">Updating credentials for:</div>
                <div className="font-bold text-stone-850 flex items-center gap-1.5">
                  <span className="font-mono bg-stone-200 px-1.5 py-0.5 rounded text-stone-800">{session.agentId}</span>
                  <span>({session.name})</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wide">New Secure Passcode</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Enter dynamic passcode"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-emerald-800 focus:bg-white transition-all text-stone-800 font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wide">Confirm Secure Passcode</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Verify dynamic passcode"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-emerald-800 focus:bg-white transition-all text-stone-800 font-medium"
                  required
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2">
                  <span>⚠</span>
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <span>✓</span>
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSecurityModalOpen(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-250 rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassword || !!passwordSuccess}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 border border-emerald-950 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingPassword ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Secure Passcode</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

