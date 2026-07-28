# UI Change Context

Running reference for the header-navigation / theming / tree work. Keep this updated when
touching the header, `TreeVisualizer`, or the profile sections — it records **why** things are
wired the way they are, which is not obvious from the code alone.

Companion to [../CLAUDE.md](../CLAUDE.md) (architecture) — this file covers only UI/shell changes.

---

## 1. Theme (light + dark)

- **Mechanism:** class-based dark mode, not a config file. [src/index.css](src/index.css) declares:
  ```css
  @custom-variant dark (&:where(.dark, .dark *));
  ```
  `App` puts `.dark` on the layout root, so any descendant — including `TreeVisualizer`
  nested deep inside `AdminPanel`/`AgentPanel` — responds to plain `dark:` classes.
  This avoids both a context file and prop-drilling through the panels.
- **State:** `theme` in [src/App.tsx](src/App.tsx), persisted to `localStorage` under `SBR_THEME`.
  That key is deliberately **not** in the list App clears on login/logout, so the preference survives sessions.
- **Toggle:** a single button in the header's right column (it was briefly duplicated for
  responsive placement; the centred-logo layout made that unnecessary). Icon shows the mode you
  switch *to* — Sun while dark, Moon while light.
- **Scope limitation:** dark styling covers the **shell + tree only** — root background, header,
  footer, `TreeVisualizer`. `AdminPanel` (~4.4k lines) and `AgentPanel` are thousands of hardcoded
  `stone-*`/`white` classes, and [src/index.css](src/index.css) has `!important` rules forcing light
  text inside `.glass-panel`. In dark mode you get a dark shell with the existing light cards.
  Converting those panels is a separate, much larger job.

## 2. Header layout

Three flex columns so the brand sits dead-centre regardless of side-control width:

```
[ ☰ menu ]  ·flex-1·  [ P  SBR Sponsors ]  ·flex-1·  [ ☀/🌙 ]
```

Only those three things live in the header. The session badge, role selector, Sync Cloud,
Passcode Settings and Disconnect were **moved into the drawer** — a centred logo cannot coexist
with five right-side buttons without crowding.

### Sticky header — do not reintroduce `overflow-x-hidden`

The layout root uses **`overflow-x-clip`, not `overflow-x-hidden`**. Per spec `overflow-x: hidden`
computes `overflow-y` to `auto`, which makes that div a scroll container; a `sticky` descendant then
pins to *it* rather than the viewport, so the header scrolls away. `clip` still clips horizontally
without establishing a scroll container. This is why the header appeared non-sticky before.

If the header ever stops sticking again, check every ancestor for `overflow` on either axis first.

## 3. Nav drawer

`NAV_ITEMS` lives at the top of [src/App.tsx](src/App.tsx). Each entry carries an `anchor` — the DOM
id it scrolls to:

| Key | Label | Anchor |
|---|---|---|
| `HOME` | Home | `sbr-top` (scrolls to top) |
| `TREE` | My Tree | `sbr-tree-section` |
| `TEAM` | Team | `sbr-team-section` |
| `INVENTORY` | Plot Inventory | `sbr-inventory-section` |
| `PAYOUTS` | Payouts | `sbr-payouts-section` |
| `USER_DETAIL` | User Detail | `sbr-user-detail` |
| `EDIT_DETAIL` | Edit Detail | `sbr-edit-detail` |

Drawer sections, in order: **identity card** → **Navigate** (the table above) → **Workspace**
(admin-only role switch) → **Account** (Sync Cloud, Passcode Settings, Disconnect).

- **Shown at every breakpoint.** Not `xl:hidden` — logout and sync now live here, so hiding the
  drawer on desktop would make them unreachable. The inline `xl` nav was removed for the same
  reason (it fought the centred logo).
- **No layout shift.** `fixed top-0 left-0 z-50` with a `z-40` backdrop — it overlays content rather
  than pushing it. The earlier inline `{isNavOpen && <nav>}` below the header reflowed the page on
  every open/close.
- **Background scroll is locked** while open via a `useEffect` that sets `document.body.style.overflow`
  and restores the previous value on cleanup (restores, not hardcodes `''`, so it composes with any
  other component doing the same).
- **Close-on-click is deliberate, not uniform.** Workspace switches, passcode and logout close the
  drawer; **Sync Cloud intentionally leaves it open** so the spinner stays visible — closing would
  hide the only feedback that the sync is running.
- **Scrolling is retry-based.** `handleNavSelect` polls for the anchor (10 attempts, 80 ms apart)
  because the target may not be mounted yet — the panels switch sub-tab in response to `navFocus`,
  so the element appears a tick after the click. Do not replace this with a single
  `getElementById` call.
- **Anchors carry `scroll-mt-24`** so the sticky header does not cover the heading being scrolled to.

### `navFocus` prop

`activeNav` is passed to both panels as `navFocus`; each maps it to the view that owns the section:

- **`AdminPanel`** — `TREE` / `TEAM` / `USER_DETAIL` / `EDIT_DETAIL` → `AGENTS` sub-tab;
  `PAYOUTS` → `PAYOUTS` sub-tab; `INVENTORY` → `BOOKINGS` sub-tab (which holds the live inventory
  table). Without this the anchors would not exist in the DOM, since sub-tab content is
  conditionally rendered.
- **`AgentPanel`** — `TREE` / `TEAM` / `PAYOUTS` → `LEDGER` tab; `INVENTORY` → `INVENTORY` tab;
  `USER_DETAIL` expands the KYC section; `EDIT_DETAIL` expands the bank-details section.

**Duplicate ids are intentional.** `sbr-user-detail`, `sbr-inventory-section`, `sbr-tree-section` etc.
exist in *both* panels, but `activeRole` means only one panel is ever mounted, so lookups stay
unambiguous.

## 4. TreeVisualizer

Rewritten from ~950 lines to ~215. See [src/components/TreeVisualizer.tsx](src/components/TreeVisualizer.tsx).

- **Removed:** pan/zoom, drag + pinch gestures, wheel zoom, expand/collapse, search, fullscreen,
  the LIST view toggle, auto-centering on select, and the selected-node details sidebar.
- **Data:** renders the **real** `users` prop. `buildTree()` groups by `sponsorId` and derives
  `directPts` (`totalDirectSales`), `networkPts` (subtree sum) and `teamSize` (recursive count).
  Roots are users whose sponsor is absent from the passed list — so `AgentPanel` (which passes
  `[agent, ...downline]`) correctly roots at the agent.
  A `visited` set guards against a malformed `sponsorId` cycle causing infinite recursion.
- The old `DUMMY_TREE` constant is kept **commented out** at the top for offline design work.
- **Layout:** recursive `TreeBranch` — card, vertical stem, horizontal bridge across siblings,
  drop line into each child. Root centres because every parent centres over its own subtree.
  The connector row uses `self-stretch` with `-mx-1.5` rather than `w-[calc(100%+…)]`; CSS `calc`
  needs spaces around `+`, and relying on Tailwind's operator normalisation is fragile.
- Wrapper is `w-max min-w-full justify-center` inside `overflow-auto`: scrolls when wider than the
  viewport, centres when not.
- **Props are inert except `users`.** `onSelectUser` / `selectedUserId` / `hideUpline` are still
  accepted so the existing call sites type-check, but nothing reads them — selecting a node no
  longer drives the parent panels.

## 5. Agent profile surfaced inline

Previously KYC and bank details lived in a modal gated behind the "SBR Profile 👤" badge.

- The modal is **removed**. Both collapsible sections now render inline in the dashboard, in a
  `<form id="sbr-user-detail">` card alongside the other detail.
- "KYC Compliance (Locked)" and "Profile Info & Bank Details" remain collapsible; they are simply
  no longer hidden behind a click-to-open dialog.
- The badge now calls `scrollToProfile()` — scrolls to the card and expands KYC — instead of
  opening a modal.
- `isProfileOpen` state, the modal header/footer, and the `ArrowLeft` import were deleted with it.

---

## Known gaps

- Nav items **highlight and scroll only**. There is no router; `App` switches views via
  `activeRole`, and there are no distinct Home/Team/Payouts *views* to route to. Making them real
  navigation means either introducing a router or lifting each panel's sub-tab state into `App`.
- Dark mode stops at the shell (see §1).
- Pre-existing type errors in `AdminPanel` (free-text designation assigned to the `LeadershipConfig`
  union) were fixed with `as LeadershipConfig['designation']` casts at the two call sites. The
  underlying issue remains: the "Add Custom Designation Config" form accepts any string, so an
  unrecognised designation silently fails to match the ladder in `designation.ts`.

## Verification

`npm run lint` (`tsc --noEmit`) and `npm run build` — both clean. There is no test framework.
