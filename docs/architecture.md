# SeatSync — System Architecture

**Digital Business Systems | ECD223-3**  
**CHRIST (Deemed to be University), Bengaluru**  
**Group:** Apeksha Vemali · Ardra Jyothikumar · Cattamanchi Parthiv Reddy · Pranav S · Roopika Yallamelli  
**Faculty:** Dr. Chandravesh Chaudhari

---

## 1. Business Problem and Target Users

### Problem
BookMyShow, India's largest online entertainment ticketing platform, has no waitlist mechanism. When a payment fails or a booking is cancelled, the seat silently returns to the available pool with no notification to interested users. During high-demand events such as blockbuster releases or IPL matches, this causes:

- **Revenue leakage** from phantom inventory — seats stuck in "locked" state after payment failure appear unavailable despite no confirmed booking
- **Poor user experience** — users who wanted a seat have no way of knowing it freed up except by manually refreshing
- **System overload** — thousands of users repeatedly refreshing during sold-out events causes unnecessary server load
- **Legal exposure** — BookMyShow was fined ₹10,000 by the Hyderabad District Consumer Commission for failing to notify a customer about a show cancellation

### Proposed Solution
SeatSync is an Intelligent Cancellation and Load Management System that adds a dynamic waitlisting layer to the ticketing workflow. When a seat is released, the system automatically detects it, queries the waitlist queue, and notifies the next eligible user via SMS.

### Target Users
- **Customers** — urban movie-goers in Indian metros aged 18–45 who want to book tickets for sold-out shows
- **Admins/Managers** — BookMyShow operations staff who monitor seat inventory, manage waitlists, and handle escalations

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + TypeScript (via Lovable) | User interface and admin dashboard |
| Styling | Tailwind CSS + DM Sans | Responsive, clean UI design |
| Backend/API | Supabase REST API (auto-generated) | All data operations via RESTful endpoints |
| Database | PostgreSQL (via Supabase) | Persistent data storage |
| Realtime | Supabase Realtime (WebSockets) | Live seat state updates across all clients |
| Authentication | PIN-based admin access + phone identification | Role-based access control |
| SMS Notifications | Twilio API | SMS alerts when waitlisted seat becomes available |
| Admin Functions | Retool serverless functions | Backend business logic (lock, release, notify) |
| Deployment | Lovable.app (frontend) + Supabase cloud (backend) | Hosted production environment |
| Version Control | GitHub | Code management and collaboration |

---

## 3. Current System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                        │
│                                                             │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │   User Application   │    │   Admin Dashboard        │  │
│  │  seat-sync-web.      │    │  seat-sync-web.          │  │
│  │  lovable.app         │    │  lovable.app/admin       │  │
│  │                      │    │                          │  │
│  │  - Movie browsing    │    │  - Live seat map         │  │
│  │  - Seat selection    │    │  - Waitlist manager      │  │
│  │  - Waitlist form     │    │  - Lock/release seats    │  │
│  │  - Queue position    │    │  - KPI dashboard         │  │
│  └──────────┬───────────┘    └────────────┬─────────────┘  │
│             │                             │                  │
└─────────────┼─────────────────────────────┼─────────────────┘
              │  Supabase JS Client          │  Retool Functions
              │  (REST API + WebSockets)     │  (lockSeat, releaseSeat)
              ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  SUPABASE                           │   │
│  │                                                     │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐  │   │
│  │  │ REST API    │  │  Realtime    │  │  Edge    │  │   │
│  │  │ (auto-gen)  │  │  WebSockets  │  │Functions │  │   │
│  │  └──────┬──────┘  └──────┬───────┘  └────┬─────┘  │   │
│  │         │                │               │         │   │
│  │  ┌──────▼────────────────▼───────────────▼──────┐  │   │
│  │  │           PostgreSQL Database                 │  │   │
│  │  │                                               │  │   │
│  │  │  seats | waitlist | users | shows |           │  │   │
│  │  │  bookings | notifications | admin_logs        │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────┐         ┌────────────────────────┐   │
│  │  Twilio API      │         │  Retool Backend        │   │
│  │  (SMS sending)   │◄────────│  (business logic)      │   │
│  └──────────────────┘         └────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Data Flow Between Major Components

### Flow 1: User Joins Waitlist
```
1. User selects seat on SeatSync website
2. User enters phone number and clicks "Join Waitlist"
3. React frontend calls Supabase REST API
4. INSERT into waitlist table (seat_id, phone, position, joined_at)
5. Supabase returns success + queue position
6. Frontend displays confirmation: "You're #3 in line"
7. INSERT into notifications table (log the waitlist join event)
```

### Flow 2: Seat Released → SMS Notification (Core Business Algorithm)
```
1. Admin clicks "Release Seat" in Retool dashboard
2. Retool releaseSeat function fires
3. UPDATE seats SET status='available' WHERE id='A1'
4. Supabase Realtime detects the change
5. WebSocket event broadcast to ALL connected browsers
6. All users' seat maps update instantly (A1 turns green)
7. Retool queries waitlist:
   SELECT * FROM waitlist 
   WHERE seat_id='A1' AND notified=false 
   ORDER BY position ASC LIMIT 1
8. Gets first person in queue (e.g. +919000368389, position 1)
9. Retool calls Twilio API → SMS sent to +919000368389:
   "Your waitlisted seat A1 is now available! 
    Confirm within 5 minutes at seatsync.in"
10. UPDATE waitlist SET notified=true WHERE id=[entry_id]
11. INSERT into notifications table (log the SMS sent)
12. INSERT into admin_logs (log the seat release action)
```

### Flow 3: Admin Locks a Seat
```
1. Admin selects seat in Retool admin panel
2. Retool lockSeatForCustomer function fires
3. UPDATE seats SET 
   status='locked', 
   locked_by='admin', 
   locked_at=now(), 
   expires_at=now()+interval'10 minutes'
   WHERE id='A1'
4. Supabase Realtime broadcasts change
5. All browsers see A1 turn amber with countdown timer
6. After 10 minutes, expires_at passes
7. Client-side timer detects expiry
8. Calls Supabase to reset: UPDATE seats SET status='available'
9. Waitlist notification flow triggers (Flow 2)
```

---

## 5. Database Schema and Relationships

### Entity Relationship Overview

```
users (1) ──────────────────────── bookings (many)
  │ phone                              │ user_phone (FK)
  │                                    │ seat_id (FK)
  │                                    │ show_id (FK)
  │                                    │
shows (1) ──────────────────────── bookings (many)
  │ id                                 │
  │                                    │
seats (1) ──────────────────────── waitlist (many)
  │ id                                 │ seat_id (FK)
  │                                    │
seats (1) ──────────────────────── notifications (many)
  │ id                                 │ seat_id (FK)
  │                                    │
seats (1) ──────────────────────── bookings (many)
    id                                   seat_id (FK)
```

### Tables and Key Attributes

| Table | Primary Key | Key Attributes | Purpose |
|---|---|---|---|
| seats | id (text) | row_label, seat_number, status, locked_by, expires_at | Real-time seat state management |
| waitlist | id (uuid) | seat_id, phone, position, joined_at, notified | Queue management |
| users | id (uuid) | phone (unique), name, email, city | Customer profiles |
| shows | id (text) | movie_title, theatre_name, show_time, format, price tiers | Event/show details |
| bookings | id (uuid) | user_phone, seat_id, show_id, status, amount_paid | Transaction records |
| notifications | id (uuid) | user_phone, seat_id, message, type, status, twilio_sid | SMS audit trail |
| admin_logs | id (uuid) | action, seat_id, phone, details, performed_by | Admin audit trail |

### Identifiable Relationships (5+)
1. `waitlist.seat_id` → `seats.id` (many waitlist entries per seat)
2. `bookings.seat_id` → `seats.id` (many bookings per seat over time)
3. `bookings.show_id` → `shows.id` (many bookings per show)
4. `bookings.user_phone` → `users.phone` (many bookings per user)
5. `notifications.seat_id` → `seats.id` (many notifications per seat)
6. `notifications.show_id` → `shows.id` (many notifications per show)

---

## 6. Business Algorithm: Waitlist Priority Notification System

### Problem Being Solved
When a seat becomes available, the system must fairly determine which waitlisted user should be notified first and trigger the notification automatically without manual intervention.

### Algorithm: FIFO Waitlist Priority with TTL Confirmation Window

**Input:**
- `seat_id` — the seat that just became available
- `waitlist` table — all entries for this seat where `notified = false`

**Processing Logic:**
```
FUNCTION notifyNextInQueue(seat_id):
  
  // Step 1: Find first unnotified person in queue
  entry = SELECT * FROM waitlist 
          WHERE seat_id = seat_id 
          AND notified = false 
          ORDER BY position ASC 
          LIMIT 1
  
  // Step 2: If no one is waiting, exit
  IF entry is null THEN
    RETURN "No waitlist entries for this seat"
  
  // Step 3: Send SMS notification via Twilio
  sms_result = Twilio.send(
    to: entry.phone,
    message: "Your seat " + seat_id + " is now available! 
              Confirm within 5 minutes."
  )
  
  // Step 4: Mark as notified in database
  UPDATE waitlist 
  SET notified = true 
  WHERE id = entry.id
  
  // Step 5: Log notification
  INSERT INTO notifications 
  (user_phone, seat_id, message, type, status, twilio_sid)
  VALUES (entry.phone, seat_id, message, 'sms', 'sent', sms_result.sid)
  
  // Step 6: Start 5-minute confirmation window
  // If user doesn't confirm in 5 minutes,
  // repeat algorithm for next person in queue
  
  RETURN "Notification sent to " + entry.phone
```

**Output:**
- SMS delivered to next eligible user
- `waitlist.notified` updated to `true`
- Entry in `notifications` table with Twilio SID
- Entry in `admin_logs` with action `WAITLIST_NOTIFIED`

**Pseudocode — Seat Lock Expiry:**
```
FUNCTION checkSeatExpiry():
  locked_seats = SELECT * FROM seats 
                 WHERE status = 'locked' 
                 AND expires_at < now()
  
  FOR EACH seat IN locked_seats:
    UPDATE seats SET status = 'available' WHERE id = seat.id
    notifyNextInQueue(seat.id)
```

**Example Input:**
```
seat_id = "A4"
waitlist entries for A4:
  - position 1: phone=+919000368389, notified=false
  - position 2: phone=+918590482082, notified=false
  - position 3: phone=+919876543210, notified=false
```

**Example Output:**
```
SMS sent to +919000368389: 
"Your waitlisted seat A4 is now available! 
 Confirm within 5 minutes at seatsync.in"

waitlist updated: position 1 → notified=true
notifications log: new entry with twilio_sid=SM123abc
admin_logs: WAITLIST_NOTIFIED for seat A4
```

**Where Implemented:**
- Retool function: `releaseSeat` (seat release + notification trigger)
- Retool function: `lockSeatForCustomer` (seat locking with TTL)
- Supabase Realtime: WebSocket subscription in `src/integrations/supabase/client.ts`
- Frontend countdown timer: `src/components/SeatMap.tsx`

---

## 7. Authentication and Authorization

### User Side (Customer)
- **Identification method:** Phone number entered in waitlist form
- **No password required** — phone number acts as the unique identifier
- Each waitlist entry is tied to a phone number
- When a seat is released, only the phone number at position 1 receives the SMS

### Admin Side
- **PIN-based authentication** — 4-digit PIN (2533) required to access admin panel
- Admin panel accessible via hamburger menu → "Admin Panel" → PIN entry modal
- 3 incorrect attempts triggers lockout message
- Retool dashboard has separate authentication via Retool account login
- **Role separation:** Regular users cannot access admin functions; admin panel is a separate route (`/admin`)

---

## 8. Current Hosting and Deployment

| Component | Hosting | URL |
|---|---|---|
| User frontend | Lovable.app (React/Vite) | https://seat-sync-web.lovable.app |
| Admin dashboard | Lovable.app (/admin route) | https://seat-sync-web.lovable.app/admin |
| Database | Supabase cloud (PostgreSQL) | gdmznjfjnyjywzhfqfwf.supabase.co |
| Realtime engine | Supabase cloud (WebSockets) | Same Supabase project |
| Admin functions | Retool cloud | pranavsanthosh4038.retool.com |
| SMS | Twilio cloud | api.twilio.com |

**Deployment approach:** All services are managed cloud platforms requiring no server provisioning. Lovable auto-deploys on every code push. Supabase manages database scaling automatically.

---

## 9. Proposed Cloud Deployment Architecture (AWS)

For production deployment at scale, the following AWS architecture is proposed:

```
                          ┌─────────────────┐
                          │   Route 53      │
                          │   (DNS)         │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │  CloudFront CDN │
                          │  (Static assets)│
                          └────────┬────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   Application Load Balancer  │
                    └──────────────┬──────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────▼───────┐  ┌────────▼───────┐  ┌────────▼───────┐
     │   EC2 Instance │  │   EC2 Instance │  │   EC2 Instance │
     │   (React App)  │  │   (React App)  │  │   (React App)  │
     │   Auto Scaling │  │   Auto Scaling │  │   Auto Scaling │
     └────────┬───────┘  └────────┬───────┘  └────────┬───────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────▼───────┐  ┌────────▼───────┐  ┌────────▼───────┐
     │  API Gateway   │  │  ElastiCache   │  │  Lambda        │
     │  (REST APIs)   │  │  (Redis)       │  │  (Seat expiry) │
     │                │  │  Seat locks    │  │  Notification  │
     └────────┬───────┘  └────────────────┘  │  triggers      │
              │                               └────────┬───────┘
              │                                        │
     ┌────────▼───────────────────────────────────────▼───────┐
     │                    Amazon RDS                           │
     │              (PostgreSQL Multi-AZ)                      │
     │   seats | waitlist | users | shows | bookings          │
     └────────────────────────────────────────────────────────┘
              │
     ┌────────▼───────┐         ┌────────────────────┐
     │   Amazon SQS   │         │   Amazon SNS       │
     │  (Notification │────────►│   → Twilio/MSG91   │
     │   queue)       │         │   (SMS delivery)   │
     └────────────────┘         └────────────────────┘
              │
     ┌────────▼───────┐
     │   Amazon S3    │
     │  (Static files │
     │   + backups)   │
     └────────────────┘
```

### AWS Services Mapping

| Component | AWS Service | Purpose |
|---|---|---|
| Frontend hosting | EC2 + Auto Scaling | React app servers |
| CDN | CloudFront | Fast global content delivery |
| DNS | Route 53 | Domain management |
| Load balancing | Application Load Balancer | Distribute traffic |
| API layer | API Gateway | RESTful endpoint management |
| Seat locking | ElastiCache (Redis) | In-memory TTL-based seat locks |
| Database | RDS PostgreSQL (Multi-AZ) | Persistent data with failover |
| Serverless logic | AWS Lambda | Seat expiry + notification triggers |
| Notification queue | Amazon SQS | Buffer SMS requests during spikes |
| SMS routing | Amazon SNS → Twilio | Multi-channel notification delivery |
| Static storage | Amazon S3 | Assets, backups, e-tickets |
| Monitoring | CloudWatch | Logs, alerts, performance metrics |
| Security | IAM + VPC + WAF | Access control and network isolation |

---

## 10. Scalability Analysis

### 10.1 User Growth Projection

**Formula:** Users(n) = Initial × (1 + growth_rate)^n  
**Starting users:** 10,000 | **Growth rate:** 25% per year

| Year | Formula | Calculation | Result | Interpretation |
|---|---|---|---|---|
| Year 1 | 10,000 × (1.25)^1 | 10,000 × 1.25 | **12,500** | Small regional deployment |
| Year 2 | 10,000 × (1.25)^2 | 10,000 × 1.5625 | **15,625** | Growing user base |
| Year 3 | 10,000 × (1.25)^3 | 10,000 × 1.953 | **19,531** | Need horizontal scaling |
| Year 4 | 10,000 × (1.25)^4 | 10,000 × 2.441 | **24,414** | Multi-region consideration |
| Year 5 | 10,000 × (1.25)^5 | 10,000 × 3.052 | **30,518** | Enterprise-scale infrastructure |

### 10.2 Peak Concurrent Users

**Formula:** Peak Concurrent Users = Registered Users × 10%  
**Assumption:** 10% of registered users active simultaneously at peak

| Registered Users | Formula | Calculation | Peak Concurrent | Interpretation |
|---|---|---|---|---|
| 100,000 | 100,000 × 0.10 | 100,000 × 0.10 | **10,000** | Single server cluster sufficient |
| 500,000 | 500,000 × 0.10 | 500,000 × 0.10 | **50,000** | Need load balancer + 3-5 servers |
| 1,000,000 | 1,000,000 × 0.10 | 1,000,000 × 0.10 | **100,000** | Auto-scaling groups required |
| 5,000,000 | 5,000,000 × 0.10 | 5,000,000 × 0.10 | **500,000** | Multi-region AWS deployment needed |

### 10.3 Requests Per Minute and Per Second

**Formula:** RPM = Active Users × 5 requests/min | RPS = RPM ÷ 60  
**Assumption:** Each active user generates 5 requests/minute during peak

| Active Users | RPM Formula | RPM | RPS Formula | RPS | Interpretation |
|---|---|---|---|---|---|
| 10,000 | 10,000 × 5 | **50,000** | 50,000 ÷ 60 | **833** | Standard API gateway handles this |
| 50,000 | 50,000 × 5 | **250,000** | 250,000 ÷ 60 | **4,167** | Need ElastiCache caching layer |
| 100,000 | 100,000 × 5 | **500,000** | 500,000 ÷ 60 | **8,333** | SQS queuing essential |
| 500,000 | 500,000 × 5 | **2,500,000** | 2,500,000 ÷ 60 | **41,667** | Full multi-region AWS architecture |

### 10.4 Scaling Strategy

**At 1 Million Users:**
- EC2 Auto Scaling Groups with minimum 5, maximum 20 instances
- ElastiCache Redis cluster for seat lock caching (sub-millisecond response)
- RDS Read Replicas (3 replicas) to handle read-heavy workload
- CloudFront CDN caching static assets globally
- SQS queue for SMS notifications to handle spikes

**At 5 Million Users:**
- Multi-region deployment (Mumbai + Singapore AWS regions)
- RDS Aurora Global Database for cross-region replication
- DynamoDB for waitlist data (auto-scales to millions of records)
- Lambda@Edge for serverless seat expiry logic at the CDN layer
- Dedicated Twilio enterprise account with DLT-registered sender IDs
- Estimated infrastructure cost: ₹8–15 lakh/month

---

## 11. Security Mechanisms

| # | Security Mechanism | Component | Purpose | Threat Addressed |
|---|---|---|---|---|
| 1 | PIN-based Authentication | Admin Panel | Restricts admin access to authorised personnel only | Unauthorised admin access |
| 2 | Role-Based Access Control | Frontend routing | Users cannot access /admin route functions | Privilege escalation |
| 3 | Supabase Row Level Security (RLS) | Database | Controls which rows each role can read/write | Unauthorised data access |
| 4 | HTTPS/TLS Encryption | All API calls | Encrypts data in transit between client and server | Man-in-the-middle attacks |
| 5 | Environment Variables | Supabase keys, Twilio credentials | API keys stored as env vars, never hardcoded in source | Credential theft from source code |
| 6 | Twilio Verified Caller IDs | SMS system | Only verified numbers can receive SMS in trial mode | SMS spam/abuse |
| 7 | Supabase Realtime Auth | WebSocket connections | Authenticated WebSocket channels | Unauthorised realtime data access |
| 8 | Input Validation | Waitlist form | Phone number format validation before database insert | SQL injection, malformed data |
| 9 | Rate Limiting | API Gateway (proposed) | Limits requests per IP per minute | DDoS attacks, API abuse |
| 10 | Audit Logging | admin_logs table | Every admin action is logged with timestamp | Accountability, forensic trail |

---

## 12. Failure and Recovery Analysis

| Failure Type | Failure Scenario | Impact | Detection | Recovery |
|---|---|---|---|---|
| Application/Server | Lovable hosting goes down | Users cannot access website | CloudWatch uptime monitoring alerts within 60 seconds | Automatic failover to backup EC2 instances via ALB health checks |
| Database | Supabase PostgreSQL becomes unavailable | All seat data, waitlist, and bookings inaccessible | Supabase built-in monitoring + CloudWatch RDS alerts | RDS Multi-AZ standby promoted to primary within 60–120 seconds |
| Network | ISP outage or CDN failure | Users in affected region cannot load the app | Route 53 health checks detect endpoint failure | Route 53 DNS failover routes traffic to alternate region |
| Storage | S3 bucket corruption or accidental deletion | E-tickets and static assets unavailable | S3 versioning + CloudWatch S3 metrics | Restore from S3 versioned backup; assets re-served within minutes |
| Security | Supabase API key leaked in public repository | Unauthorised access to database | GitHub secret scanning detects exposed key | Immediately rotate key in Supabase dashboard; audit access logs; enable RLS |

---

## 13. CRUD Operations

| Operation | Table | Example | Trigger |
|---|---|---|---|
| **CREATE** | waitlist | New waitlist entry when user submits phone number | User clicks "Join Waitlist" |
| **CREATE** | notifications | New notification log when SMS is sent | Seat released + Twilio called |
| **READ** | seats | Load all seat statuses for seat map display | Page load / Realtime update |
| **READ** | waitlist | Get queue position for confirmation display | After joining waitlist |
| **UPDATE** | seats | Change status from 'available' to 'locked' | Admin locks a seat |
| **UPDATE** | waitlist | Set notified=true after SMS sent | Notification algorithm runs |
| **DELETE** | waitlist | Remove entry when user cancels waitlist | User cancels / admin removes |

---

*Last updated: September 2026*  
*Repository: https://github.com/pranavsanthosh4038-pixel/seatsync*
