# 7. architecture.md: Intelligent Cancellation and Load Management System

This document outlines the system architecture for the **Intelligent Cancellation and Load Management System** implemented within the BookMyShow digital platform. It details the technical stack, core component mappings, database design, data flow patterns, hosting setup, and global scaling strategies for high-concurrency peak demand events.

---

## 1. Business Problem & Target Users

### Business Problem
BookMyShow dominates India's online movie ticketing (>90% market share) and live events ecosystem (55% market share). However, during extreme peak demand events (such as blockbuster movie releases or major live concert ticket drops), the system experiences critical operational strain:

* **Asynchronous Processing Failures & Phantom Inventory:** Heavy traffic surges trigger payment timeouts and double-locking of seats. Seats remain locked despite incomplete payments, creating "phantom inventory" and causing revenue leakage.
* **Venue Synchronisation Gaps:** Real-time data consistency lags between third-party venue management systems (e.g., Vista ERP) and BookMyShow can lead to communication gaps, such as failing to notify users of last-minute event cancellations.
* **High Concurrency Spikes:** Traffic surges scaling up to 10x lead to payment gateway drop-offs and system downtime without dynamic elasticity.

### Target Users
* **End Consumers (Movie-goers & Concert Attendees):** Require low-latency seat selection, instant reservation locking, dynamic payment retry mechanisms, and automated real-time status updates.
* **Waitlisted Buyers:** Users attempting to purchase sold-out tickets who benefit from automated reallocation upon payment failures or cancellations.
* **Venue Operators & Organisers:** Enterprise partners requiring real-time inventory reconciliation, reliable ERP synchronization, and automated user notification channels during venue updates.

---

## 2. Technology Stack

| Layer | Technology / Tool | Purpose & Usage |
| :--- | :--- | :--- |
| **Frontend Platform** | React Native (Mobile), React.js (Web), Tailwind CSS | Cross-platform web and mobile interfaces with real-time UI state sync. |
| **API & Backend Microservices** | Node.js (TypeScript), Go (Golang) | High-throughput API gateway (Node.js) and low-latency concurrent processing engines (Go). |
| **Container & Orchestration** | Docker, Kubernetes (Amazon EKS) | Containerised microservices deployment with Horizontal Pod Autoscaling (HPA). |
| **In-Memory Cache & Locking** | Redis Cluster (Amazon ElastiCache) | Atomic seat locking with Time-to-Live (TTL), distributed locks, and session caching. |
| **Databases** | Amazon DynamoDB, PostgreSQL (Amazon RDS) | DynamoDB for fast-path NoSQL transaction states; PostgreSQL for relational master data and audit logs. |
| **Event Streaming & Queues** | Apache Kafka, Amazon SQS | Event-driven processing for transaction states, seat release events, and asynchronous retries. |
| **Analytics & ML (DSS Layer)** | AWS SageMaker, Amazon EMR, Amazon QuickSight | Machine learning for predictive cancellation modeling, waitlist priority scoring, and load forecasting. |
| **External Integrations** | Vista ERP APIs, Razorpay / UPI, CleverTap | Cinema inventory sync, payment gateway routing, and real-time push/SMS notifications. |

---

## 3. Current System Architecture

The legacy system relied on centralized, on-premise relational databases and synchronous backend API calls, creating bottlenecks under sudden traffic surges:

```mermaid
graph TD
    User[Mobile App / Web Users] -->|HTTP / REST Requests| Gateway[API Gateway]
    
    subgraph Core Monolith Layer
        Gateway --> BookingSvc[Booking Service]
        Gateway --> PaySvc[User & Payment Service]
        
        BookingSvc --> MonolithDB[(Central PostgreSQL / Legacy DB)]
        PaySvc --> MonolithDB
    end

    subgraph External Dependencies
        BookingSvc -->|Sync API Call| Vista[Vista ERP API]
        PaySvc -->|Sync Payment Request| Gateways[Payment Gateways]
        MonolithDB -->|Batch Sync| LegacyAlerts[Legacy Batch Email / SMS Engine]
    end
