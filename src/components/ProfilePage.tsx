import React, { useEffect, useState } from 'react';
import { User, Sale, CommissionPayout } from '../types';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CreditCard,
  IdCard,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users as UsersIcon,
  Wallet,
} from 'lucide-react';

/**
 * `/profile` — the single place a partner's full record is shown.
 *
 * Combines what used to be split across the Home summary, "User Detail" and
 * "Edit Detail" nav targets: identity + personal details, KYC compliance
 * (read-only), and the editable bank/nominee block.
 *
 * Admins can open any partner via `#/profile/<SBR ID>`; everyone else always
 * sees their own record.
 */
interface ProfilePageProps {
  users: User[];
  sales: Sale[];
  payouts: CommissionPayout[];
  /** Whose profile to show. Falls back to the signed-in user. */
  profileId?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onBack: () => void;
  onUpdateUserProfile?: (userId: string, updatedFields: Partial<User>) => Promise<void>;
}

const formatPoints = (val: number) => `${Math.round(val || 0).toLocaleString()} PTS`;

/** Recursive downline size for the team-count stat. */
function countDownline(userId: string, users: User[], seen = new Set<string>()): number {
  const key = userId?.toUpperCase();
  if (seen.has(key)) return 0;
  seen.add(key);
  const direct = users.filter(u => u.sponsorId?.toUpperCase() === key);
  return direct.reduce((total, child) => total + 1 + countDownline(child.id, users, seen), 0);
}

/** Read-only field with an optional lock affordance. */
function Field({
  label,
  value,
  icon: Icon,
  locked = false,
  mono = false,
}: {
  label: string;
  value?: string;
  icon?: React.ElementType;
  locked?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block mb-1">{label}</label>
      <div
        className={`px-3 py-2 text-xs rounded-lg border border-stone-200 bg-stone-50 text-stone-700 flex items-center justify-between gap-2 ${
          mono ? 'font-mono' : 'font-medium'
        }`}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          {Icon && <Icon className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
          <span className="truncate">{value?.trim() ? value : 'Not provided'}</span>
        </span>
        {locked && <Lock className="w-3 h-3 text-stone-300 shrink-0" />}
      </div>
    </div>
  );
}

/** Collapsible section shell used by the two compliance/bank blocks. */
function Section({
  title,
  subtitle,
  icon: Icon,
  open,
  onToggle,
  accent = false,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  open: boolean;
  onToggle: () => void;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 shrink-0 ${accent ? 'text-emerald-800' : 'text-stone-500'}`} />
          <div>
            <h5 className={`text-[11px] font-bold uppercase tracking-wider ${accent ? 'text-emerald-800' : 'text-stone-700'}`}>
              {title}
            </h5>
            <p className="text-[9.5px] text-stone-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-4 bg-white border-t border-stone-200 animate-fade-in">{children}</div>}
    </div>
  );
}

export default function ProfilePage({
  users,
  sales,
  payouts,
  profileId,
  currentUserId,
  isAdmin = false,
  onBack,
  onUpdateUserProfile,
}: ProfilePageProps) {
  // Only admins may look at someone else's record.
  const requestedId = isAdmin && profileId ? profileId : currentUserId;
  const user = users.find(u => u.id?.toUpperCase() === requestedId?.toUpperCase());

  const [isKycOpen, setIsKycOpen] = useState(true);
  const [isBankOpen, setIsBankOpen] = useState(true);

  // Editable fields
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [nominee, setNominee] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('');
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setBankAccountNumber(user.bankAccountNumber || '');
    setIfscCode(user.ifscCode || '');
    setBranchName(user.branchName || '');
    setNominee(user.nominee || '');
    setNomineeRelation(user.nomineeRelation || '');
    setFatherOrHusbandName(user.fatherOrHusbandName || '');
  }, [user]);

  if (!user) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-stone-900 font-serif">Profile not found</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
          No SBR record matches <span className="font-mono font-bold">{requestedId || 'this session'}</span>.
          It may have been removed, or you may not have access to it.
        </p>
        <button
          onClick={onBack}
          className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold cursor-pointer"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const sponsor = users.find(u => u.id?.toUpperCase() === user.sponsorId?.toUpperCase());
  const directRecruits = users.filter(u => u.sponsorId?.toUpperCase() === user.id?.toUpperCase());
  const teamSize = countDownline(user.id, users);
  const mySales = sales.filter(s => s.agentId?.toUpperCase() === user.id?.toUpperCase());
  const myPayouts = payouts.filter(p => p.agentId?.toUpperCase() === user.id?.toUpperCase());
  const paid = myPayouts.filter(p => p.status === 'DISBURSED').reduce((a, p) => a + p.netCommission, 0);
  const pending = myPayouts.filter(p => p.status !== 'DISBURSED').reduce((a, p) => a + p.netCommission, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateUserProfile) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await onUpdateUserProfile(user.id, {
        bankAccountNumber: bankAccountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        branchName: branchName.trim(),
        nominee: nominee.trim(),
        nomineeRelation: nomineeRelation.trim(),
        fatherOrHusbandName: fatherOrHusbandName.trim(),
      });
      setSuccess('Profile updated in SBR records.');
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: any) {
      setError(err?.message || 'Could not save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    { label: 'Direct Volume', value: formatPoints(user.totalDirectSales), icon: TrendingUp, note: `${mySales.length} agreements` },
    { label: 'Downline Volume', value: formatPoints(user.totalDownlineSales), icon: UsersIcon, note: `${teamSize} in team` },
    { label: 'Commissions Paid', value: formatPoints(paid), icon: Wallet, note: 'Cleared to bank' },
    { label: 'Pending Payouts', value: formatPoints(pending), icon: CreditCard, note: 'Awaiting release' },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
      </button>

      {/* Identity banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center gap-5">
        {user.photo ? (
          <img
            src={user.photo}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-2xl object-cover border border-stone-200 bg-stone-100 shrink-0"
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-serif font-bold text-2xl shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-stone-900 font-serif truncate">{user.name}</h2>
            <span
              className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                user.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              {user.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
              {user.id}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded">
              {user.designation || 'Associate'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-600 rounded">
              {user.role}
            </span>
            <span className="text-[10.5px] text-stone-500">Joined {user.joinedDate}</span>
          </div>

          <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
            {sponsor ? (
              <>
                Sponsored by <span className="font-semibold text-stone-700">{sponsor.name}</span>{' '}
                <span className="font-mono">({sponsor.id})</span> ·{' '}
              </>
            ) : (
              <>Top-level director · </>
            )}
            {directRecruits.length} direct {directRecruits.length === 1 ? 'recruit' : 'recruits'} · {teamSize} total team
          </p>
        </div>
      </div>

      {/* Performance summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, note }) => (
          <div key={label} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{label}</span>
              <Icon className="w-4 h-4 text-emerald-800 shrink-0" />
            </div>
            <h3 className="font-mono font-bold text-lg text-stone-900 mt-1.5">{value}</h3>
            <p className="text-[9.5px] text-stone-400 mt-0.5">{note}</p>
          </div>
        ))}
      </div>

      {/* Personal details */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50">
          <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wide flex items-center gap-2">
            <IdCard className="w-4 h-4 text-emerald-800" /> Personal Details
          </h4>
          <p className="text-[10px] text-stone-500 mt-0.5">Identity on file with SBR Associates</p>
        </div>
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Full Name" value={user.name} />
          <Field label="Mobile Number" value={user.phone} icon={Phone} mono />
          <Field label="Email Address" value={user.email} icon={Mail} />
          <Field label="Date of Birth" value={user.dob} mono />
          <Field label="PAN Card" value={user.pan?.toUpperCase()} mono />
          <Field label="Aadhaar Number" value={user.aadhar} mono />
          <Field label="Father's / Husband's Name" value={user.fatherOrHusbandName} />
          <Field label="Upline Sponsor" value={sponsor ? `${sponsor.name} (${sponsor.id})` : 'SBR Root Core'} icon={Landmark} />
          <Field label="Residential Address" value={user.address} icon={MapPin} />
        </div>
      </div>

      {/* Compliance + editable bank details */}
      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-800" /> Partner Profile & Compliance
            </h4>
            <p className="text-[10px] text-stone-500 mt-0.5">Verified KYC records and payout bank account</p>
          </div>
          {onUpdateUserProfile && (
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" /> {success}
            </div>
          )}
          {error && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <Section
            title="KYC Compliance (Locked)"
            subtitle="Verified identity & sponsor records"
            icon={Lock}
            open={isKycOpen}
            onToggle={() => setIsKycOpen(o => !o)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" value={user.name} locked />
              <Field label="Mobile Sourcing Phone" value={user.phone} locked mono />
              <Field
                label="Upstream Sponsor"
                value={sponsor ? `${sponsor.name} (${sponsor.id})` : user.sponsorId || 'SBR Root Core'}
                locked
              />
              <Field label="Date of Birth (DOB)" value={user.dob} locked mono />
              <Field label="Aadhaar Card Number" value={user.aadhar} locked mono />
              <Field label="Permanent Account Number (PAN)" value={user.pan?.toUpperCase()} locked mono />
            </div>
            <p className="text-[9.5px] text-stone-400 italic mt-4">
              * Locked fields can only be modified with administrative verification of legal identity documents.
            </p>
          </Section>

          <Section
            title="Profile Info & Bank Details"
            subtitle="Edit nominee, father/husband & bank account"
            icon={CreditCard}
            open={isBankOpen}
            onToggle={() => setIsBankOpen(o => !o)}
            accent
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">Father's / Husband's Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Satpute"
                  value={fatherOrHusbandName}
                  onChange={e => setFatherOrHusbandName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">Bank Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 501002931289"
                  value={bankAccountNumber}
                  onChange={e => setBankAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">IFSC Code</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0000240"
                  value={ifscCode}
                  onChange={e => setIfscCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">Branch Name & Location</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, Sector 56, Gurgaon"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">Nominee Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarita Devi"
                  value={nominee}
                  onChange={e => setNominee(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">Nominee Relation</label>
                <select
                  value={nomineeRelation}
                  onChange={e => setNomineeRelation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                >
                  <option value="">Select Relation</option>
                  {['Spouse', 'Mother', 'Father', 'Son', 'Daughter', 'Brother', 'Sister', 'Other'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </Section>
        </div>
      </form>
    </div>
  );
}
