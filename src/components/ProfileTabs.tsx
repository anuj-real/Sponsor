import { IdCard, UserCog, FileText } from 'lucide-react';

/**
 * Switcher shared by the three profile views. Keeps the admin's
 * "viewing someone else" id across the routes so `#/profile/SBR0004` →
 * `#/profile-edit/SBR0004` stays on the same person.
 */
export type ProfileTabKey = 'CARD' | 'EDIT' | 'FULL';

const TABS: { key: ProfileTabKey; label: string; base: string; icon: React.ElementType }[] = [
  { key: 'CARD', label: 'Profile', base: '/profile', icon: IdCard },
  { key: 'EDIT', label: 'Edit Detail', base: '/profile-edit', icon: UserCog },
  { key: 'FULL', label: 'Full Detail', base: '/profile-complete', icon: FileText },
];

export default function ProfileTabs({
  active,
  onNavigate,
  profileId,
}: {
  active: ProfileTabKey;
  onNavigate: (path: string) => void;
  /** Present only when an admin is inspecting another associate. */
  profileId?: string;
}) {
  return (
    <div className="flex gap-1 p-1 bg-stone-100 border border-stone-200 rounded-xl">
      {TABS.map(({ key, label, base, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onNavigate(profileId ? `${base}/${profileId}` : base)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            active === key
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{label}</span>
        </button>
      ))}
    </div>
  );
}
