
## SeatSync Admin — plan

Adds an admin control room inside this project at `/admin/*`, gated behind login. Reuses the existing `seats` and `waitlist` tables and adds `movies`, `screens`, `shows`, plus a `show_id` on `seats`/`waitlist` so multiple shows are supported. Any authenticated user is admin (per your choice); no public sign‑up.

## Schema changes (one migration)

- `movies` — title, poster_url, duration_minutes, rating.
- `screens` — name, rows (int), cols (int).
- `shows` — movie_id, screen_id, cinema, starts_at, status.
- `seats` — add `show_id` (nullable initially, backfilled to a default "Screen 1" show, then set NOT NULL). Existing 192 rows (A–L × 16) become that show's seat map. Add unique (show_id, id).
- `waitlist` — add `show_id` (backfilled from seat's show).
- `admin_activity` — actor_email, action (`lock`/`book`/`release`/`waitlist_remove`), seat_id, show_id, target_phone, details jsonb, created_at.
- RLS + GRANTs: `authenticated` full CRUD on all admin tables; existing public policies on `seats`/`waitlist` kept so the public site keeps working. `admin_activity` is authenticated‑only.
- Realtime publication: add `shows`, `seats`, `waitlist`, `admin_activity`.
- Seed one demo movie + "Screen 1" + one upcoming show so the current 192 seats attach to something visible immediately.

## Routes (TanStack Start)

Public:
- `/auth` — email/password sign‑in (existing Lovable Cloud auth). No sign‑up form.

Authenticated (`_authenticated/admin/*`, uses the managed gate):
- `/admin` — Show list. Cards per show with counts: total / available / locked / booked / waitlisted. Click → seat management.
- `/admin/shows/$showId` — Seat management:
  - Visual seat map (rows A–L × 16) color‑coded: green available, amber locked, cyan booked. Locked seats show a live countdown to `expires_at`.
  - Click a seat → right side panel: status, waitlist queue (phone + joined time, in order), and actions:
    - **Lock for customer** (select a queue entry) — sets `status=locked`, `locked_by=phone`, `expires_at=now()+10m`.
    - **Mark as booked** — `status=booked`, clears lock fields, removes that phone from waitlist.
    - **Release** — `status=available`, clears lock fields; triggers SMS to next in queue via existing `sendSms` server fn ("A seat opened for you…").
  - Every action writes to `admin_activity`.
- `/admin/waitlist` — flat table of all waitlist entries across shows. Search by phone, filter by show/status. Row action: remove entry (logged).
- `/admin/activity` — reverse‑chronological activity log with actor, action, seat, show.

## Server functions (all under `requireSupabaseAuth`)

`src/lib/admin.functions.ts`:
- `listShowsWithCounts` — shows + aggregated seat/waitlist counts.
- `getShowDetail(showId)` — show, seats, waitlist grouped by seat.
- `lockSeat({ showId, seatId, phone })`, `bookSeat({...})`, `releaseSeat({...})` — mutate seat, log activity, and on release call existing `sendSms` to notify next in queue.
- `removeWaitlistEntry({ id })` — delete + log.
- `listActivity({ limit })`.

Public site's existing flows are untouched.

## Realtime

Single subscription hook `useRealtimeShow(showId)` on the seat-management page subscribes to `seats` and `waitlist` filtered by `show_id`, invalidates the relevant React Query keys. Show list page subscribes to `seats`/`waitlist` globally for count updates. Cleaned up on unmount.

## Design

Matches SeatSync's terminal aesthetic — dark bg, monospace headings, amber/cyan/green status chips, "SYSTEM ONLINE" style indicators, thin borders, uppercase labels. Reuses existing tokens in `src/styles.css`; adds admin‑specific components (StatusChip, SeatCell, CountdownBadge, SidePanel) in `src/components/admin/`.

## Out of scope

- No customer‑facing seat selection or waitlist‑join UI in `/admin`.
- No role hierarchy (any signed‑in user is admin, per your answer).
- No changes to the public seat page or existing SMS/Twilio config beyond calling `sendSms` from `releaseSeat`.

## Technical notes

- Lock timer: enforced by `expires_at` column already on `seats`; a lightweight client interval renders remaining time. A follow‑up could add a cron to auto‑expire; not in v1.
- The `_authenticated` layout is integration‑managed (`ssr:false`, redirects to `/auth`); admin routes live under it.
- Public routes stay SSR; admin subtree does not.
