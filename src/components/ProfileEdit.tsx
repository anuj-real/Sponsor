import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { Check, ChevronDown, CreditCard, Lock, ShieldAlert, ShieldCheck } from 'lucide-react';

/**
 * `/profile-edit` — the complete detail + editing page.
 *
 * `/profile` is deliberately just the identity card, so everything else lives
 * here: the editable field table, the locked KYC record, and the payout bank
 * account. All of it saves through one submit.
 */
interface ProfileEditProps {
  users: User[];
  profileId?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onUpdateUserProfile?: (userId: string, updatedFields: Partial<User>) => Promise<void>;
}

/** Table row shell — keeps every row on the same two-column grid. */
function Row({ label, locked = false, children }: { label: string; locked?: boolean; children: React.ReactNode }) {
  return (
    <tr className="border-b border-stone-200 last:border-b-0">
      <th className="text-left align-middle px-3 py-2.5 w-[38%] sm:w-[30%] text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-50">
        <span className="flex items-center gap-1">
          {label}
          {locked && <Lock className="w-2.5 h-2.5 text-stone-400 shrink-0" />}
        </span>
      </th>
      <td className="px-3 py-2 align-middle">{children}</td>
    </tr>
  );
}

/** Collapsible block used by the KYC and bank sections. */
function Section({
  title, subtitle, icon: Icon, open, onToggle, accent = false, children,
}: {
  title: string; subtitle: string; icon: React.ElementType;
  open: boolean; onToggle: () => void; accent?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
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
      {open && <div className="p-4 border-t border-stone-200">{children}</div>}
    </div>
  );
}

const INPUT =
  'w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 outline-none focus:ring-1 focus:ring-emerald-700';
const LOCKED =
  'w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 text-stone-500 cursor-not-allowed select-all';

export default function ProfileEdit({
  users, profileId, currentUserId, isAdmin = false, onUpdateUserProfile,
}: ProfileEditProps) {
  const requestedId = isAdmin && profileId ? profileId : currentUserId;
  const user = users.find(u => u.id?.toUpperCase() === requestedId?.toUpperCase());
  const sponsor = users.find(u => u.id?.toUpperCase() === user?.sponsorId?.toUpperCase());

  // Editable — core details
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState('');
  const [gender, setGender] = useState<'' | 'Male' | 'Female' | 'Other'>('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  // Editable — payout bank account
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [nominee, setNominee] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('');

  // Both start collapsed — the core detail table is what the page is for.
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email || '');
    setName(user.name || '');
    setFatherOrHusbandName(user.fatherOrHusbandName || '');
    setGender(user.gender || '');
    setPhone(user.phone || '');
    setCity(user.city || '');
    setAddress(user.address || '');
    setBankAccountNumber(user.bankAccountNumber || '');
    setIfscCode(user.ifscCode || '');
    setBranchName(user.branchName || '');
    setNominee(user.nominee || '');
    setNomineeRelation(user.nomineeRelation || '');
    setPassword(''); // never prefill; blank means "keep current"
  }, [user]);

  if (!user) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-stone-900 font-serif">Profile not found</h3>
        <p className="text-xs text-stone-500">
          No SBR record matches <span className="font-mono font-bold">{requestedId || 'this session'}</span>.
        </p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateUserProfile) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const fields: Partial<User> = {
        email: email.trim(),
        name: name.trim(),
        fatherOrHusbandName: fatherOrHusbandName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        branchName: branchName.trim(),
        nominee: nominee.trim(),
        nomineeRelation: nomineeRelation.trim(),
      };
      if (gender) fields.gender = gender;
      // Blank password means "unchanged" — App hashes whatever is sent, so an
      // empty string would otherwise overwrite the credential with a hash of "".
      if (password.trim()) fields.password = password.trim();

      await onUpdateUserProfile(user.id, fields);
      setSuccess('Details updated in SBR records.');
      setPassword('');
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: any) {
      setError(err?.message || 'Could not save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Company name heads the page */}
      <div className="text-center px-2">
        <h1 className="text-lg sm:text-2xl font-bold font-serif text-stone-900">
          SBR <span className="text-emerald-800 font-normal">Sponsors</span>
        </h1>
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 mt-1">
          Edit Details
        </p>
        <p className="text-[10.5px] text-stone-500 mt-1.5">
          {user.name} · <span className="font-mono">{user.id}</span>
        </p>
      </div>

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

      {/* Core details */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full border-collapse">
          <tbody>
            <Row label="Email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@email.com" className={INPUT} />
            </Row>

            <Row label="Name">
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Full name" className={INPUT} />
            </Row>

            <Row label="Father / Husband Name">
              <input type="text" value={fatherOrHusbandName} onChange={e => setFatherOrHusbandName(e.target.value)}
                placeholder="e.g. Ramesh Satpute" className={INPUT} />
            </Row>

            <Row label="Gender">
              <select value={gender} onChange={e => setGender(e.target.value as typeof gender)}
                className={`${INPUT} cursor-pointer`}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Row>

            <Row label="Mobile">
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+91 98450 11022" className={`${INPUT} font-mono`} />
            </Row>

            {/* Locked: identity document, changed only via admin verification */}
            <Row label="PAN Number" locked>
              <input type="text" value={user.pan?.toUpperCase() || 'Not provided'} readOnly disabled
                className={`${LOCKED} font-mono uppercase`} />
            </Row>

            <Row label="City">
              <input type="text" value={city} onChange={e => setCity(e.target.value)}
                placeholder="e.g. Gurugram" className={INPUT} />
            </Row>

            <Row label="Address">
              <textarea rows={2} value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Residential address" className={`${INPUT} resize-none`} />
            </Row>

            {/* Locked: system-assigned on onboarding */}
            <Row label="Date of Joining" locked>
              <input type="text" value={user.joinedDate || 'Not recorded'} readOnly disabled
                className={`${LOCKED} font-mono`} />
            </Row>

            <Row label="Password">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Leave blank to keep current" className={`${INPUT} font-mono`} />
            </Row>
          </tbody>
        </table>
      </div>

      {/* Locked KYC record */}
      <Section
        title="KYC Compliance (Locked)"
        subtitle="Verified identity & sponsor records"
        icon={Lock}
        open={isKycOpen}
        onToggle={() => setIsKycOpen(o => !o)}
      >
        <table className="w-full border-collapse">
          <tbody>
            <Row label="Aadhaar Number" locked>
              <input type="text" value={user.aadhar || 'Not provided'} readOnly disabled className={`${LOCKED} font-mono`} />
            </Row>
            <Row label="Date of Birth" locked>
              <input type="text" value={user.dob || 'Not provided'} readOnly disabled className={`${LOCKED} font-mono`} />
            </Row>
            <Row label="Upline Sponsor" locked>
              <input type="text"
                value={sponsor ? `${sponsor.name} (${sponsor.id})` : user.sponsorId || 'SBR Root Core'}
                readOnly disabled className={LOCKED} />
            </Row>
            <Row label="Designation" locked>
              <input type="text" value={user.designation || 'Associate'} readOnly disabled className={LOCKED} />
            </Row>
            <Row label="Status" locked>
              <input type="text" value={user.status} readOnly disabled className={LOCKED} />
            </Row>
          </tbody>
        </table>
        <p className="text-[9.5px] text-stone-400 italic mt-3">
          * Locked fields can only be modified with administrative verification of legal identity documents.
        </p>
      </Section>

      {/* Payout bank account */}
      <Section
        title="Profile Info & Bank Details"
        subtitle="Edit nominee and payout bank account"
        icon={CreditCard}
        open={isBankOpen}
        onToggle={() => setIsBankOpen(o => !o)}
        accent
      >
        <table className="w-full border-collapse">
          <tbody>
            <Row label="Bank Account Number">
              <input type="text" value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)}
                placeholder="e.g. 501002931289" className={`${INPUT} font-mono`} />
            </Row>
            <Row label="IFSC Code">
              <input type="text" value={ifscCode} onChange={e => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0000240" className={`${INPUT} font-mono uppercase`} />
            </Row>
            <Row label="Branch Name">
              <input type="text" value={branchName} onChange={e => setBranchName(e.target.value)}
                placeholder="e.g. HDFC Bank, Sector 56, Gurgaon" className={INPUT} />
            </Row>
            <Row label="Nominee Name">
              <input type="text" value={nominee} onChange={e => setNominee(e.target.value)}
                placeholder="e.g. Sarita Devi" className={INPUT} />
            </Row>
            <Row label="Nominee Relation">
              <select value={nomineeRelation} onChange={e => setNomineeRelation(e.target.value)}
                className={`${INPUT} cursor-pointer`}>
                <option value="">Select Relation</option>
                {['Spouse', 'Mother', 'Father', 'Son', 'Daughter', 'Brother', 'Sister', 'Other'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Row>
          </tbody>
        </table>
      </Section>

      {/* Save bar */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs p-3 flex items-center justify-between gap-3">
        <p className="text-[10px] text-stone-500 leading-snug">
          <Lock className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5 text-stone-400" />
          PAN and date of joining are locked — contact an administrator to change them.
        </p>
        <button
          type="submit"
          disabled={isSaving || !onUpdateUserProfile}
          className="shrink-0 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <><Check className="w-3.5 h-3.5" /> Save Changes</>
          )}
        </button>
      </div>
    </form>
  );
}
