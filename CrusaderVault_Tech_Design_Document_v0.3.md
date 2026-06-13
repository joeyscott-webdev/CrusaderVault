# CrusaderVault
## Technical & Design Document
### Version 0.3

---

## 0. Document Purpose

This document expands on v0.2 with a complete technical outline suitable for
implementation: detailed data model, security model, application structure,
feature specifications, and a sprint-by-sprint build plan. It is the
reference for engineering decisions during the MVP build.

CrusaderVault is a companion app for tabletop wargame campaigns (e.g.
Warhammer 40,000 "Crusade" style play). Players manage campaigns, rosters,
and individual units that gain Honors, Battle Scars, Relics, and Wargear
over the course of a campaign, with printable/shareable unit cards and a
lightweight "Game Mode" for tracking state during a game.

---

## 1. Architecture

### 1.1 Final MVP Technology Stack

**Frontend**
- React 18+
- TypeScript
- Vite
- React Router (v6)
- TanStack Query (server state / caching for Supabase calls)
- Tailwind CSS
- shadcn/ui (Radix-based component library)
- React Hook Form
- Zod (schema validation, shared between forms and Supabase payloads)

**Backend**
No traditional backend for MVP. React communicates directly with Supabase
via `@supabase/supabase-js`.

**Supabase Responsibilities**
- Authentication (email/password, optionally magic link/OAuth)
- PostgreSQL Database
- Storage Buckets (unit images, campaign images, exports)
- Row Level Security (RLS) for all authorization
- Public Share Links (read-only public access via RLS + unguessable tokens)

**Hosting**
- Frontend: Vercel (Preview deployments per PR, Production on `main`)
- Database / Auth / Storage: Supabase (single project, with separate
  staging and production projects if budget allows)

### 1.2 High-Level Architecture Diagram

```
                    ┌─────────────────────────┐
                    │        Browser           │
                    │  React + Vite (SPA)      │
                    │  - React Router          │
                    │  - TanStack Query        │
                    │  - shadcn/ui + Tailwind  │
                    └───────────┬──────────────┘
                                 │ supabase-js (HTTPS)
                                 ▼
                    ┌─────────────────────────┐
                    │        Supabase          │
                    │  ┌─────────────────────┐ │
                    │  │ Auth (GoTrue)        │ │
                    │  ├─────────────────────┤ │
                    │  │ PostgREST API        │ │
                    │  │  + Row Level Security│ │
                    │  ├─────────────────────┤ │
                    │  │ PostgreSQL Database  │ │
                    │  ├─────────────────────┤ │
                    │  │ Storage (S3-compat)  │ │
                    │  ├─────────────────────┤ │
                    │  │ Edge Functions (opt.)│ │
                    │  └─────────────────────┘ │
                    └─────────────────────────┘
```

### 1.3 Design Philosophy

Build the fastest possible MVP without sacrificing data integrity or
security.

**Avoid (for MVP):**
- Express / custom Node API layer
- Custom authentication
- Custom file storage
- Server-rendered pages (no SSR/Next.js)

**Leverage:**
- Supabase client SDK directly from the browser
- Postgres functions/views/triggers for derived data (e.g. roster point
  totals) instead of application-layer computation where practical
- RLS as the single source of truth for authorization — the frontend
  never assumes a permission; it relies on Postgres to enforce it

**Principles**
1. Prefer declarative database constraints (foreign keys, checks, unique
   indexes) over application-level validation where possible.
2. Zod schemas are the single source of truth for form/input validation
   and are reused for type inference (`z.infer`).
3. Every table that holds user data has RLS enabled from the migration
   that creates it — never ship a table without policies.
4. Public/shareable data is exposed through narrow, read-only views or
   policies scoped by a non-guessable `share_token`, never by exposing
   entire tables.

---

## 2. Core MVP Features (Expanded)

1. **Authentication** — Sign up, log in, log out, password reset, session
   persistence.
2. **Campaign Management** — Create/edit/archive campaigns, invite members,
   manage campaign-level settings (point limits, ruleset, supply limit).
3. **Roster Management** — Each member maintains one or more rosters within
   a campaign; tracks total Crusade points, Supply Limit usage.
4. **Unit Cards** — Structured representation of a unit: name, datasheet
   reference, points cost, keywords, current stats/upgrades.
5. **Unit Photos** — Upload and display photos of painted models per unit.
6. **Honors** — Battle Honors (e.g. Crusade Relics, Battle Traits, Weapon
   Modifications, Renowned/Notable rules) attached to units, with XP
   tracking.
7. **Battle Scars** — Negative modifiers/injuries attached to units after
   battles.
8. **Relics** — Campaign-level or unit-level relic items, with rules text
   and assignment to a single unit at a time.
9. **Wargear Notes** — Free-form and structured notes for loadouts/wargear
   options per unit.
10. **QR Codes** — Generate a QR code per unit (and per roster) linking to
    a public read-only view.
11. **Game Mode** — A lightweight in-game tracking UI: mark units
    destroyed/out of action, track Battle-shock, objective markers, victory
    points, and Command Points.
12. **Printable Unit Cards** — Print-optimized CSS layout for unit cards,
    exportable as PDF via browser print dialog (no server-side PDF
    generation for MVP).

---

## 3. Application Structure

### 3.1 Repository Layout

```
CrusaderVault/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── index.tsx              # route definitions
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── campaigns/
│   │   │   ├── CampaignListPage.tsx
│   │   │   ├── CampaignDetailPage.tsx
│   │   │   ├── CampaignSettingsPage.tsx
│   │   │   └── CampaignMembersPage.tsx
│   │   ├── rosters/
│   │   │   ├── RosterListPage.tsx
│   │   │   └── RosterDetailPage.tsx
│   │   ├── units/
│   │   │   ├── UnitDetailPage.tsx
│   │   │   ├── UnitEditPage.tsx
│   │   │   └── UnitPrintPage.tsx
│   │   ├── public/
│   │   │   ├── PublicUnitPage.tsx
│   │   │   └── PublicRosterPage.tsx
│   │   └── game/
│   │       └── GameModePage.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn/ui generated components
│   │   ├── layout/                # AppShell, Nav, Sidebar
│   │   ├── campaigns/
│   │   ├── rosters/
│   │   ├── units/
│   │   │   ├── UnitCard.tsx
│   │   │   ├── UnitForm.tsx
│   │   │   ├── HonorsList.tsx
│   │   │   ├── ScarsList.tsx
│   │   │   ├── RelicsList.tsx
│   │   │   └── WargearNotes.tsx
│   │   ├── qrcode/
│   │   │   └── QRCodeDisplay.tsx
│   │   └── game/
│   │       ├── GameTracker.tsx
│   │       └── ObjectiveMarkerList.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # supabase client instance
│   │   │   ├── types.ts           # generated DB types
│   │   │   └── queries/           # typed query/mutation helpers
│   │   │       ├── campaigns.ts
│   │   │       ├── rosters.ts
│   │   │       ├── units.ts
│   │   │       ├── modifiers.ts   # honors/scars/relics
│   │   │       └── battles.ts
│   │   ├── validation/            # zod schemas
│   │   │   ├── campaign.schema.ts
│   │   │   ├── roster.schema.ts
│   │   │   ├── unit.schema.ts
│   │   │   └── modifier.schema.ts
│   │   ├── hooks/                 # custom hooks wrapping TanStack Query
│   │   │   ├── useCampaigns.ts
│   │   │   ├── useRosters.ts
│   │   │   ├── useUnits.ts
│   │   │   └── useAuth.ts
│   │   └── utils/
│   ├── styles/
│   │   ├── index.css
│   │   └── print.css
│   └── types/
├── supabase/
│   ├── migrations/                # SQL migration files (timestamped)
│   ├── seed.sql
│   └── config.toml
├── .env.example
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

### 3.2 Routing Map

| Path | Page | Auth | Notes |
|---|---|---|---|
| `/login` | LoginPage | Public | Redirect to `/` if authenticated |
| `/signup` | SignupPage | Public | |
| `/reset-password` | ResetPasswordPage | Public | |
| `/` | DashboardPage | Private | List of user's campaigns |
| `/campaigns` | CampaignListPage | Private | |
| `/campaigns/:campaignId` | CampaignDetailPage | Private (member) | |
| `/campaigns/:campaignId/settings` | CampaignSettingsPage | Private (owner) | |
| `/campaigns/:campaignId/members` | CampaignMembersPage | Private (owner) | |
| `/campaigns/:campaignId/rosters` | RosterListPage | Private (member) | |
| `/campaigns/:campaignId/rosters/:rosterId` | RosterDetailPage | Private (member) | |
| `/units/:unitId` | UnitDetailPage | Private (owner) | |
| `/units/:unitId/edit` | UnitEditPage | Private (owner) | |
| `/units/:unitId/print` | UnitPrintPage | Private (owner) | print.css applied |
| `/share/units/:shareToken` | PublicUnitPage | Public | Read-only via RLS |
| `/share/rosters/:shareToken` | PublicRosterPage | Public | Read-only via RLS |
| `/campaigns/:campaignId/game` | GameModePage | Private (member) | |

### 3.3 State Management Strategy

- **Server state** (anything from Supabase): TanStack Query. Query keys are
  structured hierarchically, e.g. `['campaigns']`, `['campaigns', id]`,
  `['campaigns', id, 'rosters']`, `['units', id, 'honors']`. Mutations
  invalidate the relevant key prefixes.
- **Auth state**: a thin `useAuth` hook wrapping
  `supabase.auth.onAuthStateChange`, exposed via React Context at the app
  root.
- **Form state**: React Hook Form + Zod resolvers, local to each form
  component. No global form state.
- **Ephemeral UI state** (modals, tabs, filters): local `useState` /
  `useReducer`. No global UI state library needed for MVP.
- **Game Mode session state**: held in a single reducer
  (`useGameSession`) and persisted to the `battles`/`battle_units` tables
  on each significant change (debounced), so a refresh mid-game does not
  lose state.

---

## 4. Database Design

All tables live in the `public` schema unless noted. Every table has
`id uuid primary key default gen_random_uuid()`, `created_at timestamptz
default now()`, and `updated_at timestamptz default now()` (maintained via
a shared `set_updated_at` trigger), omitted below for brevity except where
relevant.

### 4.1 `profiles`

Mirrors `auth.users`, created via trigger on signup.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, references `auth.users.id` |
| display_name | text | |
| avatar_url | text | nullable, storage path |
| created_at | timestamptz | |

### 4.2 `campaigns`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| owner_id | uuid | FK → profiles.id |
| name | text | not null |
| description | text | nullable |
| ruleset | text | e.g. "10th Edition Crusade" |
| points_limit | integer | nullable, per-game points limit |
| supply_limit | integer | nullable, Crusade Supply Limit |
| status | text | enum: `active`, `archived` |
| image_path | text | nullable, storage path in `campaign-images` |

### 4.3 `campaign_members`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| campaign_id | uuid | FK → campaigns.id, on delete cascade |
| user_id | uuid | FK → profiles.id |
| role | text | enum: `owner`, `member` |
| joined_at | timestamptz | |

Unique constraint on `(campaign_id, user_id)`.

### 4.4 `rosters`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| campaign_id | uuid | FK → campaigns.id, on delete cascade |
| owner_id | uuid | FK → profiles.id |
| name | text | not null |
| faction | text | nullable |
| detachment | text | nullable |
| supply_used | integer | derived (see 4.10) or maintained via trigger |
| notes | text | nullable |

### 4.5 `units`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| roster_id | uuid | FK → rosters.id, on delete cascade |
| name | text | nicknamed unit name (e.g. "Brother Aldric") |
| datasheet_name | text | reference name from rulebook |
| unit_type | text | e.g. `character`, `infantry`, `vehicle` |
| points_cost | integer | not null, default 0 |
| power_rating | integer | nullable |
| crusade_points | integer | default 0, increases with honors |
| xp | integer | default 0 |
| rank | text | e.g. `Battle-ready`, `Blooded`, `Battle-hardened`, `Heroic`, `Legendary` |
| keywords | text[] | nullable |
| models_count | integer | default 1 |
| image_path | text | nullable, storage path in `unit-images` |
| share_token | uuid | default `gen_random_uuid()`, unique, used for public links |
| is_destroyed | boolean | default false (campaign-permanent destruction) |
| sort_order | integer | default 0, for drag-reorder in roster view |

### 4.6 `unit_modifiers`

Generic table for Honors, Battle Scars, Relics, and Wargear notes — a single
polymorphic table simplifies queries and RLS, distinguished by `type`.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| unit_id | uuid | FK → units.id, on delete cascade |
| type | text | enum: `honor`, `scar`, `relic`, `wargear_note` |
| subtype | text | nullable, e.g. for honors: `battle_trait`, `weapon_mod`, `epic_deed`; for relics: campaign relic name |
| title | text | not null |
| description | text | nullable, rules text / flavor |
| effect | text | nullable, mechanical effect summary |
| acquired_at | timestamptz | default now() |
| acquired_in_battle_id | uuid | nullable, FK → battles.id |

Indexes: `(unit_id, type)`.

> **Why polymorphic?** Honors, Scars, Relics, and Wargear Notes share an
> identical shape (title + description + effect + timestamp) and identical
> RLS rules (owner of the parent unit can CRUD). A single table with a
> `type` discriminator avoids four near-identical tables and four near
> identical policy sets. If a type later needs unique columns, it can be
> split out then.

### 4.7 `battles`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| campaign_id | uuid | FK → campaigns.id, on delete cascade |
| name | text | nullable, e.g. "Battle 3: Relic Recovery" |
| mission | text | nullable |
| played_at | date | default current_date |
| notes | text | nullable |
| created_by | uuid | FK → profiles.id |

### 4.8 `battle_participants`

Tracks which rosters took part in a battle and the outcome.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| battle_id | uuid | FK → battles.id, on delete cascade |
| roster_id | uuid | FK → rosters.id |
| result | text | enum: `win`, `loss`, `draw` |
| victory_points | integer | default 0 |
| command_points_remaining | integer | nullable |

### 4.9 `battle_units`

Snapshot of a unit's state during a specific battle (for Game Mode).

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| battle_id | uuid | FK → battles.id, on delete cascade |
| unit_id | uuid | FK → units.id |
| status | text | enum: `active`, `battle_shocked`, `destroyed`, `out_of_action` |
| objective_marker_secured | boolean | default false |
| notes | text | nullable |

### 4.10 Derived / Computed Values

- `rosters.points_total` — **not stored**; computed via a Postgres view
  `roster_totals` summing `units.points_cost` for the roster. Exposed to
  the frontend via `select` against the view.
- `rosters.supply_used` — maintained via trigger on `units` insert/
  update/delete (sum of `points_cost` for non-destroyed units), OR computed
  the same way as `points_total` via the view. **Decision: compute via
  view for MVP** to avoid trigger complexity; revisit if performance
  requires a materialized column.
- `units.crusade_points` — sum of point costs of attached `unit_modifiers`
  of type `honor`/`relic` that have a point cost — for MVP, Crusade Points
  may simply be a manually-entered integer rather than computed, since not
  all editions assign fixed point values to honors. Document as
  manually-editable with optional auto-suggestion later.

### 4.11 Entity Relationship Summary

```
profiles 1───* campaign_members *───1 campaigns
campaigns 1───* rosters
campaigns 1───* battles
rosters   1───* units
rosters   *───* battles  (via battle_participants)
units     1───* unit_modifiers (honors / scars / relics / wargear_notes)
units     1───* battle_units *───1 battles
```

---

## 5. Security Model (Row Level Security)

General pattern: a helper SQL function
`is_campaign_member(campaign_id uuid) returns boolean` (checks
`campaign_members` for `auth.uid()`) is used across policies to avoid
repeating subqueries.

### 5.1 `profiles`
- SELECT: any authenticated user (needed to display member names).
- UPDATE: `auth.uid() = id` only.

### 5.2 `campaigns`
- SELECT: `is_campaign_member(id)`.
- INSERT: `auth.uid() = owner_id` (any authenticated user can create a
  campaign; they become owner).
- UPDATE/DELETE: `auth.uid() = owner_id`.

### 5.3 `campaign_members`
- SELECT: `is_campaign_member(campaign_id)`.
- INSERT: campaign owner only (invite flow), or self-insert if joining via
  an invite-code mechanism (future).
- DELETE: campaign owner, or `user_id = auth.uid()` (leave campaign).

### 5.4 `rosters`
- SELECT: `is_campaign_member(campaign_id)` — campaign members can view
  each other's rosters (typical for shared campaign tracking).
- INSERT/UPDATE/DELETE: `auth.uid() = owner_id`.

### 5.5 `units`
- SELECT (authenticated): `is_campaign_member(roster.campaign_id)` via
  join to `rosters`.
- SELECT (anonymous/public): allowed where `share_token` is presented as a
  query parameter **and** matched — implemented via a separate public
  view/RPC (see 5.7), not by relaxing the table policy itself.
- INSERT/UPDATE/DELETE: `auth.uid() = roster.owner_id` (checked via join).

### 5.6 `unit_modifiers`, `battles`, `battle_participants`, `battle_units`
- Same pattern: SELECT for campaign members (via join chain to
  `campaigns`), write access restricted to the resource owner
  (`units.roster.owner_id` for `unit_modifiers`; `battles.created_by` or
  campaign members for battle data — campaign-shared editing is
  acceptable since battles are collaborative).

### 5.7 Public Share Links

Public pages (`/share/units/:shareToken`, `/share/rosters/:shareToken`) must
not require authentication and must not expose unrelated data. Approach:

- Add `share_token uuid unique default gen_random_uuid()` to `units` (done)
  and `rosters`.
- Create **SECURITY DEFINER Postgres functions** (RPC), e.g.
  `get_public_unit(token uuid)`, that:
  - Run with elevated privileges (bypassing RLS internally).
  - Return only the columns needed for the public unit card (no owner
    IDs, no campaign internals).
  - Are granted `EXECUTE` to the `anon` role.
- The frontend calls `supabase.rpc('get_public_unit', { token })` for
  public pages instead of querying tables directly.

This avoids ever weakening table-level RLS for the `anon` role while still
enabling shareable read-only links.

### 5.8 Storage RLS

- `unit-images/{user_id}/{unit_id}/...` — INSERT/UPDATE/DELETE restricted to
  `auth.uid() = (storage.foldername(name))[1]`. SELECT public (bucket is
  public-read) since images are shown on public share pages; alternatively
  keep bucket private and serve via signed URLs generated through the
  `get_public_unit` RPC.
- `campaign-images/{campaign_id}/...` — write restricted to campaign owner;
  read restricted to campaign members (private bucket + signed URLs) or
  public if campaign images are non-sensitive.
- `exports/{user_id}/...` — fully private, owner-only read/write.

**Decision for MVP:** `unit-images` and `campaign-images` buckets are
**public-read** (simplifies image rendering, no signed URL management);
write access is RLS-restricted as above. `exports` bucket is private.

---

## 6. Storage Bucket Structure

```
unit-images/
  {user_id}/
    {unit_id}/
      original.jpg
      thumbnail.jpg

campaign-images/
  {campaign_id}/
    cover.jpg

exports/
  {user_id}/
    {roster_id}-roster-export.pdf   (future / Phase 2)
```

Image upload flow: client resizes/compresses images (e.g. via
`browser-image-compression`) before upload to keep storage costs and load
times low. Thumbnails generated client-side at upload time (two files
written) for MVP; server-side image transforms via Supabase's image
resizing can replace this later if available on the plan.

---

## 7. Feature Specifications

### 7.1 Authentication
- Email/password signup & login via `supabase.auth.signUp` /
  `signInWithPassword`.
- On signup, a `profiles` row is created automatically via a Postgres
  trigger on `auth.users` insert (`handle_new_user`).
- Password reset via `supabase.auth.resetPasswordForEmail` +
  `/reset-password` page handling the recovery link.
- Session persisted via Supabase's default localStorage persistence;
  `ProtectedRoute` redirects unauthenticated users to `/login`.

### 7.2 Campaign Management
- Create campaign (name, ruleset, points limit, supply limit, optional
  cover image).
- Campaign detail page: overview tab (stats, member list, recent battles),
  rosters tab, battles/history tab.
- Invite members: MVP approach — owner enters a member's email; if a
  matching `profiles` row exists, insert into `campaign_members`. (Future:
  invite links/codes for users without accounts yet.)
- Archive campaign (soft delete via `status = 'archived'`, hidden from
  default dashboard view).

### 7.3 Roster Management
- Each campaign member can create one or more rosters.
- Roster detail shows: faction/detachment, points total (from
  `roster_totals` view), supply used vs. supply limit (progress bar), and
  a list of units (cards or table view, toggle).
- Reordering units via drag-and-drop updates `units.sort_order`.

### 7.4 Unit Cards
- `UnitCard` component renders a compact summary: image thumbnail, name,
  datasheet name, points cost, rank badge, XP, keyword chips, and counts of
  honors/scars/relics.
- `UnitDetailPage` shows the full card plus tabs: Overview, Honors, Scars,
  Relics, Wargear Notes, History (battles the unit participated in).
- `UnitForm` (React Hook Form + Zod) handles create/edit for core fields.

### 7.5 Unit Photos
- Upload via `UnitForm` (file input → compress → upload to
  `unit-images/{user_id}/{unit_id}/`).
- Display in `UnitCard` and `UnitDetailPage`; fallback placeholder image if
  none uploaded.
- Delete/replace image updates `units.image_path` and removes the old
  storage object.

### 7.6 Honors
- Stored as `unit_modifiers` rows with `type = 'honor'`.
- `HonorsList` component: add/edit/remove honor entries (title,
  subtype/category, description, effect text).
- XP and Rank: `units.xp` is manually incremented when honors are
  earned (with a small UI affordance "+1 XP"); `units.rank` is either
  manually selected or auto-suggested based on XP thresholds defined as a
  constant lookup table in `src/lib/utils/rank.ts`.

### 7.7 Battle Scars
- Stored as `unit_modifiers` rows with `type = 'scar'`.
- `ScarsList` mirrors `HonorsList` UI/UX for consistency.
- Scars can optionally reference `acquired_in_battle_id` for traceability.

### 7.8 Relics
- Stored as `unit_modifiers` rows with `type = 'relic'`.
- Relics are unique within a roster: enforced via a partial unique index
  or application-level check ensuring a given `subtype` (relic name) is
  attached to at most one **active** unit per roster — implemented as a
  check in the mutation layer (`lib/supabase/queries/modifiers.ts`) prior
  to insert, plus a DB-level uniqueness constraint scoped via a
  `roster_id` denormalized column on `unit_modifiers` for relics
  (trade-off documented; revisit if this proves awkward).

### 7.9 Wargear Notes
- Stored as `unit_modifiers` rows with `type = 'wargear_note'`.
- Free-form rich text (Markdown subset rendered via a lightweight
  renderer) for loadout descriptions, e.g. "Power fist swapped for
  combi-weapon after Battle 4."

### 7.10 QR Codes
- `QRCodeDisplay` component generates a QR code (via `qrcode.react` or
  similar) encoding the full public URL:
  `https://{app-domain}/share/units/{share_token}`.
- Available on `UnitDetailPage` and `UnitPrintPage`; QR for rosters
  available on `RosterDetailPage`.
- Regeneration: owner can rotate `share_token` (invalidating old QR codes)
  via a "Reset share link" action.

### 7.11 Game Mode
- `GameModePage` lets a campaign member start a new `battles` record,
  select participating rosters (creating `battle_participants` rows), and
  for each unit in those rosters create a `battle_units` row with
  `status = 'active'`.
- `GameTracker` UI: per-unit controls to toggle status (Battle-shocked,
  Destroyed, Out of Action), per-roster Victory Points counter, Command
  Points counter.
- `ObjectiveMarkerList`: simple list of objective markers (1–6) with a
  toggle for which roster currently controls each, stored as JSON on the
  `battles` row (`objectives jsonb`) to avoid another table for MVP.
- On battle end, units marked `destroyed` can optionally be marked
  `units.is_destroyed = true` (prompt presented to the owning player).

### 7.12 Printable Unit Cards
- `UnitPrintPage` renders the same data as `UnitDetailPage` but with a
  print-specific layout (`print.css`, `@media print` rules): fixed
  card-sized dimensions (e.g. 2.5" x 3.5" poker-card size or letter-page
  grid of cards), no navigation chrome, QR code included.
- Users use the browser's native print-to-PDF for export — no server-side
  PDF generation in MVP (deferred to "Future Expansion").

---

## 8. Validation Schemas (Zod) — Representative Examples

```ts
// src/lib/validation/unit.schema.ts
export const unitSchema = z.object({
  name: z.string().min(1).max(80),
  datasheet_name: z.string().min(1).max(80),
  unit_type: z.enum(['character', 'infantry', 'vehicle', 'monster', 'other']),
  points_cost: z.number().int().min(0),
  power_rating: z.number().int().min(0).optional(),
  models_count: z.number().int().min(1).default(1),
  keywords: z.array(z.string()).optional(),
});
export type UnitInput = z.infer<typeof unitSchema>;

// src/lib/validation/modifier.schema.ts
export const unitModifierSchema = z.object({
  type: z.enum(['honor', 'scar', 'relic', 'wargear_note']),
  subtype: z.string().max(60).optional(),
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  effect: z.string().max(500).optional(),
});
export type UnitModifierInput = z.infer<typeof unitModifierSchema>;
```

---

## 9. Future Expansion

Only introduce backend services (Edge Functions, dedicated API) if needed
for:

- **PDF generation** — server-side rendering of multi-page army rosters as
  PDF (e.g. via a headless browser Edge Function).
- **Email notifications** — campaign invites, battle reminders (Supabase
  Edge Functions + a transactional email provider).
- **Payments** — premium tiers (e.g. unlimited campaigns) via
  Stripe + Edge Functions for webhook handling.
- **Analytics** — aggregate campaign/usage stats beyond what client-side
  analytics tools provide.
- **Scheduled jobs** — e.g. periodic cleanup of orphaned storage objects,
  computed via Supabase cron (`pg_cron`) + Edge Functions.

Until then: no backend required.

---

## 10. Build Plan

### Sprint 1 — Foundations
- Initialize Vite + React + TypeScript project; configure Tailwind +
  shadcn/ui.
- Create Supabase project; configure environment variables (`.env`,
  `.env.example`).
- Set up `supabase/migrations` with initial schema: `profiles`,
  `campaigns`, `campaign_members`, RLS policies, `handle_new_user` trigger.
- Authentication: signup, login, logout, protected routing, session
  context (`useAuth`).
- Campaign CRUD: list, create, view, edit, archive.
- Roster CRUD: list within campaign, create, edit, delete.

### Sprint 2 — Units
- Migration: `units` table + RLS, `unit-images` storage bucket + policies.
- Unit CRUD: create/edit/delete within a roster, drag-reorder
  (`sort_order`).
- Unit image upload + display (with client-side compression/thumbnail).
- `UnitCard` and `UnitDetailPage` (Overview tab) UI.
- `roster_totals` view for points/supply totals; display on
  `RosterDetailPage`.

### Sprint 3 — Progression Data
- Migration: `unit_modifiers` table + RLS (covers Honors, Scars, Relics,
  Wargear Notes).
- `HonorsList`, `ScarsList`, `RelicsList`, `WargearNotes` components and
  tabs on `UnitDetailPage`.
- XP and Rank tracking on units (`xp`, `rank` fields + rank lookup table).
- Relic uniqueness-per-roster validation in mutation layer.

### Sprint 4 — Sharing & Game Mode
- Migration: `share_token` columns, public RPCs (`get_public_unit`,
  `get_public_roster`).
- `/share/units/:shareToken` and `/share/rosters/:shareToken` public pages.
- QR code generation (`QRCodeDisplay`) on unit/roster detail pages.
- Migration: `battles`, `battle_participants`, `battle_units` + RLS.
- `GameModePage`, `GameTracker`, `ObjectiveMarkerList`; battle history on
  campaign detail page.

### Sprint 5 — Printable Cards & Polish
- `UnitPrintPage` + `print.css` for print-optimized unit cards.
- Multi-card print layout (grid for printing a full roster's cards).
- Accessibility pass (keyboard navigation, ARIA labels on shadcn
  components).
- Empty states, loading skeletons, error boundaries.
- Final RLS audit (verify every table/policy with test accounts across
  roles: owner, member, non-member, anonymous).
- Deploy: Vercel production deployment, Supabase production project,
  environment variable configuration, smoke test.

---

## 11. Open Questions / Decisions Deferred

- Should `campaign_members` invites work via email lookup only, or support
  invite links for users without existing accounts? (Deferred to Sprint
  1 implementation; placeholder UI for "invite by email" only in MVP.)
- Are Crusade Points computed automatically from honors/relics with fixed
  point values, or manually entered? (MVP: manual entry; revisit per
  ruleset.)
- Multi-roster Game Mode for >2 players — data model
  (`battle_participants` as a join table) already supports N participants,
  but `GameTracker` UI for >2 players is not explicitly designed in MVP and
  should be validated against real campaign sizes.
