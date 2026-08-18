import { User } from '../types';
import { ShieldAlert, UserRound } from 'lucide-react';
import ProfileTabs from './ProfileTabs';

/**
 * `/profile` — the associate's identity card.
 *
 * Deliberately the smallest of the three profile views: a welcome line, one
 * tall card (photo on top, identity table beneath), and a closing note.
 * Everything else lives at `/profile-edit` and `/profile-complete`.
 */
interface ProfileIdCardProps {
  users: User[];
  profileId?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onNavigate: (path: string) => void;
}

/** One row of the identity table. */
function Row({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) {
  return (
    <tr className="border-b border-stone-200 last:border-b-0">
      <th className="text-left align-top px-4 py-3 w-[42%] text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-50">
        {label}
      </th>
      <td className={`px-4 py-3 text-xs text-stone-900 font-semibold break-words ${mono ? 'font-mono' : ''}`}>
        {value?.trim() ? value : <span className="text-stone-400 font-normal">Not provided</span>}
      </td>
    </tr>
  );
}

export default function ProfileIdCard({
  users,
  profileId,
  currentUserId,
  isAdmin = false,
  onNavigate,
}: ProfileIdCardProps) {
  // Only admins may open someone else's card.
  const requestedId = isAdmin && profileId ? profileId : currentUserId;
  const user = users.find(u => u.id?.toUpperCase() === requestedId?.toUpperCase());

  if (!user) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-stone-900 font-serif">Profile not found</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
          No SBR record matches <span className="font-mono font-bold">{requestedId || 'this session'}</span>.
        </p>
      </div>
    );
  }

  const firstName = user.name?.trim().split(/\s+/)[0] || user.name;

  return (
    <div className="space-y-4">
      {/* Welcome header */}
      <div className="text-center px-2">
        <h1 className="text-lg sm:text-2xl font-bold font-serif text-stone-900">
          Welcome, <span className="text-emerald-800">{firstName}</span>
        </h1>
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 mt-1">
          SBR Sponsors
        </p>
      </div>

      <ProfileTabs active="CARD" onNavigate={onNavigate} profileId={isAdmin ? profileId : undefined} />

      {/* The card: a single tall rectangle — photo band on top, identity table beneath. */}
      <div className="mx-auto w-full max-w-sm bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Photo band */}
        <div className="bg-emerald-800 px-4 py-5 flex flex-col items-center gap-2.5">
          {user.photo ? (
            <img
              src={user.photo}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-xl object-cover border-2 border-white/70 bg-stone-100"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-white/15 border-2 border-white/50 flex items-center justify-center">
              <UserRound className="w-10 h-10 text-white/90" strokeWidth={1.5} />
            </div>
          )}
          <div className="text-center">
            <p className="text-white font-bold text-sm leading-tight">{user.name}</p>
            <p className="text-emerald-100 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
              {user.designation || 'Associate'}
            </p>
          </div>
        </div>

        {/* Identity table */}
        <table className="w-full border-collapse">
          <tbody>
            <Row label="User ID" value={user.id} mono />
            <Row label="Name" value={user.name} />
            <Row label="Phone Number" value={user.phone} mono />
            <Row label="Date of Birth" value={user.dob} mono />
            <Row label="PAN Number" value={user.pan?.toUpperCase()} mono />
          </tbody>
        </table>

        {/* Closing note */}
        <div className="px-4 py-3 border-t border-stone-200 bg-stone-50 text-center">
          <p className="text-[10.5px] text-stone-500 leading-relaxed">
            Welcome aboard, {firstName}. This card is your SBR Sponsors identity —
            keep your Sponsor ID handy when onboarding new associates.
          </p>
        </div>
      </div>
    </div>
  );
}
