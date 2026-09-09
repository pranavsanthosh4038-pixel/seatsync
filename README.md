# Seat Sync Live

Build a full-stack movie ticket waitlist web app called SeatSync for Bengaluru, India.

Tech stack: React frontend + Supabase backend (database + realtime)

CORE CONCEPT:

Every show listed is "sold out". Users can join a waitlist for specific seats. When a seat is released (via a demo admin panel), the first person in the waitlist queue gets notified. This simulates BookMyShow's intelligent cancellation and load management system.

DATABASE (Supabase):

Create two tables:

1. seats: id (text, primary key), row_label (text), seat_number (int), status (text, default 'available'), locked_by (text), locked_at (timestamp), expires_at (timestamp)

2. waitlist: id (uuid), seat_id (text, foreign key to seats), phone (text), position (int), joined_at (timestamp), notified (boolean default false)

Seed the seats table with rows A through L, 16 seats per row (A1 to L16), all status = 'available'

DESIGN STYLE:

- Background: pure black (#000000)

- Panels/cards: #0d0d0d and #121212

- Primary accent: neon cyan (#00f0ff) with text-shadow: 0 0 10px #00f0ff

- Secondary: neon violet (#bf00ff)

- Available seats: neon green (#00ff88) with glow

- Locked seats: neon amber (#ffcc00) with pulse animation

- Selected seats: neon cyan glow

- Font: Orbitron (headings) + Space Mono (labels/data) from Google Fonts

- Overall vibe: dark sci-fi cinema terminal

VIEWS:

VIEW 1 - Movie Browser:

Show a grid of 8 Bengaluru movies currently in theatres (use real recent titles like Alpha, Toy Story 5, Minions & Monsters, Nagabandham, etc). Each card shows movie name, genre, theatres and showtimes. Every showtime shows "X people waiting". Clicking a showtime opens the seat map.

VIEW 2 - Seat Picker:

- Show an auditorium layout with rows A-L, 16 seats each, split into 3 blocks with aisle gaps

- Load real seat states from Supabase

- Available seats glow green, locked seats pulse amber with a live countdown timer (MM:SS) showing when they auto-release

- User can select up to 8 seats

- Right panel shows selected seat chips + phone number input field + "Join Waitlist" button

- On form submit, save to Supabase waitlist table and show confirmation with queue position

- Subscribe to Supabase Realtime so seat states update live without page refresh

- When a seat goes from locked → available, show a toast notification and check waitlist

ADMIN DEMO PANEL (bottom-right corner):

- Amber/gold bordered floating panel

- Dropdown to select any seat

- "Lock Seat (2 min timer)" button - updates seat status to 'locked' in Supabase with expires_at = now + 2 minutes

- "Release Seat Now" button - updates seat status back to 'available' in Supabase

- When released, system checks waitlist and shows a toast saying who would be notified

COUNTDOWN TIMER LOGIC:

When a seat is locked, a visible countdown timer appears above it (e.g. "1:47"). When timer hits zero, the seat automatically updates to 'available' in Supabase via a client-side function call.

REALTIME:

Use Supabase's postgres_changes subscription on the seats table so all users see seat changes instantly.

TOAST NOTIFICATIONS:

- Green toast when a seat becomes available: "Seat A4 is now FREE!"

- Cyan toast when waitlist joined: "You're #3 in queue for A4"

- Amber toast when seat is locked: "Seat A4 locked — releases in 2 min"

Make it look like a real premium cinema app, not a prototype. Every element should have the neon glow effect. The seat grid should fan out slightly wider toward the back rows to mimic a real auditorium perspective.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://seat-sync-web.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b93c8286-8087-49c6-b45e-a317f929c587).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
