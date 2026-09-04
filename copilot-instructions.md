# SeatSync / BookMyShow Intelligent Cancellation Project Rules

## 1. Project Context & Domain Overview
- **System Purpose:** "SeatSync" is an Intelligent Cancellation and Load Management System designed for high-concurrency ticket booking platforms (modeled after BookMyShow).
- **Core Domain:** High-throughput transactional processing, inventory state locking, queue management, real-time event notifications, and automated waitlists.
- **Key Problem Solved:** Eliminates "phantom inventory" caused by failed/timed-out payments, balances traffic surges (10x spikes), and ensures real-time venue synchronization.

## 2. Core System Architecture Modules
Keep these 4 core workflow modules in mind when suggesting code, schemas, or architectural design:
1. **Dynamic Load Balancer:** Handles incoming high-concurrency traffic, backpressure, and auto-scaling to prevent transaction timeouts during peak demand.
2. **Payment Retry Module:** Intercepts transient payment failures, holds seats temporarily, and attempts alternative gateway routing before triggering a full rollback.
3. **Smart Waitlist Engine:** Real-time engine that detects cancelled or abandoned seats and instantly reallocates them to pre-registered waitlist users.
4. **Real-Time Notification System:** Event-driven pipeline that instantly pushes schedule changes, cancellations, or updates to users via CRM/web/mobile APIs.

## 3. Tech Stack & Infrastructure Focus
- **Cloud Infrastructure:** AWS-centric architecture (AWS EC2, ECS/EKS, Kubernetes, S3 Data Lake).
- **Data & Analytics:** Real-time data streams, AWS SageMaker / EMR (predictive load models), and Amazon QuickSight.
- **Integration Points:** Vista ERP APIs (cinema inventory integration), third-party payment gateways (Razorpay, UPI), and real-time CRM connectors (e.g., CleverTap).

## 4. Coding & Implementation Guidelines
- **Transactional Integrity:** Always prioritize strict data consistency to prevent double-locking of seats or phantom inventory.
- **Concurrency & Failure Handling:**
  - Implement circuit breakers, bulkheads, and exponential backoff mechanisms for all API and payment gateway integrations.
  - Assume high-concurrency scenarios (scaling up to 10x traffic surges) for all backend logic.
- **Asynchronous Processing:** Favor event-driven architectures (queues, pub/sub, webhooks) for background jobs like waitlist recalculation and notification dispatching.
- **Security & DPDP Compliance:**
  - Enforce strict data privacy (India's DPDP Act 2023). Anonymize non-essential behavioral analytics.
  - Apply end-to-end encryption for payment flows and sensitive user credentials.

## 5. Agent Instructions for Code Generation
- Include proper logging and error-handling wrappers for payment failures or inventory locks.
- Write clean, self-documenting code with concise inline comments.
- Maintain clear system boundaries: TPS (transactions/seat locks), MIS (reporting/aggregations), DSS (predictive engines/waitlist automation), and CRM (notifications/user interaction).
