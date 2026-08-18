import { useRef, useState } from 'react';
import { User } from '../types';
import { Camera, Loader2, ShieldAlert, UserRound } from 'lucide-react';

/**
 * `/profile` — the associate's ID card.
 *
 * Built to be screenshot-worthy: one tall card that fills a phone screen, with
 * the company band, photo, name and identity fields all inside the same
 * rounded rectangle so a screen grab crops cleanly into a usable ID.
 */
interface ProfileIdCardProps {
  users: User[];
  profileId?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onUpdateUserProfile?: (userId: string, updatedFields: Partial<User>) => Promise<void>;
}

/**
 * Phone photos are 2–5 MB and Firestore caps a document at ~1 MB, so the raw
 * file can never be stored. Downscale to 480px and re-encode as JPEG, which
 * lands around 20–50 KB — small enough to live in the user document.
 */
function readAndCompress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a readable image.'));
      img.onload = () => {
        const MAX = 480;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Image processing unavailable on this device.'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** One row of the identity table. */
function Row({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) {
  return (
    <tr className="border-b border-stone-200 last:border-b-0">
      <th className="text-left align-middle px-3.5 py-2 w-[40%] text-[9.5px] font-bold uppercase tracking-wider text-stone-500 bg-stone-50">
        {label}
      </th>
      <td className={`px-3.5 py-2 text-xs text-stone-900 font-semibold break-words ${mono ? 'font-mono' : ''}`}>
        {value?.trim() ? value : <span className="text-stone-400 font-normal">Not provided</span>}
      </td>
    </tr>
  );
}

export default function ProfileIdCard({
  users, profileId, currentUserId, isAdmin = false, onUpdateUserProfile,
}: ProfileIdCardProps) {
  const requestedId = isAdmin && profileId ? profileId : currentUserId;
  const user = users.find(u => u.id?.toUpperCase() === requestedId?.toUpperCase());

  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

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
  // You may change your own photo; an admin may change anyone's.
  const canEditPhoto = Boolean(onUpdateUserProfile) &&
    (isAdmin || user.id?.toUpperCase() === currentUserId?.toUpperCase());

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file || !onUpdateUserProfile) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file.');
      return;
    }
    setIsUploading(true);
    setPhotoError(null);
    try {
      const dataUrl = await readAndCompress(file);
      await onUpdateUserProfile(user.id, { photo: dataUrl });
    } catch (err: any) {
      setPhotoError(err?.message || 'Could not update the photo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="text-base sm:text-xl font-bold font-serif text-stone-900 px-1">
        Welcome, <span className="text-emerald-800">{firstName}</span>
      </h1>

      {/* The card. Full width on a phone, capped on desktop, and tall enough
          that a screenshot crops to a complete, self-contained ID. */}
      <div className="mx-auto w-full max-w-sm bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Company band */}
        <div className="bg-emerald-900 px-3.5 py-2 text-center">
          <p className="text-white font-serif font-bold text-sm leading-none">
            SBR <span className="font-normal text-emerald-200">Sponsors</span>
          </p>
          <p className="text-emerald-300 text-[8px] font-bold uppercase tracking-[0.25em] mt-1">
            Associate Identity Card
          </p>
        </div>

        {/* Photo beside the name — side by side keeps the card short.
            No controls live inside the card, so a screenshot stays clean. */}
        <div className="bg-emerald-800 px-3.5 py-3 flex flex-row items-center gap-3.5">
          {user.photo ? (
            <img
              src={user.photo}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-2 border-white/80 bg-stone-100 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-white/15 border-2 border-white/60 flex items-center justify-center shadow-sm shrink-0">
              <UserRound className="w-12 h-12 text-white/90" strokeWidth={1.25} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-base leading-tight break-words">{user.name}</p>
            <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest mt-1">
              {user.designation || 'Associate'}
            </p>
            <p className="font-mono text-[10.5px] text-white/90 mt-1.5 bg-white/15 inline-block px-1.5 py-0.5 rounded">
              {user.id}
            </p>
          </div>
        </div>

        {/* Identity fields */}
        <table className="w-full border-collapse">
          <tbody>
            <Row label="User ID" value={user.id} mono />
            <Row label="Name" value={user.name} />
            <Row label="Phone Number" value={user.phone} mono />
            <Row label="Date of Birth" value={user.dob} mono />
            <Row label="PAN Number" value={user.pan?.toUpperCase()} mono />
          </tbody>
        </table>

        {/* Card foot — keeps the screenshot looking like a complete document */}
        <div className="bg-stone-50 border-t border-stone-200 px-3.5 py-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-wider text-stone-400">Member since</p>
            <p className="text-[10.5px] font-mono font-semibold text-stone-700">{user.joinedDate || '—'}</p>
          </div>
          <span className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
            user.status === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-stone-100 text-stone-600 border-stone-200'
          }`}>
            {user.status}
          </span>
        </div>
      </div>

      {/* Photo control lives OUTSIDE the card, so a screenshot of the card
          never captures it. */}
      {canEditPhoto && (
        <div className="mx-auto w-full max-w-sm space-y-1.5">
          {photoError && (
            <p className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-rose-700 text-[11px] font-semibold text-center">
              {photoError}
            </p>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 text-[11px] font-bold cursor-pointer disabled:opacity-70 transition-all"
          >
            {isUploading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating photo…</>
              : <><Camera className="w-3.5 h-3.5" /> {user.photo ? 'Change photo' : 'Add photo'}</>}
          </button>
        </div>
      )}
    </div>
  );
}
