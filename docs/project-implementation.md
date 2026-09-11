# SeatSync — Project Implementation Tracker

**Digital Business Systems | ECD223-3**  
**CHRIST (Deemed to be University), Bengaluru**  
**Faculty:** Dr. Chandravesh Chaudhari

## Team Members
| Name | Roll Number | GitHub |
|---|---|---|
| Apeksha Vemali | 2533312 | apekshavemali |
| Ardra Jyothikumar | 2533313 | ardrajyothikumar |
| Cattamanchi Parthiv Reddy | 2533319 | parthivreddy |
| Pranav S | 2533340 | pranavsanthosh4038-pixel |
| Roopika Yallamelli | 2533345 | roopikayallamelli |

---

## Project Links
- **User App:** https://seat-sync-web.lovable.app
- **Admin Dashboard:** https://seat-sync-web.lovable.app/admin
- **GitHub Repository:** https://github.com/pranavsanthosh4038-pixel/seatsync
- **Supabase Project:** gdmznjfjnyjywzhfqfwf.supabase.co

---

## Implementation Tracker

| Task ID | Task | Component | Assigned To | Status | Completed By | Date Completed | AI Assistance | Evidence |
|---|---|---|---|---|---|---|---|---|
| T001 | Define business problem and select scenario | Planning | All Members | Completed | All Members | 10 Jul 2026 | No | Group discussion |
| T002 | Create Supabase project and configure database | Database | Pranav S | Completed | Pranav S | 10 Jul 2026 | Yes | Supabase dashboard |
| T003 | Create seats table with schema | Database | Pranav S | Completed | Pranav S | 10 Jul 2026 | Yes | Supabase SQL editor |
| T004 | Create waitlist table with schema | Database | Pranav S | Completed | Pranav S | 10 Jul 2026 | Yes | Supabase SQL editor |
| T005 | Seed seats table with rows A-E (30 seats) | Database | Pranav S | Completed | Pranav S | 10 Jul 2026 | Yes | Supabase table editor |
| T006 | Enable Supabase Realtime on seats and waitlist tables | Database/Backend | Pranav S | Completed | Pranav S | 10 Jul 2026 | Yes | Supabase replication settings |
| T007 | Create users table | Database | Pranav S | Completed | Pranav S | 19 Aug 2026 | Yes | db/schema.sql |
| T008 | Create shows table | Database | Pranav S | Completed | Pranav S | 19 Aug 2026 | Yes | db/schema.sql |
| T009 | Create bookings table | Database | Pranav S | Completed | Pranav S | 19 Aug 2026 | Yes | db/schema.sql |
| T010 | Create notifications table | Database | Pranav S | Completed | Pranav S | 19 Aug 2026 | Yes | db/schema.sql |
| T011 | Create admin_logs table | Database | Roopika Yallamelli | Completed | Roopika Yallamelli | 19 Aug 2026 | Yes | db/schema.sql |
| T012 | Design initial SeatSync user interface in Lovable | Frontend | Apeksha Vemali | Completed | Apeksha Vemali | 12 Jul 2026 | Yes | seat-sync-web.lovable.app |
| T013 | Implement movie browsing page with city selection | Frontend | Apeksha Vemali | Completed | Apeksha Vemali | 14 Jul 2026 | Yes | src/pages/Index.tsx |
| T014 | Implement seat map component with row layout | Frontend | Apeksha Vemali | Completed | Apeksha Vemali | 15 Jul 2026 | Yes | src/components/SeatMap.tsx |
| T015 | Implement seat selection logic (up to 8 seats) | Frontend | Apeksha Vemali | Completed | Apeksha Vemali | 15 Jul 2026 | Yes | src/components/SeatMap.tsx |
| T016 | Implement waitlist form with phone number input | Frontend | Apeksha Vemali | Completed | Apeksha Vemali | 16 Jul 2026 | Yes | src/components/WaitlistForm.tsx |
| T017 | Connect frontend to Supabase (client setup) | Backend/Integration | Pranav S | Completed | Pranav S | 10 Jul 2026 | Yes | src/integrations/supabase/client.ts |
| T018 | Implement Supabase Realtime subscription for seat updates | Backend/Integration | Pranav S | Completed | Pranav S | 11 Jul 2026 | Yes | src/components/SeatMap.tsx |
| T019 | Implement waitlist INSERT operation | Backend/Integration | Apeksha Vemali | Completed | Apeksha Vemali | 16 Jul 2026 | Yes | src/components/WaitlistForm.tsx |
| T020 | Implement queue position display after joining waitlist | Frontend | Apeksha Vemali | Completed | Apeksha Vemali | 17 Jul 2026 | Yes | src/components/WaitlistForm.tsx |
| T021 | Implement countdown timer on locked seats | Frontend/Algorithm | Ardra Jyothikumar | Completed | Ardra Jyothikumar | 18 Jul 2026 | Yes | src/components/SeatMap.tsx |
| T022 | Implement seat auto-release when timer expires | Backend/Algorithm | Ardra Jyothikumar | Completed | Ardra Jyothikumar | 18 Jul 2026 | Yes | src/components/SeatMap.tsx |
| T023 | Implement waitlist priority notification algorithm | Backend/Algorithm | Roopika Yallamelli | Completed | Roopika Yallamelli | 20 Jul 2026 | Yes | Retool releaseSeat function |
| T024 | Set up Twilio account and verify phone numbers | External Services | Pranav S | Completed | Pranav S | 11 Jul 2026 | No | Twilio console |
| T025 | Implement SMS notification via Twilio in Retool | Backend/Algorithm | Roopika Yallamelli | Completed | Roopika Yallamelli | 20 Jul 2026 | Yes | Retool releaseSeat function |
| T026 | Implement lockSeatForCustomer Retool function | Backend | Cattamanchi Parthiv Reddy | Completed | Cattamanchi Parthiv Reddy | 22 Jul 2026 | Yes | Retool lockSeatForCustomer |
| T027 | Implement releaseSeat Retool function | Backend | Cattamanchi Parthiv Reddy | Completed | Cattamanchi Parthiv Reddy | 22 Jul 2026 | Yes | Retool releaseSeat |
| T028 | Build admin dashboard UI | Frontend | Cattamanchi Parthiv Reddy | Completed | Cattamanchi Parthiv Reddy | 25 Jul 2026 | Yes | seat-sync-web.lovable.app/admin |
| T029 | Implement live seat map on admin dashboard | Frontend | Cattamanchi Parthiv Reddy | Completed | Cattamanchi Parthiv Reddy | 26 Jul 2026 | Yes | Admin dashboard |
| T030 | Implement waitlist manager on admin dashboard | Frontend | Cattamanchi Parthiv Reddy | Completed | Cattamanchi Parthiv Reddy | 26 Jul 2026 | Yes | Admin dashboard |
| T031 | Implement KPI dashboard (total seats, available, locked, waitlist count) | Frontend | Cattamanchi Parthiv Reddy | Completed | Cattamanchi Parthiv Reddy | 27 Jul 2026 | Yes | Admin dashboard |
| T032 | Implement PIN-based admin authentication | Authentication | Ardra Jyothikumar | Completed | Ardra Jyothikumar | 28 Jul 2026 | Yes | src/components/AdminAuth.tsx |
| T033 | Implement dark/light mode toggle | Frontend | Ardra Jyothikumar | Completed | Ardra Jyothikumar | 29 Jul 2026 | Yes | src/components/Header.tsx |
| T034 | Redesign UI to match District by Zomato aesthetic | Frontend | Apeksha Vemali | Completed | Apeksha Vemali | 01 Aug 2026 | Yes | src/styles/ |
| T035 | Add real movie poster images from TMDB | Frontend | Apeksha Vemali | Completed | Apeksha Vemali | 02 Aug 2026 | Yes | src/data/movies.ts |
| T036 | Add regional movies (Tamil, Telugu, Malayalam, Kannada, Hindi) | Frontend/Data | Apeksha Vemali | Completed | Apeksha Vemali | 03 Aug 2026 | Yes | src/data/movies.ts |
| T037 | Implement YouTube-style sidebar navigation | Frontend | Ardra Jyothikumar | Completed | Ardra Jyothikumar | 05 Aug 2026 | Yes | src/components/Sidebar.tsx |
| T038 | Implement city selector (Bengaluru, Mumbai, Delhi, etc.) | Frontend | Ardra Jyothikumar | Completed | Ardra Jyothikumar | 05 Aug 2026 | Yes | src/components/Header.tsx |
| T039 | Implement category filtering (Movies, Events, Sports, Dining) | Frontend | Ardra Jyothikumar | Completed | Ardra Jyothikumar | 06 Aug 2026 | Yes | src/components/CategoryFilter.tsx |
| T040 | Add AI chat assistant (SeatSync AI) to admin dashboard | Frontend/Integration | Pranav S | Completed | Pranav S | 08 Aug 2026 | Yes | src/components/AIChatWidget.tsx |
| T041 | Fix SMS to send to dynamic phone number from waitlist | Backend/Bug Fix | Pranav S | Completed | Pranav S | 14 Aug 2026 | Yes | Retool releaseSeat function |
| T042 | Add second verified Twilio number for testing | External Services | Pranav S | Completed | Pranav S | 19 Aug 2026 | No | Twilio Verified Caller IDs |
| T043 | Set up Retool admin dashboard with bookSeat function | Backend | Cattamanchi Parthiv Reddy | Completed | Cattamanchi Parthiv Reddy | 10 Aug 2026 | Yes | Retool dashboard |
| T044 | Write docs/architecture.md | Documentation | Ardra Jyothikumar | Completed | Ardra Jyothikumar | 09 Sep 2026 | Yes | docs/architecture.md |
| T045 | Write db/schema.sql with all 7 tables | Database/Documentation | Pranav S | Completed | Pranav S | 09 Sep 2026 | Yes | db/schema.sql |
| T046 | Write project-implementation.md tracker | Documentation | Roopika Yallamelli | Completed | Roopika Yallamelli | 09 Sep 2026 | Yes | docs/project-implementation.md |
| T047 | Push full frontend codebase to GitHub | DevOps | Pranav S | Completed | Pranav S | 09 Sep 2026 | No | GitHub commit history |
| T048 | Implement admin redesign matching main site design language | Frontend | Cattamanchi Parthiv Reddy | Completed | Cattamanchi Parthiv Reddy | 19 Aug 2026 | Yes | Admin dashboard |
| T049 | Test end-to-end waitlist flow (join → release → SMS) | Testing | All Members | Completed | All Members | 19 Aug 2026 | No | Live demo recording |
| T050 | Verify CRUD operations on all database tables | Testing/Database | Pranav S | Completed | Pranav S | 19 Aug 2026 | No | Supabase table editor |

---

## AI Assistance Record

All tasks marked "Yes" under AI Assistance involved one or more of the following:
- **Claude (Anthropic)** — architecture guidance, code generation, documentation writing, debugging
- **Lovable AI** — React component generation and UI implementation
- **GitHub Copilot** — inline code suggestions during development

As per CIA III guidelines, AI tools were used for development assistance. Each student listed as "Completed By" has reviewed, tested, and verified their assigned implementation and can explain it during evaluation.

---

## Status Summary

| Status | Count |
|---|---|
| Completed | 50 |
| In Progress | 0 |
| Pending | 0 |
| Blocked | 0 |

---

*This document serves as the official work log and contribution record for CIA III.*  
*Last updated: 09 September 2026*
