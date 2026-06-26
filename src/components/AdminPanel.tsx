import React, { useState } from 'react';
import { User, MLMConfig, CommissionPayout, Sale, RealEstateProject, PaymentRecord } from '../types';
import { 
  Settings, Users, PlusCircle, Save, TrendingUp, DollarSign, Percent, 
  ShieldCheck, RefreshCw, Star, Map, FileSpreadsheet, Layers, CheckCircle, 
  Search, ShieldAlert, Award, Calendar, Home, CreditCard, Trash2, Plus, Edit, Share2,
  BarChart3, Download, Printer
} from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  onAddUser: (user: Omit<User, 'totalDirectSales' | 'totalDownlineSales'>) => void;
  config: MLMConfig;
  onUpdateConfig: (config: MLMConfig) => void;
  sales: Sale[];
  payouts: CommissionPayout[];
  onToggleUserStatus: (userId: string) => void;
  projects: RealEstateProject[];
  onAddProject: (project: RealEstateProject) => void;
  onAddSale: (saleData: {
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
  }) => void;
  onUpdateProjects: (projects: RealEstateProject[]) => void;
  onApprovePayout: (payoutId: string) => void;
  onDisbursePayout: (payoutId: string) => void;
  onUpdateSaleBookingStatus?: (saleId: string, bookingStatus: 'TOKEN_RECEIVED' | 'BOOKING_DONE' | 'REGISTRY_DONE', tokenAmount?: number) => void;
  onUpdateSale?: (sale: Sale) => void;
}

export default function AdminPanel({
  users,
  onAddUser,
  config,
  onUpdateConfig,
  sales,
  payouts,
  onToggleUserStatus,
  projects,
  onAddProject,
  onAddSale,
  onUpdateProjects,
  onApprovePayout,
  onDisbursePayout,
  onUpdateSaleBookingStatus,
  onUpdateSale
}: AdminPanelProps) {
  // Tabs: SETTINGS, AGENTS, PROJECTS, BOOKINGS, SALES, PAYOUTS, REPORTS
  const [activeSubTab, setActiveSubTab] = useState<'SETTINGS' | 'AGENTS' | 'PROJECTS' | 'BOOKINGS' | 'SALES' | 'PAYOUTS' | 'REPORTS'>('SETTINGS');

  const formatPoints = (val: number) => {
    return `${Number(val.toFixed(3)).toLocaleString()} PTS`;
  };

  const formatINR = (val: number) => {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  const exportToCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvString = [headers.join(",")].concat(rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))).join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // MLM config state (10 levels)
  const [tds, setTds] = useState(config.tdsPercentage);
  const [adminFee, setAdminFee] = useState(config.adminFeePercentage);
  const [levels, setLevels] = useState(config.levels);
  const [rewards, setRewards] = useState(config.rewards || []);
  const [salaries, setSalaries] = useState(config.salaries || []);
  
  // SBR business configurations
  const [leadershipConfigs, setLeadershipConfigs] = useState(config.leadershipConfigs || []);
  const [promotionalMilestones, setPromotionalMilestones] = useState(config.promotionalMilestones || []);
  const [specialMonthlyOffers, setSpecialMonthlyOffers] = useState(config.specialMonthlyOffers || []);
  const [termsAndConditions, setTermsAndConditions] = useState(config.termsAndConditions || []);
  
  // Target index for editing
  const [editingLeadIdx, setEditingLeadIdx] = useState<number | null>(null);
  const [editLeadDesignation, setEditLeadDesignation] = useState('');
  const [editLeadCondition, setEditLeadCondition] = useState('');
  const [editLeadDirectVol, setEditLeadDirectVol] = useState<number>(0);
  const [editLeadIncentivePrice, setEditLeadIncentivePrice] = useState<number>(0);
  const [editLeadRules, setEditLeadRules] = useState('');

  const [editingMilestoneIdx, setEditingMilestoneIdx] = useState<number | null>(null);
  const [editMilestoneCondition, setEditMilestoneCondition] = useState('');
  const [editMilestoneAward, setEditMilestoneAward] = useState('');

  const [editingOfferIdx, setEditingOfferIdx] = useState<number | null>(null);
  const [editOfferVolumeSqYds, setEditOfferVolumeSqYds] = useState<number>(0);
  const [editOfferPaymentPercentage, setEditOfferPaymentPercentage] = useState<number>(0);
  const [editOfferPerkName, setEditOfferPerkName] = useState('');
  const [editOfferStartDate, setEditOfferStartDate] = useState('');
  const [editOfferEndDate, setEditOfferEndDate] = useState('');

  const [editingTermIdx, setEditingTermIdx] = useState<number | null>(null);
  const [editTermText, setEditTermText] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');

  // SBR Onboarding state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSponsor, setNewSponsor] = useState('');
  const [newDesignation, setNewDesignation] = useState<User['designation']>('Associate');
  // PII fields
  const [newDob, setNewDob] = useState('');
  const [newAadhar, setNewAadhar] = useState('');
  const [newPan, setNewPan] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhoto, setNewPhoto] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256');

  const [createUserSuccess, setCreateUserSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  // Project Creation state
  const [projName, setProjName] = useState('');
  const [projLocation, setProjLocation] = useState('');
  const [projStartingPrice, setProjStartingPrice] = useState(15000); // INR per Sq Yard
  const [projMapUrl, setProjMapUrl] = useState('https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&q=80&w=800');
  const [sizeTiersInput, setSizeTiersInput] = useState([
    { size: '120 Sq Yards', unitsRaw: 'Villa A-101, Villa A-102, Villa A-103' },
    { size: '150 Sq Yards', unitsRaw: 'Villa B-201, Villa B-202, Villa B-203, Villa B-204' },
    { size: '200 Sq Yards', unitsRaw: 'Villa C-501, Villa C-502' }
  ]);
  const [projSuccess, setProjSuccess] = useState('');

  // Plot SBR Booking state
  const [bookProjId, setBookProjId] = useState('');
  const [bookSizeCategory, setBookSizeCategory] = useState('');
  const [bookUnitNumber, setBookUnitNumber] = useState('');
  const [bookBuyerName, setBookBuyerName] = useState('');
  const [bookSaleValue, setBookSaleValue] = useState('');
  const [bookAgentId, setBookAgentId] = useState('');
  const [bookRefNumber, setBookRefNumber] = useState('');
  const [bookStatus, setBookStatus] = useState<'BOOKED' | 'HOLD'>('BOOKED');
  const [bookingFormStatus, setBookingFormStatus] = useState<'TOKEN_RECEIVED' | 'BOOKING_DONE' | 'REGISTRY_DONE'>('TOKEN_RECEIVED');
  const [bookingFormTokenAmount, setBookingFormTokenAmount] = useState('75000');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  const [bookRatePerSqYard, setBookRatePerSqYard] = useState('15000');
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  // Set rate per sq yard when project changes
  React.useEffect(() => {
    const activeProj = projects.find(p => p.id === bookProjId);
    if (activeProj) {
      setBookRatePerSqYard((activeProj.sqYardStartingPrice ?? 15000).toString());
    }
  }, [bookProjId, projects]);

  // Reports & Ledgers states
  const [selectedReportMonth, setSelectedReportMonth] = useState<string>('ALL');
  const [selectedReportProject, setSelectedReportProject] = useState<string>('ALL');
  const [reportSearchQuery, setReportSearchQuery] = useState<string>('');
  const [selectedSaleDetailId, setSelectedSaleDetailId] = useState<string | null>(null);

  // Payments Ledger and Editor State
  const [selectedPaymentSaleId, setSelectedPaymentSaleId] = useState<string | null>(null);
  const [paymentFormId, setPaymentFormId] = useState<string | null>(null); // For editing a payment
  const [paymentFormAmount, setPaymentFormAmount] = useState<string>('');
  const [paymentFormDate, setPaymentFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentFormMode, setPaymentFormMode] = useState<'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER'>('BANK_TRANSFER');
  const [paymentFormReference, setPaymentFormReference] = useState<string>('');
  const [paymentFormNotes, setPaymentFormNotes] = useState<string>('');

  const getSalePayments = (s: Sale): PaymentRecord[] => {
    if (s.payments && s.payments.length > 0) {
      return s.payments;
    }
    if (s.tokenAmount !== undefined) {
      return [{
        id: `PAY-INIT-${s.id}`,
        amount: s.tokenAmount,
        date: s.saleDate || new Date().toISOString().split('T')[0],
        paymentMode: 'BANK_TRANSFER',
        notes: 'Initial token amount'
      }];
    }
    return [];
  };

  const getSaleTotalAgreementValueINR = (s: Sale): number => {
    const sizePart = parseFloat(s.sizeSqYards.replace(/[^\d.]/g, '')) || 0;
    const unitsCount = s.unitNumber.split(',').map(u => u.trim()).filter(Boolean).length || 1;
    const rate = s.ratePerSqYard || 15000;
    return sizePart * unitsCount * rate;
  };

  const handleAddOrUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentSaleId || !onUpdateSale) return;
    const s = sales.find(x => x.id === selectedPaymentSaleId);
    if (!s) return;

    const currentPayments = getSalePayments(s);
    const amountVal = parseFloat(paymentFormAmount) || 0;

    if (paymentFormId) {
      // Editing existing payment
      const updatedPayments = currentPayments.map(p => {
        if (p.id === paymentFormId) {
          return {
            ...p,
            amount: amountVal,
            date: paymentFormDate,
            paymentMode: paymentFormMode,
            reference: paymentFormReference,
            notes: paymentFormNotes
          };
        }
        return p;
      });
      const firstPaymentAmt = updatedPayments[0]?.amount ?? amountVal;
      onUpdateSale({
        ...s,
        payments: updatedPayments,
        tokenAmount: firstPaymentAmt
      });
    } else {
      // Adding new payment
      const newPayment: PaymentRecord = {
        id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: amountVal,
        date: paymentFormDate,
        paymentMode: paymentFormMode,
        reference: paymentFormReference,
        notes: paymentFormNotes
      };
      const updatedPayments = [...currentPayments, newPayment];
      const firstPaymentAmt = updatedPayments[0]?.amount ?? amountVal;
      onUpdateSale({
        ...s,
        payments: updatedPayments,
        tokenAmount: firstPaymentAmt
      });
    }

    // Reset Form
    setPaymentFormId(null);
    setPaymentFormAmount('');
    setPaymentFormDate(new Date().toISOString().split('T')[0]);
    setPaymentFormMode('BANK_TRANSFER');
    setPaymentFormReference('');
    setPaymentFormNotes('');
  };

  const handleEditPaymentClick = (pay: PaymentRecord) => {
    setPaymentFormId(pay.id);
    setPaymentFormAmount(pay.amount.toString());
    setPaymentFormDate(pay.date);
    setPaymentFormMode(pay.paymentMode);
    setPaymentFormReference(pay.reference || '');
    setPaymentFormNotes(pay.notes || '');
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!selectedPaymentSaleId || !onUpdateSale) return;
    const s = sales.find(x => x.id === selectedPaymentSaleId);
    if (!s) return;

    const currentPayments = getSalePayments(s);
    const updatedPayments = currentPayments.filter(p => p.id !== paymentId);
    const firstPaymentAmt = updatedPayments[0]?.amount ?? 0;
    
    onUpdateSale({
      ...s,
      payments: updatedPayments,
      tokenAmount: firstPaymentAmt
    });
    
    if (paymentFormId === paymentId) {
      setPaymentFormId(null);
      setPaymentFormAmount('');
      setPaymentFormDate(new Date().toISOString().split('T')[0]);
      setPaymentFormMode('BANK_TRANSFER');
      setPaymentFormReference('');
      setPaymentFormNotes('');
    }
  };

  const renderPaymentProgress = (s: Sale) => {
    const payments = getSalePayments(s);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalValue = getSaleTotalAgreementValueINR(s);
    const pending = totalValue - totalPaid;
    const pct = totalValue > 0 ? (totalPaid / totalValue) * 100 : 0;
    return (
      <div className="flex flex-col gap-1 min-w-[130px]">
        <div className="flex justify-between items-center text-[10px] font-sans">
          <span className="font-bold text-stone-800">{formatINR(totalPaid)}</span>
          <span className="text-stone-500 font-bold">({pct.toFixed(1)}%)</span>
        </div>
        <div className="w-full bg-stone-150 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              pct >= 100 
                ? 'bg-emerald-650' 
                : pct >= 30 
                ? 'bg-blue-600' 
                : 'bg-amber-600'
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] font-mono text-stone-500">
          <span>Val: {formatINR(totalValue)}</span>
          <span className={pending > 0 ? 'text-amber-800 font-bold' : 'text-emerald-800 font-bold'}>
            {pending > 0 ? `Pending: ${formatINR(pending)}` : 'Fully Paid'}
          </span>
        </div>
      </div>
    );
  };

  // Auto-fill points based on Plot Size (Sq Yds) * Selected Units count * Rate per Sq Yd (in INR)
  // Formula: (Plot Size * Units * Rate) / 750000
  React.useEffect(() => {
    if (bookSizeCategory) {
      const numericSizePart = parseFloat(bookSizeCategory.replace(/[^\d.]/g, '')) || 0;
      const unitCount = selectedUnits.length || 1;
      const totalSize = numericSizePart * unitCount;
      const rate = parseFloat(bookRatePerSqYard) || 15000;
      const calculatedPoints = (totalSize * rate) / 750000;
      
      if (calculatedPoints > 0) {
        setBookSaleValue(Number(calculatedPoints.toFixed(3)).toString());
      } else {
        setBookSaleValue('');
      }
    } else {
      setBookSaleValue('');
    }
  }, [bookSizeCategory, selectedUnits, bookRatePerSqYard]);

  // Calculate stats
  const totalSalesVal = sales.reduce((acc, s) => acc + s.saleValue, 0);
  const totalCommissionDistributed = payouts
    .filter(p => p.status === 'DISBURSED')
    .reduce((acc, p) => acc + p.netCommission, 0);
  const totalCommissionPending = payouts
    .filter(p => p.status === 'PENDING' || p.status === 'APPROVED')
    .reduce((acc, p) => acc + p.netCommission, 0);

  // Generate mathematical sequential SBR0001 sponsor ID
  const getNextSequentialId = () => {
    const sbrIds = users
      .map(u => u.id)
      .filter(id => id.startsWith('SBR'))
      .map(id => {
        const numPart = id.replace('SBR', '');
        const num = parseInt(numPart, 10);
        return isNaN(num) ? 0 : num;
      });
    const maxNum = sbrIds.length > 0 ? Math.max(...sbrIds) : 0;
    const nextNum = maxNum >= 1 ? maxNum + 1 : 1;
    return `SBR${String(nextNum).padStart(4, '0')}`;
  };

  const handleUpdateConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      tdsPercentage: Number(tds),
      adminFeePercentage: Number(adminFee),
      levels: levels.map(l => ({ ...l, percentage: Number(l.percentage) })),
      rewards: rewards.map(r => ({ ...r, targetVolume: Number(r.targetVolume) })),
      salaries: salaries.map(s => ({ ...s, fixedSalary: Number(s.fixedSalary || 0), targetRequired: Number(s.targetRequired || 0) })),
      leadershipConfigs,
      promotionalMilestones,
      specialMonthlyOffers,
      termsAndConditions
    });
    setSuccessMsg('Sourcing compensation tier, leadership rules, special offers and SBR milestone criteria successfully saved.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleLevelPercentChange = (levelNum: number, value: string) => {
    setLevels(prev =>
      prev.map(item => (item.level === levelNum ? { ...item, percentage: parseFloat(value) || 0 } : item))
    );
  };

  const handleOnboardAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPhone) {
      setErrorMsg('Full Name, Email and Mobile Number are required.');
      return;
    }
    if (!newAadhar || !newPan) {
      setErrorMsg('Govt Compliance: Aadhaar Card and PAN Card details are mandatory to issue commission payouts.');
      return;
    }

    const assignedId = getNextSequentialId();

    onAddUser({
      id: assignedId,
      name: newName,
      email: newEmail,
      phone: newPhone,
      role: 'AGENT',
      sponsorId: newSponsor || null,
      joinedDate: new Date().toISOString().split('T')[0],
      designation: newDesignation,
      status: 'ACTIVE',
      dob: newDob || '1990-01-01',
      aadhar: newAadhar,
      pan: newPan,
      address: newAddress || 'Sub-broker Office network',
      photo: newPhoto
    });

    setCreateUserSuccess(`Successfully onboarded ${newName} as SBR Certified Partner. ID: ${assignedId}`);
    setErrorMsg('');
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewSponsor('');
    setNewDob('');
    setNewAadhar('');
    setNewPan('');
    setNewAddress('');
    setTimeout(() => setCreateUserSuccess(''), 6000);
  };

  // Add Project
  const handleAddNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName || !projLocation) {
      setErrorMsg('Project Name and Location/Address are required metadata fields.');
      return;
    }

    const uniqueProjId = `PRJ-${Math.floor(100 + Math.random() * 900)}`;
    
    // Process units
    const formattedInventory = sizeTiersInput.map(tier => {
      const unitsArr = tier.unitsRaw
        .split(',')
        .map(u => u.trim())
        .filter(u => u !== '')
        .map(u => ({
          unitNumber: u,
          status: 'AVAILABLE' as const,
          bookedByAgentId: null,
          buyerName: null
        }));
      return {
        size: tier.size,
        units: unitsArr
      };
    });

    // Min and Max pricing estimation (Sq yard * starting rate)
    const basePrices = sizeTiersInput.map(t => {
      const numericSize = parseInt(t.size.replace(/\D/g, ''), 10) || 100;
      return numericSize * projStartingPrice;
    });
    const minVal = basePrices.length ? Math.min(...basePrices) : projStartingPrice * 100;
    const maxVal = basePrices.length ? Math.max(...basePrices) : projStartingPrice * 200;

    onAddProject({
      id: uniqueProjId,
      name: projName,
      location: projLocation,
      sqYardStartingPrice: Number(projStartingPrice),
      minPrice: minVal,
      maxPrice: maxVal,
      imageMapUrl: projMapUrl,
      inventory: formattedInventory
    });

    setProjSuccess(`Successfully created Real Estate Project: "${projName}" with ${formattedInventory.reduce((acc, c) => acc + c.units.length, 0)} registered inventory units!`);
    setProjName('');
    setProjLocation('');
    setTimeout(() => setProjSuccess(''), 5000);
  };

  // Trigger SBR Booking
  const handleBookInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUnitNumber = selectedUnits.join(', ');
    if (!bookProjId || !bookSizeCategory || selectedUnits.length === 0 || !bookBuyerName || !bookSaleValue || !bookAgentId) {
      setBookingError('All fields including selected unit(s) and channel partner are required to log an agreement.');
      return;
    }

    const activeProj = projects.find(p => p.id === bookProjId);
    if (!activeProj) return;

    onAddSale({
      project: activeProj.name,
      projectId: bookProjId,
      unitNumber: finalUnitNumber,
      buyerName: bookBuyerName,
      saleValue: Number(bookSaleValue),
      agentId: bookAgentId,
      saleDate: new Date().toISOString().split('T')[0],
      referenceNumber: bookRefNumber || `REF-ONLINE-${Math.floor(100000 + Math.random() * 900000)}`,
      sizeSqYards: bookSizeCategory.includes('Sq Yards') ? bookSizeCategory : `${bookSizeCategory} Sq Yards`,
      status: bookStatus === 'HOLD' ? 'HOLD' : 'BOOKED',
      bookingStatus: bookingFormStatus,
      tokenAmount: Number(bookingFormTokenAmount),
      ratePerSqYard: Number(bookRatePerSqYard)
    });

    setBookingSuccess(`Registered booking for ${finalUnitNumber} of project "${activeProj.name}" by partner ${bookAgentId}! Level commissions queued for audit.`);
    setBookingError('');
    setBookBuyerName('');
    setBookSaleValue('');
    setBookRefNumber('');
    setBookUnitNumber('');
    setSelectedUnits([]);
    setTimeout(() => setBookingSuccess(''), 5000);
  };

  const handleSizeTierChange = (index: number, field: 'size' | 'unitsRaw', value: string) => {
    const updated = [...sizeTiersInput];
    updated[index][field] = value;
    setSizeTiersInput(updated);
  };

  const addSizeTierRow = () => {
    setSizeTiersInput([...sizeTiersInput, { size: '100 Sq Yards', unitsRaw: 'Villa X-101' }]);
  };

  const removeSizeTierRow = (index: number) => {
    setSizeTiersInput(sizeTiersInput.filter((_, i) => i !== index));
  };

  // Filter projects units by category
  const selectedProjObject = projects.find(p => p.id === bookProjId);
  const sizeInventory = selectedProjObject?.inventory.find(inv => inv.size === bookSizeCategory);
  const unitsToBook = sizeInventory
    ? sizeInventory.units.filter(u => u.status === 'AVAILABLE')
    : (selectedProjObject?.inventory.flatMap(inv => inv.units).filter(u => u.status === 'AVAILABLE') || []);

  const filteredAgents = users.filter(u =>
    u.name.toLowerCase().includes(agentFilter.toLowerCase()) ||
    u.id.toLowerCase().includes(agentFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* SBR Administrative Performance Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-stone-550 uppercase tracking-wider">Gross Sourced Volume</p>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-stone-900 mt-1">
                {formatPoints(totalSalesVal)}
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-150">
              <TrendingUp className="w-5 h-5 text-emerald-800" />
            </div>
          </div>
          <p className="text-[10px] text-stone-500 mt-2">Value of all booked plots/villas</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-stone-550 uppercase tracking-wider">Settled Commissions</p>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-emerald-800 mt-1">
                {formatPoints(totalCommissionDistributed)}
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-150">
              <DollarSign className="w-5 h-5 text-emerald-800" />
            </div>
          </div>
          <p className="text-[10px] text-stone-500 mt-2">Disbursed net bank transfers (tax withheld)</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-stone-550 uppercase tracking-wider">Commission Liabilities</p>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-amber-700 mt-1">
                {formatPoints(totalCommissionPending)}
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-150">
              <RefreshCw className="w-5 h-5 text-amber-700 font-bold" />
            </div>
          </div>
          <p className="text-[10px] text-stone-500 mt-2">Queue awaiting auditor release clearances</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-stone-550 uppercase tracking-wider">Active Sourcing Team</p>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                {users.filter(u => u.status === 'ACTIVE').length} / {users.length}
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-150">
              <Users className="w-5 h-5 text-indigo-800" />
            </div>
          </div>
          <p className="text-[10px] text-stone-500 mt-2">Active sub-brokers mapped in team structure</p>
        </div>
      </div>

      {/* Admin Panel sub tab bar */}
      <div className="flex flex-wrap p-1.5 bg-stone-100 border border-stone-200/85 rounded-2xl gap-1">
        <button
          onClick={() => setActiveSubTab('SETTINGS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'SETTINGS' ? 'bg-emerald-800 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Settings className="w-4 h-4" /> Compensation & Incentives
        </button>
        <button
          onClick={() => setActiveSubTab('AGENTS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'AGENTS' ? 'bg-emerald-800 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Users className="w-4 h-4" /> Onboard Sponsors (SBR)
        </button>
        <button
          onClick={() => setActiveSubTab('PROJECTS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'PROJECTS' ? 'bg-emerald-800 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Map className="w-4 h-4" /> SBR Projects Setup
        </button>
        <button
          onClick={() => setActiveSubTab('BOOKINGS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'BOOKINGS' ? 'bg-emerald-800 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Layers className="w-4 h-4" /> Book Plot Inventory
        </button>
        <button
          onClick={() => setActiveSubTab('SALES')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'SALES' ? 'bg-emerald-800 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Corporate Sales Ledger
        </button>
        <button
          onClick={() => setActiveSubTab('PAYOUTS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'PAYOUTS' ? 'bg-emerald-800 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Operations & Payouts Auditing
        </button>
        <button
          onClick={() => setActiveSubTab('REPORTS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'REPORTS' ? 'bg-emerald-800 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Reports & Monthly Ledgers
        </button>
      </div>

      {/* SUB-TAB PANELS */}
      
      {/* 1. COMPREHENSIVE COMPENSATION & INCENTIVES */}
      {activeSubTab === 'SETTINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-200 bg-stone-50/50">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 text-sm uppercase tracking-wide">
                <Settings className="w-4.5 h-4.5 text-emerald-800" /> SBR Incentive Commission Engine (L1 to L10)
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Configure commission slices dynamically. Percentage overrides distribute deep across up to 10 sponsor nodes on bookings.
              </p>
            </div>

            <form onSubmit={handleUpdateConfigSubmit} className="p-5 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1">TDS Rate (Section 194H)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={tds}
                      onChange={(e) => setTds(parseFloat(e.target.value) || 0)}
                      className="w-full pr-8 pl-3 py-2 text-xs font-mono font-bold rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                    <Percent className="absolute right-3 top-3 w-3.5 h-3.5 text-stone-400" />
                  </div>
                  <p className="text-[9.5px] text-stone-550 mt-1">Government mandated withholding rate on commissions</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1">SBR Admin Retention Fee</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={adminFee}
                      onChange={(e) => setAdminFee(parseFloat(e.target.value) || 0)}
                      className="w-full pr-8 pl-3 py-2 text-xs font-mono font-bold rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                    <Percent className="absolute right-3 top-3 w-3.5 h-3.5 text-stone-400" />
                  </div>
                  <p className="text-[9.5px] text-stone-550 mt-1">Platform development and logistics operational charge</p>
                </div>
              </div>

              {/* Commission royalties list */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block font-sans">Commission Slab Override Grid (L1 to L10)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-stone-200 rounded-xl p-3 bg-stone-50">
                  {levels.map((lvl) => (
                    <div key={lvl.level} className="flex items-center justify-between gap-3 text-xs p-1.5 rounded bg-white border border-stone-150">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold flex items-center justify-center border border-emerald-150 font-mono">
                          L{lvl.level}
                        </span>
                        <span className="text-stone-750 font-medium font-sans text-[11px]">
                          {lvl.level === 1 ? 'Direct Sourcing Broker' : `Sponsor Partner (Tier ${lvl.level})`}
                        </span>
                      </div>
                      <div className="relative w-23">
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          max="100"
                          value={lvl.percentage}
                          onChange={(e) => handleLevelPercentChange(lvl.level, e.target.value)}
                          className="w-full pr-6 pl-2 py-1 text-right text-xs font-mono font-bold rounded border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                        />
                        <Percent className="absolute right-1 top-2.5 w-3 h-3 text-stone-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {successMsg && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 stroke-2 text-emerald-800" />
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs uppercase tracking-wider font-sans"
              >
                <Save className="w-3.5 h-3.5" /> Save Compensation Slab Rules
              </button>
            </form>
          </div>

          {/* RIGHT SIDE: INTERACTIVE MOTIVATIONAL CONFIGURATIONS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* A. Leadership Configurations List Editor */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-stone-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Award className="w-4 h-4 text-emerald-800" /> SBR Leadership Configurations
                  </h3>
                  <p className="text-[9px] text-stone-500">Tier designation conditions and incentive rates</p>
                </div>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="space-y-2">
                  {leadershipConfigs.map((cfg, idx) => (
                    <div key={idx}>
                      {editingLeadIdx === idx ? (
                        <div className="bg-emerald-50/45 border border-emerald-250 rounded-xl p-3 text-xs space-y-2 flex flex-col font-sans">
                          <span className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-wide">Edit Designation Config</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5">Designation</label>
                              <input
                                type="text"
                                value={editLeadDesignation}
                                onChange={(e) => setEditLeadDesignation(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5">Condition</label>
                              <input
                                type="text"
                                value={editLeadCondition}
                                onChange={(e) => setEditLeadCondition(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5">Min Direct Vol (sq yd)</label>
                              <input
                                type="number"
                                value={editLeadDirectVol}
                                onChange={(e) => setEditLeadDirectVol(Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5">Incentive Price (₹)</label>
                              <input
                                type="number"
                                value={editLeadIncentivePrice}
                                onChange={(e) => setEditLeadIncentivePrice(Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-mono font-bold"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5">Sponsor / Lineage Rules</label>
                              <input
                                type="text"
                                value={editLeadRules}
                                onChange={(e) => setEditLeadRules(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingLeadIdx(null)}
                              className="px-2.5 py-1 text-[10px] bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-md transition-all cursor-pointer font-sans"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (editLeadDesignation.trim()) {
                                  const updated = [...leadershipConfigs];
                                  updated[idx] = {
                                    ...updated[idx],
                                    designation: editLeadDesignation,
                                    condition: editLeadCondition,
                                    directVol: editLeadDirectVol,
                                    incentivePrice: editLeadIncentivePrice,
                                    rules: editLeadRules
                                  };
                                  setLeadershipConfigs(updated);
                                  setEditingLeadIdx(null);
                                }
                              }}
                              className="px-2.5 py-1 text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-md transition-all cursor-pointer font-sans"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-stone-900 uppercase text-[10.5px] tracking-wide">{cfg.designation}</span>
                              <span className="text-[9px] bg-emerald-50 text-emerald-800 font-mono font-bold px-1.5 py-0.5 rounded">
                                ₹{(cfg.incentivePrice || 0).toLocaleString()}/sq yd
                              </span>
                            </div>
                            {cfg.condition && (
                              <p className="text-[10px] text-stone-600">Condition: <strong className="text-stone-850">{cfg.condition}</strong></p>
                            )}
                            <p className="text-[10px] text-stone-600">Min Direct Vol: <strong className="text-stone-900">{(cfg.directVol || 0).toLocaleString()} sq yd</strong></p>
                            <p className="text-[9.5px] text-stone-500 leading-normal italic">Lineage: {cfg.rules}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingLeadIdx(idx);
                                setEditLeadDesignation(cfg.designation || '');
                                setEditLeadCondition(cfg.condition || '');
                                setEditLeadDirectVol(cfg.directVol || 0);
                                setEditLeadIncentivePrice(cfg.incentivePrice || 0);
                                setEditLeadRules(cfg.rules || '');
                              }}
                              className="p-1.5 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 hover:text-emerald-700 rounded-lg text-stone-400 transition-all cursor-pointer"
                              title="Edit Condition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setLeadershipConfigs(leadershipConfigs.filter((_, i) => i !== idx))}
                              className="p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 hover:text-rose-600 rounded-lg text-stone-400 transition-all cursor-pointer"
                              title="Delete Condition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Inline Add Form */}
                <div className="p-3 bg-stone-50/50 border border-dashed border-stone-200 rounded-xl space-y-2.5">
                  <span className="text-[9.5px] font-bold text-stone-650 uppercase tracking-wide block font-sans">Add Custom Designation Config</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      id="lead-rank"
                      placeholder="Designation Name (e.g. GM)"
                      className="px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none placeholder-stone-400"
                    />
                    <input
                      type="text"
                      id="lead-cond"
                      placeholder="Condition (e.g. 10 Direct, 100 Team)"
                      className="px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none placeholder-stone-400"
                    />
                    <input
                      type="number"
                      id="lead-vol"
                      placeholder="Req. Volume (sq yd)"
                      className="px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none placeholder-stone-400"
                    />
                    <input
                      type="number"
                      id="lead-price"
                      placeholder="Incentive Price (₹)"
                      className="px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none placeholder-stone-400"
                    />
                    <input
                      type="text"
                      id="lead-lineage"
                      placeholder="Sponsor / Lineage Rules"
                      className="px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none placeholder-stone-400 col-span-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const rankEl = document.getElementById('lead-rank') as HTMLInputElement;
                      const condEl = document.getElementById('lead-cond') as HTMLInputElement;
                      const volEl = document.getElementById('lead-vol') as HTMLInputElement;
                      const priceEl = document.getElementById('lead-price') as HTMLInputElement;
                      const rulesEl = document.getElementById('lead-lineage') as HTMLInputElement;
                      if (rankEl && volEl && priceEl && rulesEl && rankEl.value) {
                        setLeadershipConfigs([
                          ...leadershipConfigs,
                          {
                            designation: rankEl.value,
                            condition: condEl ? condEl.value : '',
                            directVol: Number(volEl.value) || 0,
                            incentivePrice: Number(priceEl.value) || 0,
                            rules: rulesEl.value || 'None'
                          }
                        ]);
                        rankEl.value = '';
                        if (condEl) condEl.value = '';
                        volEl.value = '';
                        priceEl.value = '';
                        rulesEl.value = '';
                      }
                    }}
                    className="w-full py-1.5 bg-stone-900 text-white rounded text-[10.5px] font-bold tracking-wider hover:bg-stone-800 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Append Designation
                  </button>
                </div>
              </div>
            </div>

            {/* B. Sponsoring Milestones List Editor */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-stone-200 bg-stone-50/50">
                <h3 className="font-bold text-stone-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4 text-emerald-800" /> SBR Sponsoring Milestones
                </h3>
                <p className="text-[9px] text-stone-500">Active milestone incentives to keep brokers active</p>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="space-y-2">
                  {promotionalMilestones.map((m, idx) => (
                    <div key={idx}>
                      {editingMilestoneIdx === idx ? (
                        <div className="bg-emerald-50/45 border border-emerald-250 rounded-xl p-3 text-xs space-y-2 flex flex-col font-sans">
                          <span className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-wide">Edit Milestone Config</span>
                          <div className="space-y-2">
                            <div>
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5 font-sans">Milestone Criteria</label>
                              <input
                                type="text"
                                value={editMilestoneCondition}
                                onChange={(e) => setEditMilestoneCondition(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5 font-sans">Reward Perks</label>
                              <input
                                type="text"
                                value={editMilestoneAward}
                                onChange={(e) => setEditMilestoneAward(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingMilestoneIdx(null)}
                              className="px-2.5 py-1 text-[10px] bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-md transition-all cursor-pointer font-sans"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (editMilestoneCondition.trim() && editMilestoneAward.trim()) {
                                  const updated = [...promotionalMilestones];
                                  updated[idx] = {
                                    ...updated[idx],
                                    condition: editMilestoneCondition,
                                    award: editMilestoneAward
                                  };
                                  setPromotionalMilestones(updated);
                                  setEditingMilestoneIdx(null);
                                }
                              }}
                              className="px-2.5 py-1 text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-md transition-all cursor-pointer font-sans"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs gap-3">
                          <div className="font-sans">
                            <strong className="text-stone-850 block">Condition: {m.condition}</strong>
                            <span className="text-emerald-800 font-semibold text-[11px] block mt-1">Reward Perks: {m.award}</span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMilestoneIdx(idx);
                                setEditMilestoneCondition(m.condition || '');
                                setEditMilestoneAward(m.award || '');
                              }}
                              className="p-1.5 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 hover:text-emerald-700 rounded-lg text-stone-400 transition-all cursor-pointer"
                              title="Edit Milestone"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPromotionalMilestones(promotionalMilestones.filter((_, i) => i !== idx))}
                              className="p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 hover:text-rose-600 rounded-lg text-stone-400 transition-all cursor-pointer"
                              title="Delete Milestone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Inline Add */}
                <div className="p-3 bg-stone-50/50 border border-dashed border-stone-200 rounded-xl space-y-2 flex flex-col">
                  <input
                    type="text"
                    id="milestone-condition"
                    placeholder="Milestone Criteria (e.g. Settle 4 Plot bookings)"
                    className="px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none placeholder-stone-400"
                  />
                  <input
                    type="text"
                    id="milestone-reward"
                    placeholder="Reward item (e.g. Laptop bag + Trophy)"
                    className="px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none placeholder-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const condEl = document.getElementById('milestone-condition') as HTMLInputElement;
                      const rewEl = document.getElementById('milestone-reward') as HTMLInputElement;
                      if (condEl && rewEl && condEl.value && rewEl.value) {
                        setPromotionalMilestones([
                          ...promotionalMilestones,
                          {
                            id: `prm-${Date.now()}`,
                            condition: condEl.value,
                            award: rewEl.value
                          }
                        ]);
                        condEl.value = '';
                        rewEl.value = '';
                      }
                    }}
                    className="w-full py-1.5 bg-stone-900 text-white rounded text-[10.5px] font-bold tracking-wider hover:bg-stone-800 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Append Milestone
                  </button>
                </div>
              </div>
            </div>

            {/* C. Special Monthly Offers List Editor */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-stone-200 bg-stone-50/50">
                <h3 className="font-bold text-stone-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Star className="w-4 h-4 text-emerald-800" /> Special Monthly SBR Offers
                </h3>
                <p className="text-[9px] text-stone-500">Limited-time incentives configured in dashboard</p>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="space-y-2">
                  {specialMonthlyOffers.map((o, idx) => (
                    <div key={idx}>
                      {editingOfferIdx === idx ? (
                        <div className="bg-emerald-50/45 border border-emerald-250 rounded-xl p-3 text-xs space-y-2 flex flex-col font-sans">
                          <span className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-wide">Edit Special Offer Config</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5 font-sans">Target Volume (sq yd)</label>
                              <input
                                type="number"
                                value={editOfferVolumeSqYds}
                                onChange={(e) => setEditOfferVolumeSqYds(Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5 font-sans">Required Down Payment %</label>
                              <input
                                type="number"
                                value={editOfferPaymentPercentage}
                                onChange={(e) => setEditOfferPaymentPercentage(Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-mono font-bold"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5 font-sans">Reward Offering</label>
                              <input
                                type="text"
                                value={editOfferPerkName}
                                onChange={(e) => setEditOfferPerkName(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5 font-sans">Start Date</label>
                              <input
                                type="date"
                                value={editOfferStartDate}
                                onChange={(e) => setEditOfferStartDate(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5 font-sans">Expiry Date</label>
                              <input
                                type="date"
                                value={editOfferEndDate}
                                onChange={(e) => setEditOfferEndDate(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingOfferIdx(null)}
                              className="px-2.5 py-1 text-[10px] bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-md transition-all cursor-pointer font-sans"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (editOfferVolumeSqYds > 0 && editOfferPerkName.trim()) {
                                  const updated = [...specialMonthlyOffers];
                                  updated[idx] = {
                                    ...updated[idx],
                                    volumeSqYds: editOfferVolumeSqYds,
                                    paymentPercentage: editOfferPaymentPercentage,
                                    perkName: editOfferPerkName,
                                    startDate: editOfferStartDate || undefined,
                                    endDate: editOfferEndDate || undefined
                                  };
                                  setSpecialMonthlyOffers(updated);
                                  setEditingOfferIdx(null);
                                }
                              }}
                              className="px-2.5 py-1 text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-md transition-all cursor-pointer font-sans"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs gap-3 font-sans">
                          <div className="font-sans space-y-0.5">
                            <strong className="text-stone-855 block text-stone-800">Target Volume: {o.volumeSqYds} SQ YD</strong>
                            <p className="text-[10px] text-stone-550">Required Down Payment receipt: {o.paymentPercentage}%</p>
                            {o.startDate && o.endDate ? (
                              <p className="text-[10px] font-medium text-amber-700 bg-amber-50/50 px-1.5 py-0.5 rounded inline-block">
                                Campaign Phase: {o.startDate} to {o.endDate}
                              </p>
                            ) : (
                              <p className="text-[9.5px] italic text-stone-400">No specified duration limit (Always Active)</p>
                            )}
                            <p className="text-emerald-800 font-bold text-[11px] pt-1">Reward Offering: {o.perkName}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingOfferIdx(idx);
                                setEditOfferVolumeSqYds(o.volumeSqYds || 0);
                                setEditOfferPaymentPercentage(o.paymentPercentage || 0);
                                setEditOfferPerkName(o.perkName || '');
                                setEditOfferStartDate(o.startDate || '');
                                setEditOfferEndDate(o.endDate || '');
                              }}
                              className="p-1.5 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 hover:text-emerald-700 rounded-lg text-stone-400 transition-all cursor-pointer"
                              title="Edit Offer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSpecialMonthlyOffers(specialMonthlyOffers.filter((_, i) => i !== idx))}
                              className="p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 hover:text-rose-600 rounded-lg text-stone-400 transition-all cursor-pointer shrink-0"
                              title="Delete Offer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Inline Add */}
                <div className="p-3 bg-stone-50/50 border border-dashed border-stone-200 rounded-xl space-y-2 flex flex-col font-sans">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      id="offer-volume"
                      placeholder="Volume (sq yd)"
                      className="px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none placeholder-stone-400 font-sans"
                    />
                    <input
                      type="number"
                      id="offer-payment"
                      placeholder="Payment criteria %"
                      className="px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none placeholder-stone-400 font-sans"
                    />
                  </div>
                  <input
                    type="text"
                    id="offer-perk"
                    placeholder="Offer Perk (e.g. Domestic holiday tour)"
                    className="px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none placeholder-stone-400 font-sans"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] font-bold text-stone-500 uppercase block mb-1">Start Date</span>
                      <input
                        type="date"
                        id="offer-start-date"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none font-sans font-medium"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-stone-500 uppercase block mb-1">Expiry Date</span>
                      <input
                        type="date"
                        id="offer-end-date"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none font-sans font-medium"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const volEl = document.getElementById('offer-volume') as HTMLInputElement;
                      const payEl = document.getElementById('offer-payment') as HTMLInputElement;
                      const perkEl = document.getElementById('offer-perk') as HTMLInputElement;
                      const startEl = document.getElementById('offer-start-date') as HTMLInputElement;
                      const endEl = document.getElementById('offer-end-date') as HTMLInputElement;
                      if (volEl && payEl && perkEl && volEl.value && payEl.value && perkEl.value) {
                        setSpecialMonthlyOffers([
                          ...specialMonthlyOffers,
                          {
                            id: `smo-${Date.now()}`,
                            volumeSqYds: Number(volEl.value) || 0,
                            paymentPercentage: Number(payEl.value) || 0,
                            perkName: perkEl.value,
                            startDate: startEl && startEl.value ? startEl.value : undefined,
                            endDate: endEl && endEl.value ? endEl.value : undefined
                          }
                        ]);
                        volEl.value = '';
                        payEl.value = '';
                        perkEl.value = '';
                        if (startEl) startEl.value = '';
                        if (endEl) endEl.value = '';
                      }
                    }}
                    className="w-full py-1.5 bg-stone-900 text-white rounded text-[10.5px] font-bold tracking-wider hover:bg-stone-800 transition-all flex items-center justify-center gap-1 cursor-pointer font-sans"
                  >
                    <Plus className="w-3.5 h-3.5" /> Append Special Offer
                  </button>
                </div>
              </div>
            </div>

            {/* D. Terms and Conditions List Editor */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden font-sans">
              <div className="p-4 border-b border-stone-200 bg-stone-50/50 font-sans">
                <h3 className="font-bold text-stone-900 flex items-center gap-2 text-xs uppercase tracking-wide">
                  <ShieldAlert className="w-4 h-4 text-emerald-800" /> SBR Operations Terms & Conditions
                </h3>
                <p className="text-[9px] text-stone-500 font-sans">Global compliance clauses shown to all partners</p>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="space-y-2">
                  {termsAndConditions.map((term, idx) => (
                    <div key={idx}>
                      {editingTermIdx === idx ? (
                        <div className="bg-emerald-50/45 border border-emerald-250 rounded-xl p-3 text-xs space-y-2 flex flex-col font-sans">
                          <span className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-wide">Edit Compliance Rule</span>
                          <textarea
                            value={editTermText}
                            onChange={(e) => setEditTermText(e.target.value)}
                            rows={3}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                          />
                          <div className="flex justify-end gap-1.5 pt-1 font-sans">
                            <button
                              type="button"
                              onClick={() => setEditingTermIdx(null)}
                              className="px-2.5 py-1 text-[10px] bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-md transition-all cursor-pointer font-sans"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (editTermText.trim()) {
                                  const updated = [...termsAndConditions];
                                  updated[idx] = editTermText;
                                  setTermsAndConditions(updated);
                                  setEditingTermIdx(null);
                                }
                              }}
                              className="px-2.5 py-1 text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-md transition-all cursor-pointer font-sans"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs gap-3">
                          <p className="text-stone-700 leading-relaxed text-[11px] font-sans flex-grow">
                            <span className="font-bold font-mono text-[10px] text-emerald-800 mr-1">#{idx + 1}</span>
                            {term}
                          </p>
                          <div className="flex gap-1 shrink-0 font-sans">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTermIdx(idx);
                                setEditTermText(term || '');
                              }}
                              className="p-1.5 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 hover:text-emerald-700 rounded-lg text-stone-400 transition-all cursor-pointer font-sans"
                              title="Edit Compliance Rule"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTermsAndConditions(termsAndConditions.filter((_, i) => i !== idx))}
                              className="p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 hover:text-rose-600 rounded-lg text-stone-400 transition-all cursor-pointer shrink-0 font-sans"
                              title="Delete Compliance Rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Inline Add */}
                <div className="p-3 bg-stone-50/50 border border-dashed border-stone-200 rounded-xl space-y-2 flex flex-col font-sans">
                  <textarea
                    id="new-term"
                    placeholder="Type global compliance term or SBR regulatory clause..."
                    rows={2}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs outline-none font-sans placeholder-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const termEl = document.getElementById('new-term') as HTMLTextAreaElement;
                      if (termEl && termEl.value) {
                        setTermsAndConditions([...termsAndConditions, termEl.value]);
                        termEl.value = '';
                      }
                    }}
                    className="w-full py-1.5 bg-stone-900 text-white rounded text-[10.5px] font-bold tracking-wider hover:bg-stone-800 transition-all flex items-center justify-center gap-1 cursor-pointer font-sans"
                  >
                    <Plus className="w-3.5 h-3.5" /> Append Compliance Rule
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. ONBOARD SPONSORS WITH DETAILED INFO */}
      {activeSubTab === 'AGENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          <div className="lg:col-span-12 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-200 bg-stone-50/50">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 text-sm uppercase tracking-wide">
                <PlusCircle className="w-5 h-5 text-emerald-800" /> Register Strategic Sponsoring Partner (SBR Series)
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Aadhaar card details, PAN card, and date of birth are standard regulatory mandatory fields to certify a sourcing partner under SBR CRM compensation guidelines.
              </p>
            </div>

            <form onSubmit={handleOnboardAgent} className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="space-y-4 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <h4 className="text-stone-700 font-bold text-xs uppercase tracking-wider col-span-1 md:col-span-2 border-b border-stone-150 pb-1">Primary Broker Credentials</h4>
                <div>
                  <label className="text-[10px] font-bold text-stone-550 uppercase tracking-widest block mb-1">Full Representative Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Satpute"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-550 uppercase tracking-widest block mb-1">Email ID</label>
                  <input
                    type="email"
                    required
                    placeholder="anand@sbrpartners.in"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-555 uppercase tracking-widest block mb-1">Mobile Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 11022"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-555 uppercase tracking-widest block mb-1">Direct Recruiter / Sponsor</label>
                  <select
                    value={newSponsor}
                    onChange={(e) => setNewSponsor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-850 cursor-pointer focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  >
                    <option value="">No Direct Sponsor (Independent Director)</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.id}) - {u.designation || 'Associate'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-stone-555 uppercase tracking-widest block mb-1">Representative Profile Photo Link</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newPhoto}
                    onChange={(e) => setNewPhoto(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                  />
                </div>
              </div>

              {/* SECURE IDENTITY INFORMATION SEC (PII) */}
              <div className="space-y-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <h4 className="text-stone-800 font-bold text-xs uppercase tracking-wider border-b border-stone-200 pb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-800" /> Identity verification (PII)
                </h4>

                <div>
                  <label className="text-[10px] font-bold text-stone-550 uppercase tracking-widest block mb-1">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    required
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white text-stone-800 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-550 uppercase tracking-widest block mb-1">Aadhaar Card (12-Digit)</label>
                  <input
                    type="text"
                    required
                    placeholder="xxxx-xxxx-xxxx"
                    value={newAadhar}
                    onChange={(e) => setNewAadhar(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-550 uppercase tracking-widest block mb-1">PAN Card Number (10 Alphanumeric)</label>
                  <input
                    type="text"
                    required
                    placeholder="ABCDE1234F"
                    value={newPan}
                    onChange={(e) => setNewPan(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 outline-none uppercase font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-550 uppercase tracking-widest block mb-1">Residential Address</label>
                  <textarea
                    rows={2}
                    placeholder="Flat 202, Heights Tower, Hyderabad 500032"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white text-stone-850 outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="text-[10px] font-bold text-teal-400 uppercase block mb-1 font-mono tracking-widest">Initial Career Designation (Team Level)</label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-1">
                  {(['Associate', 'Manager', 'Sr. Manager', 'AGM', 'GM', 'Sr. GM'] as User['designation'][]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setNewDesignation(d)}
                      className={`px-3 py-2 text-xs rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                        newDesignation === d
                          ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold shadow-sm'
                          : 'border-white/10 bg-white/2 hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <span>{d}</span>
                      {newDesignation === d && <Award className="w-3.5 h-3.5 text-teal-400 fill-teal-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {createUserSuccess && (
                <div className="md:col-span-3 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">Sponsor Onboarded Successfully</h5>
                    <p className="mt-0.5 text-slate-300 font-mono text-[11px]">{createUserSuccess}</p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="md:col-span-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="md:col-span-3 pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs uppercase tracking-wider font-sans"
                >
                  Confirm Sourcing Credential Allocation
                </button>
              </div>
            </form>

            <div className="p-4 border-b border-t border-stone-200 bg-stone-50/50 flex items-center justify-between flex-col md:flex-row gap-4">
              <div>
                <h4 className="font-bold text-stone-900 text-xs uppercase font-sans">Live Sourcing Team Directory</h4>
                <p className="text-[10px] text-stone-500">Suspend sub-broker network portals instantly during audits.</p>
              </div>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search sub-brokers..."
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-full text-xs rounded-lg border border-stone-200 bg-white text-stone-900 outline-none"
                />
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-400" />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                    <th className="px-5 py-3 font-sans">Representative Partner</th>
                    <th className="px-5 py-3">SBR ID</th>
                    <th className="px-5 py-3 font-sans">Sub-Sponsor</th>
                    <th className="px-5 py-3">Aadhaar (PII)</th>
                    <th className="px-5 py-3">PAN card</th>
                    <th className="px-5 py-3 font-sans">Sales Volume</th>
                    <th className="px-5 py-3 text-right font-sans">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 text-stone-850">
                  {filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-stone-50/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={agent.photo} 
                            alt={agent.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full border border-stone-200 object-cover"
                          />
                          <div className="font-sans">
                            <p className="font-bold text-stone-900 text-xs">{agent.name}</p>
                            <p className="text-[9.5px] text-stone-500 mt-0.5">{agent.email} • {agent.phone}</p>
                            <div className="flex gap-1.5 mt-1">
                              <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-850 border border-stone-200">{agent.designation || 'Associate'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono font-bold text-emerald-800">{agent.id}</td>
                      <td className="px-5 py-3">
                        {agent.sponsorId ? (
                          <span className="bg-stone-100 text-stone-700 text-[10px] px-1.5 py-0.5 rounded border border-stone-200 font-mono">
                            Spon: {agent.sponsorId}
                          </span>
                        ) : (
                          <span className="text-[9px] text-amber-800 bg-amber-50 px-1.5 py-0.2 border border-amber-200 rounded">
                            Independent Director
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-stone-600 font-mono">{agent.aadhar || 'xxxx-xxxx-xxxx'}</td>
                      <td className="px-5 py-3 text-stone-600 uppercase font-mono">{agent.pan || 'XXXXXXXXXX'}</td>
                      <td className="px-5 py-3">
                        <p className="font-bold text-stone-905 text-xs font-mono">{formatPoints(agent.totalDirectSales)}</p>
                        <p className="text-[9px] text-stone-500 mt-0.5 font-sans">Downline: {formatPoints(agent.totalDownlineSales)}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              const inviteText = `*SBR Operations Portal Invite* 💼\n\n` +
                                `Hello *${agent.name}*,\n` +
                                `Your account has been onboarded to SBR CRM successfully!\n\n` +
                                `🔗 *SBR Portal Link:* ${window.location.origin}\n` +
                                `🆔 *Associate Sponsor ID:* ${agent.id}\n` +
                                `🔑 *Default Passcode:* password\n\n` +
                                `Please log in using your Sponsor ID and password to manage sales, track downline networks, and view payouts.`;
                              navigator.clipboard.writeText(inviteText);
                              setCopiedUserId(agent.id);
                              setTimeout(() => setCopiedUserId(null), 2000);
                            }}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded border transition-all cursor-pointer flex items-center gap-1 ${
                              copiedUserId === agent.id
                                ? 'bg-emerald-800 border-emerald-800 text-white'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                            title="Copy Invitation Message"
                          >
                            <Share2 className="w-2.5 h-2.5" />
                            <span>{copiedUserId === agent.id ? 'Copied ✓' : 'Invite'}</span>
                          </button>

                          <button
                            onClick={() => onToggleUserStatus(agent.id)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer ${
                              agent.status === 'ACTIVE'
                                ? 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100'
                                : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                            }`}
                          >
                            {agent.status === 'ACTIVE' ? 'Suspend' : 'Authorize'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}      {/* 3. SBR PROJECTS SETUP & METADATA */}
      {activeSubTab === 'PROJECTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden h-fit">
            <div className="p-5 border-b border-stone-200 bg-stone-50/50">
              <h3 className="font-bold text-stone-90 restored-text-color flex items-center gap-2 text-sm uppercase tracking-wide">
                <Home className="w-5 h-5 text-emerald-800" /> Upload SBR Real Estate Project
              </h3>
              <p className="text-xs text-stone-500 mt-1">Add Name, Location, Starting Prices, and customize villa/plot dimensions.</p>
            </div>

            <form onSubmit={handleAddNewProject} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SBR CRM Meadows"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Site Location / Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gachibowli Phase-II, Hyderabad, India"
                  value={projLocation}
                  onChange={(e) => setProjLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Starting Price per Sq Yd</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="e.g. 15000"
                      value={projStartingPrice}
                      onChange={(e) => setProjStartingPrice(Number(e.target.value) || 0)}
                      className="w-full pr-12 pl-3 py-2 text-xs font-mono font-bold rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                    <span className="absolute right-2.5 top-2 py-0.5 px-1 bg-stone-100 border border-stone-200 text-stone-500 rounded text-[9px]">/Sq Yd</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Blueprint Map URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/...map"
                    value={projMapUrl}
                    onChange={(e) => setProjMapUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Size Slabs Input list */}
              <div className="space-y-3.5 border-t border-stone-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">Plot/Villa Size Tiers</span>
                  <button
                    type="button"
                    onClick={addSizeTierRow}
                    className="text-[9.5px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                  >
                    + Add Size Category
                  </button>
                </div>

                <div className="space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                  {sizeTiersInput.map((tier, idx) => (
                    <div key={idx} className="bg-stone-50 p-2.5 border border-stone-200 rounded-lg space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => removeSizeTierRow(idx)}
                        className="absolute top-1.5 right-2 text-stone-400 hover:text-rose-600 text-[10px] cursor-pointer"
                        title="Delete category tier"
                      >
                        Delete
                      </button>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Size/Area</label>
                          <input
                            type="text"
                            value={tier.size}
                            onChange={(e) => handleSizeTierChange(idx, 'size', e.target.value)}
                            className="w-full px-2 py-1 text-[10.5px] font-bold rounded border border-stone-200 bg-white text-stone-900 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Units (comma separated)</label>
                          <input
                            type="text"
                            value={tier.unitsRaw}
                            onChange={(e) => handleSizeTierChange(idx, 'unitsRaw', e.target.value)}
                            placeholder="Unit A-11, Unit A-12, Unit A-13"
                            className="w-full px-2 py-1 text-[10.5px] rounded border border-stone-200 bg-white text-stone-900 focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {projSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold">
                  {projSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs uppercase tracking-wide"
              >
                Launch SBR Project Metadata
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wide">Live SBR Site Layout Catalogs</h3>
              <p className="text-xs text-stone-500 mt-1">Preview of active building projects, launching maps, and unit capacity calculations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => {
                const totalUnits = proj.inventory.reduce((acc, cat) => acc + cat.units.length, 0);
                const holdUnits = proj.inventory.reduce(
                  (acc, cat) => acc + cat.units.filter(u => u.status === 'HOLD').length, 0
                );
                const bookedUnits = proj.inventory.reduce(
                  (acc, cat) => acc + cat.units.filter(u => u.status === 'BOOKED').length, 0
                );
                const availableUnits = totalUnits - holdUnits - bookedUnits;

                return (
                  <div key={proj.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col justify-between shadow-xs">
                    <img 
                      src={proj.imageMapUrl || 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&q=80&w=350'} 
                      alt={proj.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-cover bg-stone-100 border-b border-stone-200"
                    />
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono bg-emerald-55 border border-emerald-250 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            {proj.id}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono font-semibold">{formatINR(proj.sqYardStartingPrice)} / Sq Yard</span>
                        </div>
                        <h4 className="font-bold text-stone-900 text-xs mt-1">{proj.name}</h4>
                        <p className="text-[10px] text-stone-500">{proj.location}</p>
                      </div>

                      <div className="grid grid-cols-4 gap-1 text-center border-t border-stone-150 pt-3">
                        <div className="bg-stone-50 p-1.5 rounded">
                          <p className="text-[11.5px] font-mono font-bold text-stone-800">{totalUnits}</p>
                          <p className="text-[8.5px] text-stone-500 uppercase mt-0.5">Total</p>
                        </div>
                        <div className="bg-emerald-50 p-1.5 rounded border border-emerald-200">
                          <p className="text-[11.5px] font-mono font-bold text-emerald-800">{availableUnits}</p>
                          <p className="text-[8.5px] text-emerald-600 uppercase mt-0.5">Avail</p>
                        </div>
                        <div className="bg-amber-50 p-1.5 rounded border border-amber-200">
                          <p className="text-[11.5px] font-mono font-bold text-amber-800">{holdUnits}</p>
                          <p className="text-[8.5px] text-amber-600 uppercase mt-0.5">Hold</p>
                        </div>
                        <div className="bg-rose-50 p-1.5 rounded border border-rose-200">
                          <p className="text-[11.5px] font-mono font-bold text-rose-800">{bookedUnits}</p>
                          <p className="text-[8.5px] text-rose-600 uppercase mt-0.5">Book</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. BOOK PLOT/VILLA INVENTORY */}
      {activeSubTab === 'BOOKINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden h-fit">
            <div className="p-5 border-b border-stone-200 bg-stone-50/50">
              <h3 className="font-bold text-stone-90 restored-text-color flex items-center gap-2 text-sm uppercase tracking-wide">
                <Layers className="w-5 h-5 text-emerald-800" /> Book Inventory & Allocate Overrides
              </h3>
              <p className="text-xs text-stone-500 mt-1">Admin registers a sales agreement. Compiles exact overrides and pays down lines instantly.</p>
            </div>

            <form onSubmit={handleBookInventorySubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">1. Select SBR Project</label>
                  <select
                    required
                    value={bookProjId}
                    onChange={(e) => {
                      setBookProjId(e.target.value);
                      setBookSizeCategory('');
                      setBookUnitNumber('');
                      setSelectedUnits([]);
                    }}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">2. Plot Size</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomSize(!isCustomSize);
                        setBookSizeCategory('');
                        setSelectedUnits([]);
                      }}
                      className="text-[9px] text-emerald-800 font-bold hover:underline cursor-pointer"
                    >
                      {isCustomSize ? 'Select Preset Size' : 'Enter Custom Size'}
                    </button>
                  </div>
                  {isCustomSize ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. 180 Sq Yards"
                      value={bookSizeCategory}
                      onChange={(e) => {
                        setBookSizeCategory(e.target.value);
                        setSelectedUnits([]);
                      }}
                      className="w-full px-2.5 py-1.8 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  ) : (
                    <select
                      required
                      disabled={!bookProjId}
                      value={bookSizeCategory}
                      onChange={(e) => {
                        setBookSizeCategory(e.target.value);
                        setSelectedUnits([]);
                      }}
                      className="w-full px-2 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    >
                      <option value="">-- Choose Size --</option>
                      {selectedProjObject?.inventory.map((inv, idx) => (
                        <option key={idx} value={inv.size}>{inv.size}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                    3. Select available unit(s) (Multi-select)
                  </label>
                  {unitsToBook.length === 0 ? (
                    <div className="text-xs text-stone-400 italic p-3 bg-stone-50 rounded-lg border border-stone-150">
                      {bookProjId ? "No available units found for the selected size." : "Select a project first."}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 bg-stone-550/5 border border-stone-200 rounded-lg">
                      {unitsToBook.map((u) => {
                        const isSelected = selectedUnits.includes(u.unitNumber);
                        return (
                          <button
                            key={u.unitNumber}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedUnits(selectedUnits.filter(x => x !== u.unitNumber));
                              } else {
                                setSelectedUnits([...selectedUnits, u.unitNumber]);
                              }
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                                : 'bg-white text-stone-750 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {u.unitNumber}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {selectedUnits.length > 0 && (
                    <div className="text-[10.5px] text-stone-600 font-sans mt-1.5">
                      Selected ({selectedUnits.length}): <strong className="text-emerald-850">{selectedUnits.join(', ')}</strong>
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                    4. Commission Recipient (Channel Partner)
                  </label>
                  <select
                    required
                    value={bookAgentId}
                    onChange={(e) => setBookAgentId(e.target.value)}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none font-sans font-bold cursor-pointer"
                  >
                    <option value="">-- Choose Representative --</option>
                    {users.filter(u => u.status === 'ACTIVE').map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.id}) • {u.designation || 'Associate'}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Buyer / Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mrs. Sarita Reddy"
                  value={bookBuyerName}
                  onChange={(e) => setBookBuyerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* ADMIN-ONLY BOOKING CONFIGURATIONS */}
              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl space-y-3.5">
                <div className="flex items-center gap-1.5 border-b border-amber-500/10 pb-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-sans">👑 Admin-Only Booking Parameters</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Rate per Sq Yard (INR)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="e.g. 15000"
                        value={bookRatePerSqYard}
                        onChange={(e) => setBookRatePerSqYard(e.target.value)}
                        className="w-full pr-12 pl-3 py-1.8 text-xs font-mono font-bold rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-stone-500 font-bold font-sans">₹/YD</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Token Booking Amount (INR)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="e.g. 75000"
                        value={bookingFormTokenAmount}
                        onChange={(e) => setBookingFormTokenAmount(e.target.value)}
                        className="w-full pr-12 pl-3 py-1.8 text-xs font-mono font-bold rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-stone-500 font-bold font-sans">₹ (INR)</span>
                    </div>
                  </div>
                </div>
                
                {bookSizeCategory && (
                  <div className="text-[9.5px] text-stone-500 font-medium">
                    Formula: <span className="font-semibold text-stone-700">Plot Size ({parseFloat(bookSizeCategory.replace(/[^\d.]/g, '')) || 0} Sq Yd)</span> × <span className="font-semibold text-stone-700">Units ({selectedUnits.length || 1})</span> × <span className="font-semibold text-stone-700">Rate ({formatINR(parseFloat(bookRatePerSqYard) || 15000)})</span> = <span className="font-bold text-stone-700">{formatINR((parseFloat(bookSizeCategory.replace(/[^\d.]/g, '')) || 0) * (selectedUnits.length || 1) * (parseFloat(bookRatePerSqYard) || 15000))}</span> total sale value. Converting to points: <span className="font-bold text-emerald-800">{bookSaleValue || '0'} PTS</span> (at ₹7,50,000 per Point).
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Actual Sale Value (Points)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 3.0"
                      value={bookSaleValue}
                      onChange={(e) => setBookSaleValue(e.target.value)}
                      className="w-full pr-12 pl-3 py-2 text-xs font-mono font-bold rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-stone-500 font-bold font-sans">PTS</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Bank Clearance Reference #</label>
                  <input
                    type="text"
                    placeholder="e.g. TXN-IND-908123"
                    value={bookRefNumber}
                    onChange={(e) => setBookRefNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Booking Agreement Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-stone-700 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="bookStatus"
                      checked={bookStatus === 'BOOKED'}
                      onChange={() => setBookStatus('BOOKED')}
                    />
                    Locked Booking (BOOKED status)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-stone-700 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="bookStatus"
                      checked={bookStatus === 'HOLD'}
                      onChange={() => setBookStatus('HOLD')}
                    />
                    Temporary Hold allotment (HOLD status)
                  </label>
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-3">
                <label className="text-[10px] font-bold text-stone-550 uppercase block font-sans">Milestone Tracking Status</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingFormStatus('TOKEN_RECEIVED')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      bookingFormStatus === 'TOKEN_RECEIVED'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Token received
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingFormStatus('BOOKING_DONE')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      bookingFormStatus === 'BOOKING_DONE'
                        ? 'bg-blue-105 bg-opacity-80 text-blue-900 border-blue-300 shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Booking Done (30%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingFormStatus('REGISTRY_DONE')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      bookingFormStatus === 'REGISTRY_DONE'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Registry Done (100%)
                  </button>
                </div>

                {bookingFormStatus === 'TOKEN_RECEIVED' && (
                  <div className="pt-2 border-t border-stone-200/60 animate-fade-in">
                    <label className="text-[9.5px] font-bold text-stone-500 uppercase block mb-1">Specify Token Payment Received (Points)</label>
                    <div className="relative max-w-[150px]">
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 0.15"
                        value={bookingFormTokenAmount}
                        onChange={(e) => setBookingFormTokenAmount(e.target.value)}
                        className="w-full pr-12 pl-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                      <span className="absolute right-2.5 top-2 text-[10px] text-stone-500 font-bold">PTS</span>
                    </div>
                  </div>
                )}
              </div>

              {bookingSuccess && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-850 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-800 shrink-0" />
                  {bookingSuccess}
                </div>
              )}

              {bookingError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-250 text-rose-800 text-xs font-semibold">
                  {bookingError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg py-2.8 text-xs font-bold transition-all cursor-pointer shadow uppercase tracking-wider"
              >
                Launch Booking Agreement Clearances & overrides
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wide">Real Estate Inventory Table (Live status)</h3>
            <p className="text-xs text-stone-500">View real-time booking statuses of every SBR project unit categorized by size.</p>

            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
              {projects.map((p) => (
                <div key={p.id} className="border border-stone-200 bg-stone-50/50 rounded-xl p-3.5 space-y-3">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-1.5">
                    <h4 className="font-bold text-stone-900 text-xs">{p.name}</h4>
                    <span className="text-[10px] text-stone-500 font-sans font-bold uppercase">{p.location}</span>
                  </div>

                  {p.inventory.map((inv, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <span className="text-[10.5px] font-bold text-stone-600 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-800" /> Size slab: {inv.size}
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {inv.units.map((u, uIdx) => (
                          <span
                            key={uIdx}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono border flex flex-col items-center select-none ${
                              u.status === 'BOOKED'
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : u.status === 'HOLD'
                                ? 'bg-amber-50 border-amber-200 text-amber-850'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-805'
                            }`}
                          >
                            <span>{u.unitNumber}</span>
                            <span className="text-[8px] opacity-75 mt-0.5 lowercase font-sans">
                              {u.status === 'BOOKED' ? u.buyerName || 'booked' : u.status}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. CORPORATE SALES LEDGER */}
      {activeSubTab === 'SALES' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-stone-200 bg-stone-50/50 flex justify-between items-center flex-col md:flex-row gap-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wide">SBR Corporate Sales Ledger</h3>
              <p className="text-xs text-stone-500 mt-1">Audit and record trail of properties sold. Calculates commission distributions up the sourcing network.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 font-bold text-[10.5px] rounded px-3 py-1.5 text-emerald-800 font-sans">
              Total Booking Value processed: {formatPoints(totalSalesVal)}
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                  <th className="px-5 py-3">Booking ID</th>
                  <th className="px-5 py-3">SBR Layout & Villa #</th>
                  <th className="px-5 py-3">Acquirer Representative</th>
                  <th className="px-5 py-3">Broker Sourced</th>
                  <th className="px-5 py-3">Size dimension</th>
                  <th className="px-5 py-3 font-mono">Agreement Price</th>
                  <th className="px-5 py-3">Payment Health (INR)</th>
                  <th className="px-5 py-3">Allotment State</th>
                  <th className="px-5 py-3">Milestone Booking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150 text-stone-800">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-stone-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold font-mono text-stone-900">{sale.id}</td>
                    <td className="px-5 py-3.5 font-sans">
                      <p className="font-bold text-stone-900 text-xs">{sale.project}</p>
                      <p className="text-[10px] text-emerald-800 mt-0.5 font-semibold">{sale.unitNumber}</p>
                    </td>
                    <td className="px-5 py-3.5 text-stone-700 font-bold">{sale.buyerName}</td>
                    <td className="px-5 py-3.5 font-sans">
                      <p className="font-bold text-stone-900">{sale.agentName}</p>
                      <p className="text-[9.5px] text-stone-500 mt-0.5 font-mono">{sale.agentId}</p>
                    </td>
                    <td className="px-5 py-3.5 text-stone-600 font-mono">{sale.sizeSqYards} SQ YD</td>
                    <td className="px-5 py-3.5 font-bold text-stone-900 text-xs font-mono">{formatPoints(sale.saleValue)}</td>
                    <td className="px-5 py-3.5">
                      {renderPaymentProgress(sale)}
                      <button
                        onClick={() => {
                          setSelectedPaymentSaleId(sale.id);
                          setPaymentFormId(null);
                          setPaymentFormAmount('');
                          setPaymentFormDate(new Date().toISOString().split('T')[0]);
                          setPaymentFormMode('BANK_TRANSFER');
                          setPaymentFormReference('');
                          setPaymentFormNotes('');
                        }}
                        className="mt-1.5 flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer transition-all w-full justify-center shadow-2xs"
                      >
                        💳 Manage Payments ({getSalePayments(sale).length})
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] uppercase rounded px-1.5 py-0.5 border ${
                        sale.status === 'HOLD'
                          ? 'bg-amber-50 text-amber-800 border-amber-205 py-0.5'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-205 py-0.5'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${sale.status === 'HOLD' ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                        {sale.status === 'HOLD' ? 'HOLD' : 'CONFIRMED'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1.5 max-w-[170px]">
                        <select
                          value={sale.bookingStatus || 'TOKEN_RECEIVED'}
                          onChange={(e) => {
                            if (onUpdateSaleBookingStatus) {
                              const newStatus = e.target.value as 'TOKEN_RECEIVED' | 'BOOKING_DONE' | 'REGISTRY_DONE';
                              const currentAmt = sale.tokenAmount !== undefined ? sale.tokenAmount : 75000;
                              onUpdateSaleBookingStatus(sale.id, newStatus, currentAmt);
                            }
                          }}
                          className={`text-[11px] font-bold px-2 py-1 rounded border focus:outline-none cursor-pointer ${
                            sale.bookingStatus === 'REGISTRY_DONE'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : sale.bookingStatus === 'BOOKING_DONE'
                              ? 'bg-blue-50 text-blue-900 border-blue-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}
                        >
                          <option value="TOKEN_RECEIVED">Token Received</option>
                          <option value="BOOKING_DONE">Booking Done (30% paid)</option>
                          <option value="REGISTRY_DONE">Registry Done (100% paid)</option>
                        </select>

                        {(sale.bookingStatus || 'TOKEN_RECEIVED') === 'TOKEN_RECEIVED' ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-stone-500 whitespace-nowrap">Token Amt:</span>
                            <input
                              type="number"
                              step="any"
                              value={sale.tokenAmount !== undefined ? sale.tokenAmount : 75000}
                              onChange={(e) => {
                                if (onUpdateSaleBookingStatus && e.target.value !== '') {
                                  onUpdateSaleBookingStatus(
                                    sale.id,
                                    'TOKEN_RECEIVED',
                                    parseFloat(e.target.value)
                                  );
                                }
                              }}
                              className="w-20 px-1 py-0.5 text-[10px] font-mono font-bold bg-white border border-stone-250 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
                              title="Edit token amount in INR"
                            />
                            <span className="text-[9px] text-stone-500 font-bold font-sans">INR</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-500 italic px-0.5">
                            {sale.bookingStatus === 'REGISTRY_DONE' ? '100% fully paid' : '30% paid done'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. OPERATIONS & PAYOUTS AUDITING */}
      {activeSubTab === 'PAYOUTS' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <span className="text-[10px] font-bold text-stone-550 uppercase tracking-wider block">Unprocessed Queue (Pending Approval)</span>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-amber-700 mt-1">
                {formatPoints(payouts.filter(p => p.status === 'PENDING').reduce((acc, p) => acc + p.netCommission, 0))}
              </h3>
              <p className="text-[9.5px] text-stone-500 mt-2">
                {payouts.filter(p => p.status === 'PENDING').length} commission transactions awaiting sanctioning
              </p>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <span className="text-[10px] font-bold text-stone-550 uppercase tracking-wider block">Approved & Sanctioned (Awaiting bank release)</span>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-amber-900 mt-1">
                {formatPoints(payouts.filter(p => p.status === 'APPROVED').reduce((acc, p) => acc + p.netCommission, 0))}
              </h3>
              <p className="text-[9.5px] text-stone-500 mt-2">
                {payouts.filter(p => p.status === 'APPROVED').length} commission vouchers sanctioned for RTGS/NEFT
              </p>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <span className="text-[10px] font-bold text-stone-550 uppercase tracking-wider block">Disbursed net bank transfers</span>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-emerald-800 mt-1">
                {formatPoints(payouts.filter(p => p.status === 'DISBURSED').reduce((acc, p) => acc + p.netCommission, 0))}
              </h3>
              <p className="text-[9.5px] text-stone-500 mt-2">
                {payouts.filter(p => p.status === 'DISBURSED').length} transactions cleared & marked paid
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-200 bg-stone-50/50 flex justify-between items-center flex-col md:flex-row gap-4">
              <div>
                <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wide">SBR Operations Audit & Commission Desk</h3>
                <p className="text-xs text-stone-500 mt-1">Track computed override lines, hold payouts for compliance, or dispatch verified bank disbursements.</p>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                    <th className="px-5 py-3">Payout ID</th>
                    <th className="px-5 py-3">Beneficiary Sponsor</th>
                    <th className="px-5 py-3 font-mono">Gross Calculated</th>
                    <th className="px-5 py-3 font-mono">TDS Withheld (194H)</th>
                    <th className="px-5 py-3 font-mono">Admin Retained</th>
                    <th className="px-5 py-3 font-mono">Net Release</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Auditing Clearances</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 text-stone-800">
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-stone-400 font-medium font-sans">
                        No commission disbursements recorded yet. Create a plot booking first.
                      </td>
                    </tr>
                  ) : (
                    payouts.map((pay) => (
                      <tr key={pay.id} className="hover:bg-stone-50/30 transition-colors">
                        <td className="px-5 py-3.5 font-bold font-mono text-stone-900">{pay.id}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-stone-900">{pay.agentName}</p>
                          <p className="text-[9.5px] text-stone-500 mt-0.5 font-mono">{pay.agentId}</p>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-stone-600 font-bold">{formatPoints(pay.grossCommission)}</td>
                        <td className="px-5 py-3.5 font-mono text-rose-600">-{formatPoints(pay.tdsDeduction)}</td>
                        <td className="px-5 py-3.5 font-mono text-stone-500">-{formatPoints(pay.adminFee)}</td>
                        <td className="px-5 py-3.5 font-bold text-stone-900 font-mono text-emerald-800">{formatPoints(pay.netCommission)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-[9.5px] font-bold uppercase rounded px-2 py-0.5 border ${
                            pay.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : pay.status === 'APPROVED'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-205'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${
                              pay.status === 'PENDING' ? 'bg-amber-600' : pay.status === 'APPROVED' ? 'bg-blue-600' : 'bg-emerald-600'
                            }`} />
                            {pay.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-sans">
                          {pay.status === 'PENDING' && (
                            <button
                              onClick={() => onApprovePayout(pay.id)}
                              className="px-2.5 py-1 text-[10.5px] font-bold rounded bg-emerald-850 hover:bg-emerald-900 text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Sanction Payout
                            </button>
                          )}
                          {pay.status === 'APPROVED' && (
                            <button
                              onClick={() => onDisbursePayout(pay.id)}
                              className="px-2.5 py-1 text-[10.5px] font-bold rounded bg-emerald-850 hover:bg-emerald-900 text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-1 animate-pulse"
                            >
                              <DollarSign className="w-3.5 h-3.5" /> Confirm Bank Dispatch
                            </button>
                          )}
                          {pay.status === 'DISBURSED' && (
                            <span className="text-[10px] text-emerald-700 font-bold block leading-relaxed font-sans">
                              Cleared RTGS transfer
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. REPORTS, LEDGERS & ANALYTICS PORTAL */}
      {activeSubTab === 'REPORTS' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Controls */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wide">SBR Business Ledger & Monthly Reports</h3>
              <p className="text-xs text-stone-500 mt-1">Generate multi-dimensional monthly ledgers, compute tax withholdings, and export data audits.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const headers = ["Booking ID", "Date", "Project", "Unit Number", "Sourcing Agent", "Agent ID", "Size (Sq Yd)", "Agreement Value (PTS)", "Booking Status"];
                  const rows = sales.map(s => [
                    s.id,
                    s.saleDate,
                    s.project,
                    s.unitNumber,
                    s.agentName,
                    s.agentId,
                    s.sizeSqYards,
                    s.saleValue.toString(),
                    s.bookingStatus || 'TOKEN_RECEIVED'
                  ]);
                  exportToCSV("SBR_Corporate_Sales_Ledger.csv", headers, rows);
                }}
                className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" /> Export Sales
              </button>

              <button
                onClick={() => {
                  const headers = ["Sponsor ID", "Name", "Email", "Phone", "Designation", "Sponsor ID", "Joined Date", "Status", "Direct Sales (PTS)", "Downline Sales (PTS)"];
                  const rows = users.map(u => [
                    u.id,
                    u.name,
                    u.email,
                    u.phone,
                    u.designation,
                    u.sponsorId || 'N/A',
                    u.joinedDate,
                    u.status,
                    u.totalDirectSales.toString(),
                    u.totalDownlineSales.toString()
                  ]);
                  exportToCSV("SBR_Sponsor_Directory.csv", headers, rows);
                }}
                className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" /> Export Agents
              </button>

              <button
                onClick={() => {
                  const headers = ["Payout ID", "Sale ID", "Project", "Unit", "Agent Name", "Agent ID", "Level", "Percentage (%)", "Gross Commission (PTS)", "TDS (PTS)", "Admin Fee (PTS)", "Net Commission (PTS)", "Status", "Disbursement Date"];
                  const rows = payouts.map(p => [
                    p.id,
                    p.saleId,
                    p.project,
                    p.unitNumber,
                    p.agentName,
                    p.agentId,
                    p.level.toString(),
                    p.percentage.toString(),
                    p.grossCommission.toString(),
                    p.tdsDeduction.toString(),
                    p.adminFee.toString(),
                    p.netCommission.toString(),
                    p.status,
                    p.payoutDate
                  ]);
                  exportToCSV("SBR_Commission_Payout_Register.csv", headers, rows);
                }}
                className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" /> Export Payouts
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print Ledger Page
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 font-sans">Filter by Month</label>
              <select
                value={selectedReportMonth}
                onChange={(e) => setSelectedReportMonth(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-1.5 text-xs font-sans font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
              >
                <option value="ALL">All Months (Cumulative)</option>
                {Array.from(new Set(sales.map(s => s.saleDate.substring(0, 7))))
                  .sort()
                  .reverse()
                  .map(m => {
                    const [year, month] = m.split('-');
                    const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
                    const monthName = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
                    return <option key={m} value={m}>{monthName}</option>;
                  })}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 font-sans">Filter by SBR Project</label>
              <select
                value={selectedReportProject}
                onChange={(e) => setSelectedReportProject(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-1.5 text-xs font-sans font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
              >
                <option value="ALL">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 font-sans">Search Buyer, Agent, or ID</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ledger entries..."
                  value={reportSearchQuery}
                  onChange={(e) => setReportSearchQuery(e.target.value)}
                  className="w-full bg-white border border-stone-250 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Aggregated metrics based on filters */}
          {(() => {
            const filteredSales = sales.filter(sale => {
              const monthMatch = selectedReportMonth === 'ALL' || sale.saleDate.startsWith(selectedReportMonth);
              const projectMatch = selectedReportProject === 'ALL' || sale.projectId === selectedReportProject;
              const searchMatch = !reportSearchQuery || 
                sale.buyerName.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                sale.agentName.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                sale.id.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                sale.unitNumber.toLowerCase().includes(reportSearchQuery.toLowerCase());
              return monthMatch && projectMatch && searchMatch;
            });

            const relatedPayouts = payouts.filter(p => filteredSales.some(s => s.id === p.saleId));
            const totalSourcedVal = filteredSales.reduce((acc, curr) => acc + curr.saleValue, 0);
            const totalVolSqYds = filteredSales.reduce((acc, curr) => acc + (parseFloat(curr.sizeSqYards) || 0), 0);
            const grossComms = relatedPayouts.reduce((acc, curr) => acc + curr.grossCommission, 0);
            const tdsDeducted = relatedPayouts.reduce((acc, curr) => acc + curr.tdsDeduction, 0);
            const adminFees = relatedPayouts.reduce((acc, curr) => acc + curr.adminFee, 0);
            const netPayouts = relatedPayouts.reduce((acc, curr) => acc + curr.netCommission, 0);

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
                  <div className="bg-white border border-stone-200 rounded-2xl p-4.5 shadow-2xs">
                    <p className="text-[9.5px] font-bold text-stone-500 uppercase tracking-widest font-sans">Filtered Transactions</p>
                    <p className="text-xl font-extrabold text-stone-900 mt-1.5 font-mono">{filteredSales.length} Sourced</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-stone-500">
                      <span className="font-bold text-stone-800 font-mono">{totalVolSqYds.toLocaleString()}</span> Total Sq Yards Sold
                    </div>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-2xl p-4.5 shadow-2xs">
                    <p className="text-[9.5px] font-bold text-stone-500 uppercase tracking-widest font-sans">Agreement Sourced Value</p>
                    <p className="text-xl font-extrabold text-emerald-800 mt-1.5 font-mono">{formatPoints(totalSourcedVal)}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-stone-500">
                      Average deal size: <span className="font-semibold text-stone-800 font-mono">{filteredSales.length ? formatPoints(totalSourcedVal / filteredSales.length) : '0 PTS'}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-2xl p-4.5 shadow-2xs">
                    <p className="text-[9.5px] font-bold text-stone-500 uppercase tracking-widest font-sans">Distributed Commission (Gross)</p>
                    <p className="text-xl font-extrabold text-stone-900 mt-1.5 font-mono">{formatPoints(grossComms)}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-stone-500">
                      Effective payout index: <span className="font-semibold text-stone-800 font-mono">{totalSourcedVal ? ((grossComms / totalSourcedVal) * 100).toFixed(1) : '0'}%</span>
                    </div>
                  </div>

                  <div className="bg-white border border-emerald-200 bg-emerald-50/15 rounded-2xl p-4.5 shadow-2xs">
                    <p className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-widest font-sans">Net Disbursed / Scheduled</p>
                    <p className="text-xl font-extrabold text-emerald-900 mt-1.5 font-mono">{formatPoints(netPayouts)}</p>
                    <div className="flex items-center justify-between mt-2 text-[9px] text-stone-500 font-sans font-semibold">
                      <span>TDS Deducted: {formatPoints(tdsDeducted)}</span>
                      <span>Admin Withheld: {formatPoints(adminFees)}</span>
                    </div>
                  </div>
                </div>

                {/* SBR Corporate Sales Ledger details */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex justify-between items-center">
                    <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Itemized Sales Ledger</h4>
                    <span className="text-[10px] font-bold text-stone-500 font-mono">Showing {filteredSales.length} of {sales.length} records</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-[9.5px] uppercase font-bold text-stone-500 tracking-wider">
                          <th className="px-4 py-2.5">Date</th>
                          <th className="px-4 py-2.5">Booking ID</th>
                          <th className="px-4 py-2.5">Layout / Project</th>
                          <th className="px-4 py-2.5">Sourcing Agent</th>
                          <th className="px-4 py-2.5">Buyer Client</th>
                          <th className="px-4 py-2.5 text-right font-mono">Size (Sq Yd)</th>
                          <th className="px-4 py-2.5 text-right font-mono text-stone-500">Rate / SqYd</th>
                          <th className="px-4 py-2.5 text-center font-mono">Payment Progress (INR)</th>
                          <th className="px-4 py-2.5 text-right font-mono">Sale Value</th>
                          <th className="px-4 py-2.5 text-right font-mono">Net Payouts</th>
                          <th className="px-4 py-2.5 text-center">Status</th>
                          <th className="px-4 py-2.5 text-center">Commission Breakdown</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-150 text-stone-800">
                        {filteredSales.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="px-4 py-8 text-center text-stone-400 italic font-medium">No sales transactions match the filtered criteria.</td>
                          </tr>
                        ) : (
                          filteredSales.map((sale) => {
                            const salePayouts = payouts.filter(p => p.saleId === sale.id);
                            const saleNet = salePayouts.reduce((acc, curr) => acc + curr.netCommission, 0);
                            return (
                              <tr key={sale.id} className="hover:bg-stone-50/30 transition-colors">
                                <td className="px-4 py-3 text-stone-500 whitespace-nowrap font-mono">{sale.saleDate}</td>
                                <td className="px-4 py-3 font-bold font-mono text-stone-900">{sale.id}</td>
                                <td className="px-4 py-3">
                                  <p className="font-bold text-stone-900">{sale.project}</p>
                                  <p className="text-[10px] text-stone-500 font-semibold">{sale.unitNumber}</p>
                                </td>
                                <td className="px-4 py-3 font-sans">
                                  <p className="font-bold text-stone-900">{sale.agentName}</p>
                                  <p className="text-[9.5px] text-stone-500 font-mono">{sale.agentId}</p>
                                </td>
                                <td className="px-4 py-3 text-stone-700 font-semibold">{sale.buyerName}</td>
                                <td className="px-4 py-3 text-right font-mono text-stone-600">{sale.sizeSqYards}</td>
                                <td className="px-4 py-3 text-right font-mono text-stone-600 font-bold">{sale.ratePerSqYard ? formatINR(sale.ratePerSqYard) : '₹15,000'}</td>
                                <td className="px-4 py-3">
                                  {renderPaymentProgress(sale)}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-stone-900 font-mono">{formatPoints(sale.saleValue)}</td>
                                <td className="px-4 py-3 text-right font-bold text-emerald-800 font-mono">{formatPoints(saleNet)}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex items-center gap-1 text-[9px] uppercase font-bold rounded px-2 py-0.5 border ${
                                    (sale.bookingStatus || 'TOKEN_RECEIVED') === 'REGISTRY_DONE'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
                                      : (sale.bookingStatus || 'TOKEN_RECEIVED') === 'BOOKING_DONE'
                                      ? 'bg-blue-50 text-blue-800 border-blue-250'
                                      : 'bg-amber-50 text-amber-800 border-amber-250'
                                  }`}>
                                    {(sale.bookingStatus || 'TOKEN_RECEIVED').replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => setSelectedSaleDetailId(sale.id)}
                                      className="px-2.5 py-1 text-[10px] font-bold rounded border border-stone-250 hover:border-stone-400 bg-white text-stone-700 transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1"
                                    >
                                      View Audit Ledger
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedPaymentSaleId(sale.id);
                                        setPaymentFormId(null);
                                        setPaymentFormAmount('');
                                        setPaymentFormDate(new Date().toISOString().split('T')[0]);
                                        setPaymentFormMode('BANK_TRANSFER');
                                        setPaymentFormReference('');
                                        setPaymentFormNotes('');
                                      }}
                                      className="px-2.5 py-1 text-[10px] font-bold rounded border border-emerald-250 hover:border-emerald-400 bg-emerald-50 text-emerald-800 transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1"
                                    >
                                      💳 Payments ({getSalePayments(sale).length})
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            );
          })()}

          {/* Audit Ledger Detail Modal */}
          {selectedSaleDetailId && (() => {
            const sale = sales.find(s => s.id === selectedSaleDetailId);
            if (!sale) return null;
            const salePayouts = payouts.filter(p => p.saleId === sale.id).sort((a, b) => a.level - b.level);
            
            return (
              <div className="fixed inset-0 bg-stone-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:relative print:bg-white print:p-0 print:inset-auto">
                <div className="bg-white rounded-2xl border border-stone-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-xl print:shadow-none print:border-none print:max-h-none">
                  {/* Modal Header */}
                  <div className="p-5 border-b border-stone-200 bg-stone-50/50 flex justify-between items-center print:hidden">
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm uppercase tracking-wider">Multi-Tier Distribution Audit</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5 font-sans">Detailed breakdown of commission credits for Booking ID: <span className="font-mono font-bold text-stone-850">{sale.id}</span></p>
                    </div>
                    <button
                      onClick={() => setSelectedSaleDetailId(null)}
                      className="text-stone-400 hover:text-stone-700 text-sm font-bold cursor-pointer font-mono"
                    >
                      [ Close ESC ]
                    </button>
                  </div>

                  {/* Printable Invoice Body */}
                  <div className="p-6 space-y-6 flex-1 font-sans print:p-0">
                    <div className="border-2 border-stone-200 rounded-2xl p-5 bg-stone-50/20 print:border-none print:p-0">
                      {/* Logo and SBR watermark */}
                      <div className="flex justify-between items-start border-b border-stone-250 pb-4 mb-4">
                        <div>
                          <h2 className="text-xl font-black text-stone-900 tracking-tight font-sans">SBR GROUP</h2>
                          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider font-mono">Corporate Sales Distribution Voucher</p>
                        </div>
                        <div className="text-right font-mono">
                          <p className="text-xs font-bold text-stone-900">Voucher No: VCH-{sale.id}</p>
                          <p className="text-[10px] text-stone-500 mt-0.5">Date: {sale.saleDate}</p>
                        </div>
                      </div>

                      {/* Sale metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs">
                        <div className="col-span-2 md:col-span-1">
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">SBR Property Sourced</p>
                          <p className="font-bold text-stone-900">{sale.project}</p>
                          <p className="text-[10px] text-emerald-800 font-semibold">{sale.unitNumber}</p>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Buyer Client</p>
                          <p className="font-bold text-stone-900">{sale.buyerName}</p>
                          <p className="text-[10px] text-stone-500 font-mono">Ref: {sale.referenceNumber}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Plot Size Dimension</p>
                          <p className="font-bold text-stone-900 font-mono">{sale.sizeSqYards}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Rate / Sq Yard</p>
                          <p className="font-bold text-stone-900 font-mono">{sale.ratePerSqYard ? formatINR(sale.ratePerSqYard) : '₹15,000'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Token Amount</p>
                          <p className="font-bold text-amber-800 font-mono">{sale.tokenAmount !== undefined ? formatINR(sale.tokenAmount) : '₹75,000'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Agreement Value</p>
                          <p className="font-extrabold text-stone-900 font-mono text-sm">{formatPoints(sale.saleValue)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Commissions ledger breakdown */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Multi-Level commission schedule</h5>
                      
                      <div className="overflow-x-auto border border-stone-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-stone-50 border-b border-stone-200 text-[9px] uppercase font-bold text-stone-500 tracking-wider font-sans">
                              <th className="px-4 py-2">Tier Level</th>
                              <th className="px-4 py-2">Sponsor Associate Name</th>
                              <th className="px-4 py-2">ID Number</th>
                              <th className="px-4 py-2 text-right">Index (%)</th>
                              <th className="px-4 py-2 text-right">Gross Commission</th>
                              <th className="px-4 py-2 text-right text-stone-500">TDS (5%)</th>
                              <th className="px-4 py-2 text-right text-stone-500">Admin (10%)</th>
                              <th className="px-4 py-2 text-right font-bold text-emerald-900">Net Credit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-150 font-sans">
                            {salePayouts.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-stone-400 italic">No network commissions recorded for this direct booking.</td>
                              </tr>
                            ) : (
                              salePayouts.map((pay) => (
                                <tr key={pay.id} className="hover:bg-stone-50/50">
                                  <td className="px-4 py-2.5 font-bold text-stone-800">
                                    {pay.level === 1 ? (
                                      <span className="text-[10.5px] text-emerald-800 font-bold">Direct Broker (L1)</span>
                                    ) : (
                                      `Downline Sponsor (L${pay.level})`
                                    )}
                                  </td>
                                  <td className="px-4 py-2.5 font-semibold text-stone-900">{pay.agentName}</td>
                                  <td className="px-4 py-2.5 font-mono text-stone-500 text-[11px]">{pay.agentId}</td>
                                  <td className="px-4 py-2.5 text-right font-mono font-medium text-stone-700">{pay.percentage}%</td>
                                  <td className="px-4 py-2.5 text-right font-mono font-medium text-stone-800">{formatPoints(pay.grossCommission)}</td>
                                  <td className="px-4 py-2.5 text-right font-mono text-stone-500">-{formatPoints(pay.tdsDeduction)}</td>
                                  <td className="px-4 py-2.5 text-right font-mono text-stone-500">-{formatPoints(pay.adminFee)}</td>
                                  <td className="px-4 py-2.5 text-right font-bold font-mono text-emerald-800 bg-emerald-50/10">{formatPoints(pay.netCommission)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bottom aggregate metrics of distribution */}
                    <div className="flex flex-col sm:flex-row items-end justify-between gap-4 pt-3 border-t border-stone-200">
                      <div className="text-[10px] text-stone-500 font-semibold max-w-sm">
                        <p className="uppercase tracking-wide font-bold mb-1 font-sans">Voucher Audit Compliance</p>
                        This distribution document conforms to the SBR multi-level compensation model configured at SBR Operations. 5.0% TDS is withheld for IT reporting, and 10.0% administration and maintenance charges are deducted at source.
                      </div>

                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4.5 w-full sm:w-64 font-mono">
                        <div className="flex justify-between text-[11px] text-stone-500">
                          <span>Total Gross Distributed:</span>
                          <span className="font-bold text-stone-800">{formatPoints(salePayouts.reduce((acc, curr) => acc + curr.grossCommission, 0))}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-stone-500 mt-1 pb-1.5 border-b border-stone-200">
                          <span>Aggregate Deductions:</span>
                          <span className="font-bold text-rose-700">-{formatPoints(salePayouts.reduce((acc, curr) => acc + curr.tdsDeduction + curr.adminFee, 0))}</span>
                        </div>
                        <div className="flex justify-between text-xs font-extrabold text-stone-900 mt-2">
                          <span>Aggregate Net Disbursed:</span>
                          <span className="text-emerald-800">{formatPoints(salePayouts.reduce((acc, curr) => acc + curr.netCommission, 0))}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer Controls */}
                  <div className="p-4 border-t border-stone-200 bg-stone-50/50 flex justify-between items-center print:hidden">
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Voucher
                    </button>
                    <button
                      onClick={() => setSelectedSaleDetailId(null)}
                      className="px-3.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      Close Voucher View
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Payment Records & Installment Management Modal */}
          {selectedPaymentSaleId && (() => {
            const sale = sales.find(s => s.id === selectedPaymentSaleId);
            if (!sale) return null;
            
            const payments = getSalePayments(sale);
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            const totalValue = getSaleTotalAgreementValueINR(sale);
            const pending = totalValue - totalPaid;
            const pct = totalValue > 0 ? (totalPaid / totalValue) * 100 : 0;
            
            return (
              <div className="fixed inset-0 bg-stone-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-white rounded-2xl border border-stone-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-xl">
                  {/* Modal Header */}
                  <div className="p-5 border-b border-stone-200 bg-stone-50/50 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm uppercase tracking-wider flex items-center gap-2">
                        💳 Payment Installments & Ledger
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5 font-sans">
                        Manage payment installments, check transaction status, and add new payment events for Booking ID: <span className="font-mono font-bold text-stone-850">{sale.id}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPaymentSaleId(null)}
                      className="text-stone-400 hover:text-stone-700 text-sm font-bold cursor-pointer font-mono"
                    >
                      [ Close ESC ]
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-6 flex-1 font-sans">
                    {/* Real estate context summary banner */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-stone-50 border border-stone-200 p-4 rounded-xl">
                      <div>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5 font-sans">SBR Layout Unit</p>
                        <p className="font-bold text-stone-900 text-xs">{sale.project}</p>
                        <p className="text-[11px] text-emerald-800 font-bold">{sale.unitNumber}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5 font-sans">Buyer Client</p>
                        <p className="font-bold text-stone-900 text-xs">{sale.buyerName}</p>
                        <p className="text-[10px] text-stone-500 font-mono">Ref: {sale.referenceNumber}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5 font-sans">Sourcing Broker</p>
                        <p className="font-bold text-stone-900 text-xs">{sale.agentName}</p>
                        <p className="text-[10px] text-stone-500 font-mono">ID: {sale.agentId}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5 font-sans">Agreement Price (PTS)</p>
                        <p className="font-extrabold text-stone-900 font-mono text-sm">{formatPoints(sale.saleValue)}</p>
                        <p className="text-[9.5px] text-stone-400 uppercase tracking-widest font-mono">({sale.sizeSqYards} SQ YD)</p>
                      </div>
                    </div>

                    {/* Overall Financial Progress Card */}
                    <div className="bg-emerald-50/10 border border-emerald-250 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                          Installment Progress Tracker
                        </span>
                        <span className="text-xs font-black text-emerald-800 font-mono">
                          {pct.toFixed(2)}% Paid
                        </span>
                      </div>
                      
                      <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            pct >= 100 
                              ? 'bg-emerald-650' 
                              : pct >= 30 
                              ? 'bg-blue-600' 
                              : 'bg-amber-600'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center pt-2">
                        <div className="border-r border-stone-200">
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Total Sale Value (INR)</p>
                          <p className="font-extrabold text-stone-900 text-xs font-mono">{formatINR(totalValue)}</p>
                        </div>
                        <div className="border-r border-stone-200">
                          <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mb-0.5">Total Amount Paid (INR)</p>
                          <p className="font-extrabold text-emerald-800 text-xs font-mono">{formatINR(totalPaid)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest mb-0.5">Pending Balance (INR)</p>
                          <p className={`font-extrabold text-xs font-mono ${pending > 0 ? 'text-amber-800 font-bold' : 'text-emerald-800 font-bold'}`}>
                            {pending > 0 ? formatINR(pending) : 'Fully Paid'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left Side: Ledger / Installment History (7 cols) */}
                      <div className="lg:col-span-7 space-y-3">
                        <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1">
                          📋 Receipt Records History ({payments.length})
                        </h5>

                        <div className="border border-stone-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-stone-50 border-b border-stone-200 text-[9px] uppercase font-bold text-stone-500 tracking-wider">
                                <th className="px-3 py-2">Receipt Date</th>
                                <th className="px-3 py-2">Mode</th>
                                <th className="px-3 py-2 text-right">Amount Received</th>
                                <th className="px-3 py-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-150">
                              {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-stone-50/50">
                                  <td className="px-3 py-2.5 font-mono text-stone-500 text-[11px] whitespace-nowrap">
                                    {p.date}
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <span className="inline-block text-[9.5px] font-semibold font-sans text-stone-700">
                                      {p.paymentMode.replace('_', ' ')}
                                    </span>
                                    {p.reference && (
                                      <p className="text-[9px] text-stone-400 font-mono mt-0.5 truncate max-w-[120px]" title={p.reference}>
                                        Ref: {p.reference}
                                      </p>
                                    )}
                                    {p.notes && (
                                      <p className="text-[9px] text-stone-400 italic mt-0.5 truncate max-w-[120px]" title={p.notes}>
                                        "{p.notes}"
                                      </p>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-bold font-mono text-stone-900 text-xs">
                                    {formatINR(p.amount)}
                                  </td>
                                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                                    <div className="inline-flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleEditPaymentClick(p)}
                                        className="text-blue-700 hover:text-blue-900 font-bold text-[10.5px] cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      {payments.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (window.confirm("Are you sure you want to delete this payment record?")) {
                                              handleDeletePayment(p.id);
                                            }
                                          }}
                                          className="text-rose-750 hover:text-rose-900 font-bold text-[10.5px] cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right Side: Add / Edit Receipt Entry Form (5 cols) */}
                      <div className="lg:col-span-5 bg-stone-50 border border-stone-200 rounded-xl p-4.5 space-y-3.5 h-fit">
                        <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                          {paymentFormId ? '📝 Edit Receipt Entry' : '➕ Add Installment Receipt'}
                        </h5>

                        <form onSubmit={handleAddOrUpdatePayment} className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                              Amount Received (INR) *
                            </label>
                            <input
                              type="number"
                              step="any"
                              required
                              min="1"
                              placeholder="e.g. 75000"
                              value={paymentFormAmount}
                              onChange={(e) => setPaymentFormAmount(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                                Receipt Date *
                              </label>
                              <input
                                type="date"
                                required
                                value={paymentFormDate}
                                onChange={(e) => setPaymentFormDate(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs font-sans rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                                Payment Mode
                              </label>
                              <select
                                value={paymentFormMode}
                                onChange={(e) => setPaymentFormMode(e.target.value as any)}
                                className="w-full px-2 py-1.5 text-xs font-sans rounded-lg border border-stone-200 bg-white text-stone-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-700"
                              >
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="CHEQUE">Cheque</option>
                                <option value="CASH">Cash</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                              Transaction Reference / Instrument #
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. TXN-90123491823"
                              value={paymentFormReference}
                              onChange={(e) => setPaymentFormReference(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                              Internal Notes / Remarks
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Specify receipts, cleared status, or remarks..."
                              value={paymentFormNotes}
                              onChange={(e) => setPaymentFormNotes(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs font-sans rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                            />
                          </div>

                          <div className="flex gap-2 pt-1">
                            {paymentFormId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentFormId(null);
                                  setPaymentFormAmount('');
                                  setPaymentFormDate(new Date().toISOString().split('T')[0]);
                                  setPaymentFormMode('BANK_TRANSFER');
                                  setPaymentFormReference('');
                                  setPaymentFormNotes('');
                                }}
                                className="flex-1 px-3 py-2 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-bold transition-all cursor-pointer text-center"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              type="submit"
                              className="flex-1 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs text-center"
                            >
                              {paymentFormId ? 'Update Receipt' : 'Record Receipt'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer Controls */}
                  <div className="p-4 border-t border-stone-200 bg-stone-50/50 flex justify-end items-center">
                    <button
                      onClick={() => setSelectedPaymentSaleId(null)}
                      className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      Close Ledger View
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
