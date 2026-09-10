-- SeatSync Database Schema
-- Digital Business Systems | ECD223-3
-- CHRIST (Deemed to be University), Bengaluru

-- ============================================================
-- TABLE 1: seats
-- Stores all seat information and real-time status
-- ============================================================
create table if not exists seats (
  id text primary key,                    -- e.g. A1, B3, C12
  row_label text not null,                -- e.g. A, B, C
  seat_number int not null,              -- e.g. 1, 2, 3
  status text not null default 'available', -- available | locked | confirmed
  locked_by text,                        -- phone number of user who locked it
  locked_at timestamp,                   -- when the lock was placed
  expires_at timestamp,                  -- when the lock auto-expires
  confirmed_by text                      -- phone number of confirmed booking
);

-- ============================================================
-- TABLE 2: waitlist
-- Stores users waiting for a specific seat
-- ============================================================
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  seat_id text references seats(id),     -- which seat they want
  phone text not null,                   -- user's phone number (identifier)
  position int not null,                 -- queue position (1 = first in line)
  joined_at timestamp default now(),     -- when they joined the queue
  notified boolean default false         -- whether SMS has been sent to them
);

-- ============================================================
-- TABLE 3: users
-- Stores registered user profiles
-- ============================================================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,            -- primary identifier (phone number)
  name text,                             -- user's full name
  email text,                            -- user's email address
  city text default 'Bengaluru',         -- user's preferred city
  created_at timestamp default now(),    -- account creation date
  last_active timestamp default now()    -- last platform interaction
);

-- ============================================================
-- TABLE 4: shows
-- Stores movie/event show details
-- ============================================================
create table if not exists shows (
  id text primary key,                   -- e.g. alpha-pvr-1100am-10jul
  movie_title text not null,             -- e.g. Alpha
  theatre_name text not null,            -- e.g. PVR Orion, Old Madras Road
  city text not null,                    -- e.g. Bengaluru
  show_time text not null,               -- e.g. 11:00 AM
  show_date date not null,               -- e.g. 2026-07-10
  format text default '2D',             -- 2D | 3D | IMAX
  total_seats int default 96,            -- total seats in auditorium
  available_seats int default 0,         -- currently available seats
  price_classic int default 220,         -- Classic tier price (rows F-H)
  price_prime int default 320,           -- Prime tier price (rows C-E)
  price_recliner int default 450,        -- Recliner tier price (rows A-B)
  status text default 'housefull',       -- housefull | available
  created_at timestamp default now()
);

-- ============================================================
-- TABLE 5: bookings
-- Stores confirmed ticket bookings
-- ============================================================
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_phone text references users(phone), -- who booked
  seat_id text references seats(id),       -- which seat
  show_id text references shows(id),       -- which show
  status text default 'confirmed',         -- confirmed | cancelled | expired
  booked_at timestamp default now(),       -- when booking was confirmed
  amount_paid int,                         -- amount paid in INR
  payment_method text default 'UPI',       -- UPI | Card | Wallet
  transaction_id text                      -- payment gateway transaction ID
);

-- ============================================================
-- TABLE 6: notifications
-- Stores all SMS notifications sent to users
-- ============================================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null,              -- recipient phone number
  seat_id text references seats(id),     -- related seat
  show_id text references shows(id),     -- related show
  message text not null,                 -- SMS message content
  type text default 'sms',              -- sms | email | push
  status text default 'sent',           -- sent | delivered | failed
  sent_at timestamp default now(),       -- when notification was sent
  delivered boolean default false,       -- delivery confirmation
  twilio_sid text                        -- Twilio message SID for tracking
);

-- ============================================================
-- TABLE 7: admin_logs
-- Stores all admin actions for audit trail
-- ============================================================
create table if not exists admin_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,                  -- SEAT_LOCKED | SEAT_RELEASED | WAITLIST_NOTIFIED
  seat_id text,                          -- affected seat
  show_id text,                          -- affected show
  phone text,                            -- affected user phone
  details text,                          -- additional context
  performed_by text default 'admin',     -- who performed the action
  created_at timestamp default now()     -- when action was performed
);

-- ============================================================
-- RELATIONSHIPS SUMMARY
-- seats (1) → waitlist (many)       : one seat has many waitlist entries
-- seats (1) → bookings (many)       : one seat can have booking history
-- seats (1) → notifications (many)  : one seat triggers many notifications
-- users (1) → bookings (many)       : one user can have many bookings
-- shows (1) → seats (many)          : one show has many seats
-- shows (1) → bookings (many)       : one show has many bookings
-- ============================================================

-- ============================================================
-- SEED DATA: Insert seats (Rows A-E, 6 seats each = 30 seats)
-- ============================================================
insert into seats (id, row_label, seat_number) values
('A1','A',1),('A2','A',2),('A3','A',3),('A4','A',4),('A5','A',5),('A6','A',6),
('B1','B',1),('B2','B',2),('B3','B',3),('B4','B',4),('B5','B',5),('B6','B',6),
('C1','C',1),('C2','C',2),('C3','C',3),('C4','C',4),('C5','C',5),('C6','C',6),
('D1','D',1),('D2','D',2),('D3','D',3),('D4','D',4),('D5','D',5),('D6','D',6),
('E1','E',1),('E2','E',2),('E3','E',3),('E4','E',4),('E5','E',5),('E6','E',6)
on conflict (id) do nothing;
