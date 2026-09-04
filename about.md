# CampusNest — Project Report & Presentation Reference

> **Official project title (per the approved proposal, BSD3106):** *CampusNest — AI-Powered
> Student Accommodation (Hostels) Recommendation and Verification Web Application.*
> Student: Leon John Makau (23/05483) · Supervisor: Ernest Madara · School of Computing and
> Information Technology, KCA University.
>
> A detailed, presentation-ready description of the **CampusNest** student accommodation
> marketplace: what it is, every feature and how it works, and an in-depth explanation of the
> Artificial Intelligence / Machine Learning components. This document is structured to feed
> directly into the final-year project report and PowerPoint presentation, and is aligned with
> the approved **Project Proposal** and the **Software Requirements Specification (SRS)**.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Background](#2-background)
3. [Problem Statement](#3-problem-statement)
4. [System Objectives](#4-system-objectives)
5. [Significance of the Study](#5-significance-of-the-study)
6. [Literature Review](#6-literature-review)
7. [Requirements Specification (SRS Summary)](#7-requirements-specification-srs-summary)
8. [Methodology](#8-methodology)
9. [System Architecture](#9-system-architecture)
10. [Detailed Feature Catalogue](#10-detailed-feature-catalogue)
11. [The AI / Machine Learning Subsystem (In Depth)](#11-the-ai--machine-learning-subsystem-in-depth)
12. [Database Design](#12-database-design)
13. [Security Design](#13-security-design)
14. [Results & Achieved Objectives](#14-results--achieved-objectives)
15. [Limitations & Future Work](#15-limitations--future-work)
16. [Technology Stack Summary](#16-technology-stack-summary)
17. [References](#17-references)

---

## 1. Introduction

**CampusNest** is a web-based student accommodation marketplace that connects university
students with verified hostels and rooms near their campuses. It brings the entire renting
journey — discovery, verification, booking, payment, and reviewing — into a single, trustworthy
platform, and augments that journey with three **Artificial Intelligence / Machine Learning**
features: personalised **recommendations**, review **sentiment analysis**, and listing
**fraud / anomaly detection**.

The platform serves three distinct user roles, each with its own login, dashboard, and set of
permissions:

- **Student** — browses verified listings, saves favourites, books a room, pays (simulated),
  and reviews hostels they have stayed in.
- **Landlord** — publishes and manages their own hostel listings and image galleries, and sees
  bookings placed on their properties.
- **Admin** — verifies (moderates) listings, manages users and roles, and monitors bookings
  across the whole platform.

Technically, CampusNest is a **three-tier, service-oriented application**:

| Tier | Technology | Responsibility |
|------|-----------|----------------|
| **Frontend** | React 19 + React Router 7 + Vite | Single-Page Application (SPA) UI for all three roles |
| **Backend** | Node.js + Express 5 + MySQL | REST API, authentication, business rules, data |
| **AI Service** | Python + FastAPI + scikit-learn + NLTK | Machine-learning microservice (recommend / sentiment / fraud) |

Prices throughout the system are displayed in **Kenyan Shillings (KSH)**, reflecting the target
market of Kenyan university students.

---

## 2. Background

Finding accommodation is one of the first and most stressful tasks a university student faces,
particularly first-year and transferring students who are unfamiliar with the area around their
campus. Traditionally this happens through informal, offline channels — physical notice boards,
word-of-mouth, WhatsApp groups, and unverified social-media posts. These channels share three
weaknesses:

1. **No verification** — anyone can post any listing, so students cannot tell a genuine offer
   from a scam.
2. **No structure** — listings are scattered, inconsistent, and impossible to filter or compare
   objectively (by price, distance, room type, or rating).
3. **No feedback loop** — there is no reliable way to see the experiences of previous tenants.

Meanwhile, general-purpose property portals are built for long-term family rentals, not for the
specific needs of students (proximity to campus, per-room pricing, short booking cycles, shared
rooms). CampusNest was conceived to fill this gap with a **student-first, trust-first**
marketplace, and to demonstrate how lightweight, practical **machine learning** can make such a
marketplace safer and more personalised without heavyweight infrastructure.

---

## 3. Problem Statement

> University students struggle to find **legitimate, well-matched** accommodation near their
> campuses. Existing channels are unverified (exposing students to fraud), unstructured (making
> comparison and discovery difficult), and lack any trustworthy record of previous tenants'
> experiences. Landlords, in turn, lack a dedicated channel to reach students, and there is no
> moderating authority to keep fraudulent or unrealistic listings out.

CampusNest addresses this by providing:

- a **verified-only** listing model (students only ever see admin-approved hostels),
- **structured, filterable** listings with images, price, distance, room type, and ratings,
- a **review system** gated to genuine (confirmed-booking) tenants,
- **AI-assisted safeguards and personalisation** — automatic fraud/anomaly flagging of
  suspicious listings, sentiment analysis of reviews, and personalised recommendations.

---

## 4. System Objectives

> **As stated in the approved Project Proposal:**
>
> **General Objective** — To design and implement an AI-powered web-based student accommodation
> (hostels) application that leverages intelligent recommendation, fraud detection, and
> sentiment analysis techniques to enhance transparency, security, and decision-making in the
> student housing selection process.
>
> **Specific Objectives**
> 1. To develop a centralized web application for managing student accommodation listings.
> 2. To implement an AI-based recommendation engine that suggests suitable hostels based on
>    user preferences.
> 3. To design a fraud and anomaly detection mechanism for identifying suspicious accommodation
>    listings.
> 4. To integrate sentiment analysis for analyzing student reviews.
> 5. To evaluate the effectiveness of AI in improving accommodation selection and trust.

The technical breakdown below expands each proposal objective into the concrete, implemented
system capability that satisfies it:

**Main objective:** To design and implement a secure, role-based student accommodation
marketplace that provides verified listings, structured discovery, booking with simulated
payment, tenant reviews, and AI-assisted recommendations, sentiment analysis, and fraud
detection.

**Specific objectives (implementation-level):**

1. **Authentication & Role-Based Access Control (RBAC)** — implement secure registration and
   login for students and landlords (admins are provisioned internally), with JSON Web Token
   (JWT) authentication and strict per-role authorisation.
2. **Verified listing management** — allow landlords to create, update, and delete their own
   listings and image galleries, while requiring admin verification before a listing becomes
   visible to students.
3. **Structured discovery** — provide students with searchable, filterable, and sortable
   browsing (by area, price range, room type, distance, and rating), plus a visual map view and
   a saved/wishlist feature.
4. **Booking & simulated payment** — enable students to book a verified hostel for a date,
   simulate payment, and receive a confirmation/receipt, while notifying the landlord and admin.
5. **Trustworthy reviews** — allow only students with a *confirmed booking* to review a hostel,
   once per hostel, and surface aggregate ratings.
6. **AI-assisted recommendations (FR-23)** — personalise the browse experience by ranking
   hostels for each student using a content-based machine-learning model.
7. **AI review sentiment analysis (FR-24)** — automatically classify review text as positive,
   neutral, or negative.
8. **AI fraud / anomaly detection (FR-25/26)** — automatically flag listings whose attributes
   are statistically unusual or unrealistic, routing them to manual admin review.
9. **Graceful degradation** — ensure the core marketplace keeps working even if the optional AI
   microservice is offline.

---

## 5. Significance of the Study

- **For students:** reduces the risk of accommodation scams, saves search time through
  structured filtering and personalised recommendations, and builds trust through verified
  listings and genuine tenant reviews.
- **For landlords:** provides a dedicated, low-friction channel to reach students, manage
  listings, and receive bookings.
- **For the institution / community:** creates a moderated, accountable ecosystem where a
  verifying authority (admin) can keep fraudulent listings out.
- **Academic / technical significance:** demonstrates a **practical, low-cost application of
  machine learning** (content-based recommendation, lexicon-based sentiment analysis, and
  unsupervised anomaly detection) integrated into a real full-stack product via a
  **microservice architecture** with graceful degradation — a pattern directly transferable to
  other small-to-medium marketplaces (e-commerce, freelancing, second-hand goods).

---

## 6. Literature Review

The student accommodation sector has increasingly adopted digital platforms to facilitate
property search and listing management. However, many existing systems focus on the general
real-estate market and lack intelligent features targeted specifically at university students.
This review examines the reference platforms studied during the proposal stage, the local/
informal alternative students actually use today, and the resulting gap that CampusNest is
designed to fill — followed by a closer technical review of the specific AI techniques adopted.

### 6.1 Airbnb
**Airbnb** (airbnb.com) is a globally recognised online marketplace connecting property owners
with renters. It provides a centralized listing platform with structured property descriptions,
pricing information, images, availability details, and user reviews. Its key reference features
are **advanced filtering** (price range, location, amenities), **user authentication**, **host
verification processes**, a **review-based trust system**, and **recommendation algorithms**
that personalise listings based on user behaviour and preferences.

**What CampusNest borrows from Airbnb:** structured listing management (the `hostels` +
`hostel_images` tables and the landlord listing-management UI), a user review system (the
booking-gated `reviews` feature), and filtering mechanisms (area, price range, room type,
distance, rating) to enhance decision-making and user experience — see
[§6.5](#65-recommender-systems-technique-review) for how its recommendation-algorithm concept is
adapted as a lightweight content-based model.

### 6.2 Booking.com
**Booking.com** is an online accommodation booking platform providing hotel and apartment
listings globally. It incorporates detailed search filters, **review aggregation**, **structured
rating criteria** (users rate accommodations on cleanliness, location, and service quality
specifically), and **anomaly detection / moderation systems** to minimise fraudulent or
misleading listings and ensure listing credibility.

**What CampusNest draws from Booking.com:** structured review management and an aggregate
rating system (`hostels.average_rating` / `reviews_count`, recomputed on every new review), and
a **listing-verification mechanism** — CampusNest's admin `verified` flag and "Listings Needing
Review" queue mirror Booking.com's moderation workflow, adapted to a single binary
verified/unverified gate suited to a smaller marketplace.

### 6.3 Informal and local channels
Locally and regionally, most students still rely on **informal platforms** — social media
groups, word-of-mouth, and generic property-listing websites. While accessible, these channels
lack structured filtering, intelligent recommendation systems, and automated fraud detection.
Reviews on such platforms are unstructured and difficult to analyse, which limits their
usefulness for informed decision-making. This gap in the *local* market is the direct,
practical motivation for CampusNest.

### 6.4 Gap analysis
While Airbnb and Booking.com demonstrate strong centralized management and recommendation
capabilities, **neither is designed for student housing**. They do not fully address
student-specific factors such as proximity to campus, affordability constraints, and
peer-driven trust mechanisms within a university environment. Furthermore, neither integrates
lightweight, domain-specific artificial-intelligence models designed specifically for student
accommodation decision support. **CampusNest is positioned to fill exactly this gap**: a
student-first, verification-first marketplace combining centralized data management with
task-specific, explainable AI decision-support tools (recommendation, anomaly detection,
sentiment analysis) — rather than the general-purpose, large-scale infrastructure of Airbnb or
Booking.com.

### 6.5 Recommender systems (technique review)
Recommender systems fall broadly into **collaborative filtering** (recommending based on
similar users' behaviour) and **content-based filtering** (recommending items similar to those a
user already liked, using item features). Collaborative filtering suffers from the **cold-start
problem** and requires a large user base and interaction matrix — unrealistic for a new, small
marketplace such as CampusNest. The project therefore adopts **content-based filtering** using
**cosine similarity** over item feature vectors, a well-understood information-retrieval
technique (rooted in the vector-space model), consistent with findings in the recommender-systems-in-real-estate
literature that content-based and hybrid approaches are more practical than pure collaborative
filtering for sparse, domain-specific property datasets. This choice suits CampusNest's small
dataset and provides a transparent cold-start fallback.

### 6.6 Sentiment analysis (technique review)
Sentiment analysis (opinion mining) classifies text by emotional polarity. Approaches range from
**lexicon/rule-based** methods to **supervised machine-learning classifiers** (e.g. Naïve Bayes,
SVM) and modern deep-learning transformers. Prior work on AI-assisted review analysis in
platforms such as Airbnb shows that sentiment classification of short, informal guest reviews
meaningfully supports trust and decision-making. For this kind of **short, informal,
user-generated text**, the **VADER** (Valence Aware Dictionary and sEntiment Reasoner)
lexicon-and-rule model is a widely-cited, high-performing choice that requires **no training
data** and handles slang, punctuation, capitalisation, and negation — an exact match for hostel
reviews. CampusNest uses VADER for exactly these reasons.

### 6.7 Anomaly / fraud detection (technique review)
Fraud detection is frequently framed as an **anomaly-detection** problem, especially when
labelled fraud examples are scarce or non-existent (as in a new platform, and as anticipated in
the project's own risk register — see [§7.10](#710-risk-management)). **Unsupervised** methods are
preferred here. The **Isolation Forest** algorithm isolates anomalies by randomly partitioning
the feature space — anomalies, being few and different, are isolated in fewer splits and thus
scored as outliers. It is efficient, needs no labelled data, and works well on low-dimensional
numeric data — making it an ideal fit for flagging unrealistic hostel listings, echoing
Booking.com's use of anomaly detection for listing credibility (§6.2).

### 6.8 Microservice architecture and graceful degradation
Separating the ML workload into an independent **microservice** (Python/FastAPI) rather than
embedding it in the Node backend follows the **separation-of-concerns** principle of modern
service-oriented architecture: each service uses the best tool for its job (Python's scientific
stack for ML, Node for the transactional API). The integration is designed for **graceful
degradation** — a resilience pattern in which the loss of a non-critical dependency degrades
functionality gracefully instead of causing failure — directly satisfying the SRS assumption
that "the AI microservice communicates via REST APIs" ([§7.5](#75-assumptions-and-dependencies))
without making it a single point of failure for the core marketplace.

*(Full source list for this section is consolidated in [§17. References](#17-references).)*

---

## 7. Requirements Specification (SRS Summary)

This section summarises the formal **Software Requirements Specification**
(`docs/Project_BSD3106_SRS_23_05483_Leon_john.docx`), prepared per IEEE 830/29148 SRS
conventions. It is the authoritative source for every FR/NFR number referenced throughout this
document and in the source code, and it is the section to draw on for a report's formal
"Requirements Analysis" chapter.

### 7.1 Purpose and scope
CampusNest AI is a web-based SaaS platform enabling: **students** to search, filter, and book
hostels near their campus; **landlords** to register and manage hostel listings; **administrators**
to monitor, verify, and manage system operations; and **AI-powered services** to provide
intelligent recommendations, fraud detection, and sentiment analysis — improving transparency,
accessibility, and efficiency in the student housing market.

### 7.2 Product perspective
CampusNest AI follows a **three-tier architecture with an additional AI microservice layer**:

| Layer | Technology |
|---|---|
| Presentation Layer | React.js frontend |
| Application Layer | Node.js / Express backend |
| Data Layer | MySQL relational database |
| AI Layer | Python-based ML microservice |

### 7.3 User characteristics

| User | Technical literacy | Primary use of the system |
|---|---|---|
| **Student** | Basic computer literacy | Search and book accommodation via a web browser |
| **Landlord** | Moderate computer literacy | Manage hostel listings and respond to inquiries |
| **Administrator** | Technical knowledge | Monitor system integrity and AI flags |

### 7.4 Constraints
- The system must use **MySQL** as the relational database.
- The backend must be implemented using **Node.js and Express**.
- The AI services must be implemented using **Python**.
- Payment functionality is **simulated** — no real financial integration.
- Internet connectivity is required for system access.

### 7.5 Assumptions and dependencies
- Users have stable internet access.
- Hostels provided by landlords are assumed legitimate unless flagged.
- The AI microservice communicates with the backend **only via REST APIs**.
- The system depends on modern browsers (Chrome, Edge, Firefox).

### 7.6 Functional requirements (FR-1 – FR-27) and implementation status

Every functional requirement below was implemented; the table cross-references the exact code
that satisfies it.

**User Management**

| FR | Requirement | Implemented in |
|---|---|---|
| FR-1 | Students shall be able to register an account | `auth.controller.js → register` (role `student`) |
| FR-2 | Landlords shall be able to register an account | `auth.controller.js → register` (role `landlord`) |
| FR-3 | Administrators shall be able to log in | `auth.controller.js → login` with `expected_role="admin"`; admins are seeded/promoted, not self-registered |
| FR-4 | The system shall enforce role-based access control | `middleware/auth.middleware.js → requireRole()`, applied per-router |
| FR-5 | The system shall securely hash user passwords | `bcrypt.hash(password, 10)` at registration |
| FR-6 | Users shall be able to log out | Frontend clears `campusnest_token`/`campusnest_user` from storage (JWTs are stateless, so logout is client-side) |

**Hostel Management**

| FR | Requirement | Implemented in |
|---|---|---|
| FR-7 | Landlords shall be able to create hostel listings | `landlord.controller.js → createHostel` |
| FR-8 | Landlords shall be able to upload hostel images | `landlord.controller.js → addHostelImage` — **adapted**: images are added by external URL, not binary file upload (see [§15](#15-limitations--future-work)) |
| FR-9 | Landlords shall be able to edit hostel details | `landlord.controller.js → updateHostel` |
| FR-10 | Landlords shall be able to delete listings | `landlord.controller.js → deleteHostel` |
| FR-11 | Administrators shall be able to verify listings | `admin.controller.js → verifyHostel` |

**Search and Filtering**

| FR | Requirement | Implemented in |
|---|---|---|
| FR-12 | Students shall be able to search hostels by location | `hostels.controller.js → listHostels` (`area` filter) |
| FR-13 | Filtering by price range | `minPrice`/`maxPrice` query params + dual-thumb slider |
| FR-14 | Filtering by room type | `roomType` filter |
| FR-15 | Sorting by relevance and rating | `sortBy` → `SORT_MAP` (relevance/price/distance/rating) |

**Booking and Payment**

| FR | Requirement | Implemented in |
|---|---|---|
| FR-16 | Students shall be able to submit booking requests | `bookings.controller.js → createBooking` |
| FR-17 | Booking status tracking (pending/confirmed/cancelled) | `bookings.status` ENUM |
| FR-18 | Simulated payment processing | `bookings.controller.js → simulatePay` |
| FR-19 | Recording payment status | `payments.payment_status` ENUM |

**Reviews and Ratings**

| FR | Requirement | Implemented in |
|---|---|---|
| FR-20 | Star rating (1–5) | `reviews.controller.js → createReview` (`rating` CHECK 1–5) |
| FR-21 | Text reviews | `reviews.comment` |
| FR-22 | Reviews stored in the database | `reviews` table |

**AI Features**

| FR | Requirement | Implemented in |
|---|---|---|
| FR-23 | Recommend hostels by budget, distance, and preference | `ai-service/app/recommender.py` + `hostels.controller.js` — see [§11.1](#111-recommendations-fr-23--content-based-filtering) |
| FR-24 | Analyse review sentiment (positive/neutral/negative) | `ai-service/app/sentiment.py` + `reviews.controller.js` — see [§11.2](#112-review-sentiment-analysis-fr-24--nltk-vader) |
| FR-25 | Detect suspicious listings via anomaly detection | `ai-service/app/fraud.py` — see [§11.3](#113-listing-fraud--anomaly-detection-fr-2526--isolation-forest) |
| FR-26 | Flag suspicious listings for admin review | `landlord.controller.js` forces `verified = FALSE` on a fraud flag |
| FR-27 | Track user interaction data for recommendations | `services/interactions.service.js` → `user_interactions` table |

### 7.7 Non-functional requirements

| NFR | Requirement | Status in the implemented prototype |
|---|---|---|
| NFR-1 | Respond within 3 seconds under normal load | Not formally benchmarked; the AI-call timeout is itself set to 4s, so a worst-case AI round trip alone can approach this budget — a candidate for load testing |
| NFR-2 | Support at least 100 concurrent users | Not load-tested; the backend's **single, non-pooled** MySQL connection ([§15](#15-limitations--future-work)) is the most likely bottleneck to revisit before this could be claimed |
| NFR-3 | Password hashing for authentication | ✅ bcrypt, cost 10 |
| NFR-4 | JWT-based authentication | ✅ signed `{id, role}` tokens |
| NFR-5 | Role-based access control | ✅ `authenticateToken` + `requireRole` |
| NFR-6 | Validate all user inputs | ✅ hand-rolled validation in every controller (regexes, allowlist `Set`s, type checks) |
| NFR-7 | Responsive UI | ✅ Tailwind v4 + custom CSS; student dashboard includes a mobile bottom nav |
| NFR-8 | Clear error messages | ✅ JSON `{ error }` / `{ message }` responses surfaced in the UI |
| NFR-9 | 95% uptime | Not applicable to a local academic prototype; would require production hosting to measure |
| NFR-10 | Database referential integrity | ✅ foreign keys with `ON DELETE CASCADE` throughout |

### 7.8 External interface requirements
- **User Interface** — web-based GUI, responsive design, search filters and role-specific
  dashboard views.
- **Software Interfaces** — MySQL database; AI microservice (REST API communication); backend
  API (JSON over HTTP).
- **Communication Interfaces** — HTTP/HTTPS protocol; RESTful API endpoints.

### 7.9 Legal, regulatory, and localization requirements
- The system shall protect user data and comply with general data-protection principles.
- Passwords shall not be stored in plain text (satisfied via bcrypt hashing).
- The system shall support currency display in **Kenyan Shillings (KES/KSH)** — implemented
  throughout the frontend.
- The system shall allow future localization for multiple languages — **not yet implemented**
  (single-language UI today; listed under Future Work, [§15](#15-limitations--future-work)).

### 7.10 Risk management

Combining the SRS risk register with the fuller risk/mitigation table from the project proposal:

| Risk | Impact | Mitigation | Status |
|---|---|---|---|
| Fraudulent / suspicious listings | Students exposed to scams | AI anomaly detection (`fraud.py`) + mandatory admin verification | ✅ Implemented |
| Data breach | Loss of user trust, credential exposure | Password hashing (bcrypt) + RBAC | ✅ Implemented; note no field-level encryption at rest |
| System downtime | Demo/production failure | Proper server deployment; stable local backup during defense | ⚠️ Not yet deployed to production hosting |
| Inaccurate AI predictions | Reduced trust in recommendations/fraud flags | Continuous model improvement on real usage data | ⚠️ Current models trained on synthetic/small data ([§15](#15-limitations--future-work)) |
| Limited access to real accommodation data | AI models rely on simulated data, reducing realism | Sample/survey data collection; simulated structured datasets; clearly stated prototype limitations | ⚠️ Ongoing — `database/seed_demo.sql` currently provides only demo data |
| Technical skill gaps in AI | Delays in AI module development | Start with simple, well-documented ML models (scikit-learn, NLTK); build small prototypes early | ✅ Mitigated — all three models use well-documented, lightweight libraries |
| User adoption & trust in AI | Students may distrust AI recommendations | Transparency features: verified badges, AI-Pick badges, visible ratings | ✅ Implemented (badges), sentiment display to users still pending |

### 7.11 Glossary (from the SRS)

| Term | Meaning |
|---|---|
| AI | Artificial Intelligence |
| RBAC | Role-Based Access Control |
| UI | User Interface |
| API | Application Programming Interface |
| DB | Database |
| JWT | JSON Web Token |
| SRS | Software Requirements Specification |
| Accommodation | Student housing facility |
| Recommendation Engine | AI system that suggests hostels |
| Anomaly Detection | AI method to detect unusual data patterns |

### 7.12 Use case examples

**Primary use case (Student — from the SRS):**
1. Student logs into the system.
2. Student searches hostels.
3. Student selects a hostel.
4. Student submits a booking request.
5. System records the booking.
6. Student completes simulated payment.
7. System updates booking status to `confirmed`.

**Additional use cases (derived from the implemented system, for report completeness):**

*Landlord:*
1. Landlord logs in → creates a hostel listing (defaults to unverified).
2. AI fraud check runs automatically; listing enters the admin review queue.
3. Landlord adds image URLs and marks one primary.
4. Landlord receives a "Bookings on Your Hostels" notification once a student books.

*Admin:*
1. Admin logs in → opens "Listings Needing Review".
2. Admin opens a listing's detail modal, reviews images/description/AI fraud reasons (if any).
3. Admin clicks **Verify** → the listing becomes visible to students.
4. Admin monitors platform-wide bookings and manages user roles/activation from Manage Users.

---

## 8. Methodology

### 8.1 Development methodology
The project followed an **incremental / iterative** development approach, building the system in
clearly separated feature phases, each producing a working, testable increment. This is evident
in the version-control history:

| Phase | Focus | Representative work |
|-------|-------|---------------------|
| **Phase 0 — Scaffolding** | Project setup | Express backend + health route, React/Vite frontend, MySQL schema, AI-service skeleton |
| **Phase 1 — Authentication & RBAC** | Security foundation | Registration, login, JWT issuance, role-based route guards, role-specific login/register UI |
| **Phase 2 — Role dashboards** | Core UIs | Student browse dashboard → Landlord management dashboard → Admin verification dashboard |
| **Phase 3 — Student transactional flows** | Marketplace core | Hostel detail page, save/wishlist, bookings, simulated payments, booking notifications |
| **Phase 4 — AI/ML microservice** | Intelligence layer | FastAPI service with three models (recommend, sentiment, fraud) wired into the backend with graceful degradation |
| **Phase 5 — Polish & seeding** | Refinement | Admin role switching, interactive notifications, profile page, demo seed data |

### 8.2 Requirements engineering
Functional requirements were formally captured (**FR-1 … FR-27**) in the Software Requirements
Specification (SRS — summarised in full in [§7](#7-requirements-specification-srs-summary)) and
a companion **Manual Test Plan** (`docs/MANUAL_TEST_PLAN.md`). These FR numbers are referenced
directly in the source code (e.g. `FR-23` = recommendations, `FR-24` = sentiment, `FR-25/26` =
fraud, `FR-27` = interaction logging), giving full requirement→code traceability.

### 8.3 Architectural methodology
- **Layered backend:** a strict request pipeline — `server.js → app.js (routers) →
  routes/*.routes.js → controllers/*.controller.js → config/db.js` — keeping routing,
  authorisation, business logic, and data access separated.
- **Service-oriented AI:** the ML models live in a **separate process** and are consumed only
  over REST, so they can be developed, deployed, scaled, and even switched off independently.
- **Client-side SPA with server-authoritative security:** the React app provides fast,
  role-aware navigation, but **all real authorisation is enforced on the server** — the frontend
  guards are a UX convenience only.

### 8.4 Testing methodology
- **Manual test plan** covering FR-1 through FR-27.
- **API smoke tests** (`docs/API_SMOKE_TESTS.md`) — `curl` commands exercising every endpoint.
- **Health checks** on both the backend (`GET /health`) and AI service (`GET /health`) for
  liveness verification.

### 8.5 Tools & environment
Node.js 18+, MySQL 8+, Python 3.11+, Vite dev server, nodemon (hot reload), Uvicorn (ASGI
server), Git/GitHub for version control.

---

## 9. System Architecture

### 9.1 High-level component diagram

```
                          ┌───────────────────────────────┐
                          │        React SPA (Vite)        │
                          │   Student / Landlord / Admin   │
                          │      dashboards + guards       │
                          └───────────────┬───────────────┘
                                          │  HTTPS / REST (axios, Bearer JWT)
                                          ▼
                          ┌───────────────────────────────┐
                          │     Express REST API (Node)    │
                          │  auth · hostels · bookings ·   │
                          │  reviews · landlord · admin    │
                          │  JWT auth + RBAC middleware    │
                          └──────┬───────────────┬─────────┘
                                 │               │  REST (fetch, 4s timeout,
              mysql2 (callbacks) │               │  graceful fallback = null)
                                 ▼               ▼
                     ┌────────────────┐   ┌──────────────────────────────┐
                     │  MySQL 8       │   │  FastAPI AI Service (Python) │
                     │  student_      │   │  /recommend  (scikit-learn)  │
                     │  accommodation │   │  /sentiment  (NLTK VADER)    │
                     │                │   │  /fraud      (IsolationForest)│
                     └────────────────┘   └──────────────────────────────┘
```

### 9.2 Request flow (backend)
`server.js` opens the shared MySQL connection and starts listening → `app.js` mounts the six
routers under `/api/auth`, `/api/hostels`, `/api/bookings`, `/api/reviews`, `/api/landlord`,
`/api/admin` (plus `GET /health`) → each router applies `authenticateToken` and `requireRole(...)`
middleware → controllers hand-validate input and run parameterised SQL via a single shared
`mysql2` callback-style connection.

### 9.3 Frontend structure
- **`App.jsx`** defines all routes. Auth pages render inside a shared `AuthLayout`; dashboards
  are top-level and protected by route guards.
- **Route guards** (`routes/RouteGuards.jsx`) — `RequireStudentAuth`, `RequireLandlordAuth`,
  `RequireAdminAuth`, and `GuestOnlyRoute` — read the session from storage and redirect based on
  `user.role`.
- **Session storage convention:** the JWT is stored under `campusnest_token` and the user under
  `campusnest_user`, in `localStorage` (if "Remember me") or `sessionStorage` otherwise; both are
  always checked in that order.
- **Services layer** (`services/*.service.js`) — each wraps its API calls with `axios`,
  attaching the `Authorization: Bearer <token>` header.
- **Styling:** Tailwind CSS v4 (via the Vite plugin) plus a large body of hand-written CSS under
  `src/styles/` (one CSS file per feature area), driven by CSS custom properties defined in
  `global.css`.

---

## 10. Detailed Feature Catalogue

This section describes every feature and *how it works* end-to-end.

### 10.1 Authentication & Authorisation

**Registration** (`POST /api/auth/register`)
- Accepts `full_name`, `email`, `password`, and `user_role`.
- Server-side validation: email format regex; **password policy** requiring at least one
  lowercase, one uppercase, and one digit, minimum 8 characters
  (`/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/`).
- **Only `student` and `landlord` may self-register** — attempting to register as `admin` is
  rejected (403). Admins are seeded into the database or promoted by another admin.
- Passwords are **bcrypt-hashed** with cost factor 10 before storage.

**Login** (`POST /api/auth/login`)
- Validates credentials, verifies the password with `bcrypt.compare`.
- Accepts an optional **`expected_role`** so each role's dedicated login page rejects accounts of
  other roles (e.g. a landlord cannot log in through the student login page — 403).
- On success, signs a **JWT** containing `{ id, role }`, with expiry from `JWT_EXPIRES_IN`
  (default `1 day`), and returns the token plus a safe user object.

**Rate limiting** — the auth endpoints are protected by `express-rate-limit`: login is capped at
**10 requests / 15 minutes** per IP and registration at **20 / hour**, mitigating brute-force and
abuse.

**Authorisation middleware** (`middleware/auth.middleware.js`)
- `authenticateToken` — extracts and verifies the `Bearer` JWT, sets `req.user = { id, role }`.
- `requireRole(...roles)` — gates each route/router by role (401 if unauthenticated, 403 if the
  role is not allowed).
- Routers compose these: e.g. the landlord router applies `authenticateToken` + `requireRole
  ("landlord")` globally, so a landlord can only ever act as a landlord.

### 10.2 Student features

**Browse & discovery** (`GET /api/hostels`) — the student dashboard's main page.
- **Filters:** area (text match), room type, min/max price (a dual-thumb price slider,
  KSH 5,000–35,000), and a pill filter bar with presets: `top` (rating ≥ 4.7), `ai`
  (AI picks), `verified`, `near` (< 2 km), `budget` (≤ KSH 10,000), `premium` (≥ KSH 22,000).
- **Sorting:** by relevance (default), price, distance, or rating.
- **Verified-only:** the query *always* forces `verified = TRUE` — students never see unverified
  listings, even by direct ID (a direct request to an unverified hostel returns 404).
- **Map view:** a toggleable visual map where each hostel is a dot positioned by percentage
  coordinates (`marker_x` / `marker_y`); clicking a marker scrolls to and highlights the card.
- **AI Pick badge:** after fetching, the backend calls the AI recommender and, for recommended
  hostels, sets an `aiPick` flag and (on default sort) floats them to the top — see
  [§11.1](#111-recommendations-fr-23--content-based-filtering).

**Hostel detail** (`GET /api/hostels/:id`) — image gallery with thumbnails, save/unsave heart,
AI-Pick / Verified badges, meta chips (location, distance, room type, utilities, availability),
an inline booking form, and the embedded review form + list.

**Saved / wishlist** (`POST /api/hostels/:id/save`, `GET /api/hostels/saved`) — a single toggle
endpoint adds or removes a bookmark; the saved page renders the student's wishlist.

**Bookings & simulated payment** (`/api/bookings/*`)
- `createBooking` — validates the hostel is verified and available and the date is a real,
  non-past `YYYY-MM-DD`; blocks a second *active* booking for the same hostel (a DB
  `UNIQUE(user_id, hostel_id, booking_date)` constraint is the second line of defence).
- `listMyBookings` — the student's bookings with status badges.
- `cancelBooking` — only `pending` bookings can be cancelled (ownership-scoped).
- `simulatePay` — inserts a `payments` row marked `completed` for the hostel's price and flips
  the booking to `confirmed`. This is the **entire "payment system"** — deliberately simulated,
  with no real gateway or card capture.
- `getPayment` — returns the payment/receipt for a booking.

**Reviews** (`POST /api/reviews`, `GET /api/hostels/:id/reviews`)
- A student may review a hostel **only if they hold a `confirmed` booking** for it, and **only
  once** per hostel (both enforced in the controller).
- On submission the hostel's cached `reviews_count` and `average_rating` are recomputed from all
  its reviews.
- The review comment is then passed to the AI **sentiment** service — see
  [§11.2](#112-review-sentiment-analysis-fr-24--nltk-vader).

**Profile** — a read-only view of the student's name, email, and role, with logout.

### 10.3 Landlord features (`/api/landlord/*`)

- **`listMyHostels`** — the landlord's own hostels and images (always scoped to
  `landlord_id = req.user.id`; a landlord can never see or touch another landlord's rows).
- **`createHostel` / `updateHostel`** — extensive manual validation (room-type allowlist,
  availability allowlist, price > 0, distance ≥ 0, map coordinates in 0–100). **Both call the AI
  fraud service** before writing — see [§11.3](#113-listing-fraud--anomaly-detection-fr-2526--isolation-forest).
  New hostels default to `verified = FALSE`, so they enter the admin review queue automatically.
- **`deleteHostel`** — ownership-scoped delete (cascades to images/bookings).
- **Image management** (`addHostelImage`, `updateHostelImage`, `deleteHostelImage`) — ownership
  is enforced by joining back through `hostels` on `landlord_id`; setting an image as primary
  clears any other primary. **Images are external URLs** (validated as `http(s)://`) — there is
  no file-upload/storage subsystem.
- **Booking notifications** (`listLandlordBookings`) — a "Bookings on Your Hostels" panel showing
  bookings placed on the landlord's properties, joined with student info and latest payment.

### 10.4 Admin features (`/api/admin/*`)

- **`listUsers`** — all platform users.
- **`updateUserRole`** — promote/demote a user among `student`/`landlord`/`admin`; an admin
  cannot demote themselves (self-protection).
- **`updateUserActive`** — activate/deactivate a user; an admin cannot deactivate themselves.
- **`listHostels` / `getHostelByIdForAdmin`** — all listings (including unverified) with landlord
  contact info; the admin can view pending listings that students cannot.
- **`verifyHostel`** — the **manual moderation gate**: toggles a hostel's `verified` flag.
  Students only ever see verified hostels, so this is the platform's core trust control.
- **`listAdminBookings`** — platform-wide bookings for the admin dashboard's monitoring table.

### 10.5 Cross-cutting features

- **Interaction logging (FR-27)** — every hostel list fetch logs a `search` event and every
  detail view logs a `view` event into `user_interactions` (fire-and-forget). This behavioural
  log becomes the **history input to the recommender**.
- **Graceful degradation** — every call to the AI service is wrapped so that a slow, down, or
  erroring AI service resolves to a safe fallback (`null`) instead of throwing, keeping the core
  app fully functional.

---

## 11. The AI / Machine Learning Subsystem (In Depth)

This is the intellectual core of the project and the section to expand most in the presentation.

### 11.0 Design philosophy and integration

The AI capabilities are implemented as a **standalone Python microservice** (`ai-service/`)
built with **FastAPI** and served by **Uvicorn** on port 8000. It exposes three POST endpoints
and two health endpoints:

```python
@app.get("/")         # {"message": "CampusNest AI Service running"}
@app.get("/health")   # {"status": "ok"}
@app.post("/recommend")   # body: {userId, hostels:[...], history:[...]}
@app.post("/sentiment")   # body: {text}
@app.post("/fraud")       # body: {price, distance_km, room_type, ...}
```

**Why a separate microservice?**
- **Right tool for the job:** Python's scientific stack (scikit-learn, NLTK, NumPy) is the
  natural home for ML; Node/Express is the natural home for the transactional API.
- **Independent lifecycle:** the AI service can be developed, deployed, scaled, or switched off
  without touching the main app.
- **Resilience:** integration is **REST-only** (no Python imported into Node). The Node client
  (`backend/src/services/ai.client.js`) uses the built-in `fetch` with a 4-second
  `AbortSignal.timeout`, and a shared `postJson(path, body, fallback)` helper that **catches
  every error and non-2xx response and resolves to `null`** instead of throwing. This is what
  guarantees **graceful degradation** — if the AI service is offline, the marketplace keeps
  working and simply skips the AI enhancement.

The three models are all **lightweight and self-contained** — there are **no persisted model
files**; each model is either stateless per-request or trained once in memory at first use. This
suits a small marketplace dataset and keeps deployment trivial.

---

### 11.1 Recommendations (FR-23) — Content-Based Filtering

**File:** `ai-service/app/recommender.py` · **Libraries:** scikit-learn (`StandardScaler`,
`cosine_similarity`), NumPy.

**Concept.** A **content-based recommender**: rather than needing many users (which a new
platform lacks), it recommends hostels that are *similar to the ones a particular student has
already interacted with*, using each hostel's own attributes.

**Feature engineering.** Each hostel is converted into a numeric **feature vector**:
- Three numeric features — `price`, `distance_km`, `rating` — standardised with scikit-learn's
  **`StandardScaler`** (zero mean, unit variance) so no single feature dominates by scale.
- A **4-dimensional one-hot encoding** of `room_type` (Single Room, Shared, Studio, Apartment).

These are concatenated into one feature vector per hostel:
`[scaled_price, scaled_distance, scaled_rating, room_onehot(4)]`.

**Two operating modes:**

1. **With interaction history (personalised).** The student's recent hostel interactions (from
   the `user_interactions` log, supplied by the backend as `history`) are converted into the same
   feature vectors and **averaged** to form a single **"preference profile"** vector. Every
   candidate hostel is then scored by its **cosine similarity** to that profile:

   ```python
   profile = history_features.mean(axis=0, keepdims=True)
   scores  = cosine_similarity(candidate_features, profile).ravel()
   ```

   Cosine similarity measures the angle between two vectors — hostels pointing in the "same
   direction" as the student's taste score highest.

2. **Cold-start (no history).** New students have no profile, so the model falls back to a
   transparent, hand-weighted **quality score** that favours *higher-rated, cheaper, and closer*
   hostels (each min-max normalised across the current batch):

   ```python
   score = 0.5 * norm(rating)               # higher rating is better
         + 0.3 * norm(price,   invert=True) # cheaper is better
         + 0.2 * norm(distance,invert=True) # closer is better
   ```

**Output.** Hostels ranked by score, plus the **top-3** recommended IDs:
```json
{ "recommended": [{ "id": 4, "score": 0.9123 }, ...],
  "recommendedIds": [4, 2, 7] }
```

**How it is used.** In `hostels.controller.js → listHostels`, after the SQL fetch the backend
sends the candidate hostels and the student's history to `/recommend`. Returned
`recommendedIds` cause those hostels to be marked with an **"AI Pick"** badge (`aiPick = true`)
and, on the default *relevance* sort, floated to the top of the list. (This is computed fresh on
every request and **not** persisted to the database.) On any failure the recommender returns an
empty result and the list is shown unchanged — never broken.

---

### 11.2 Review Sentiment Analysis (FR-24) — NLTK VADER

**File:** `ai-service/app/sentiment.py` · **Library:** NLTK (`SentimentIntensityAnalyzer` /
VADER).

**Concept.** **VADER** (Valence Aware Dictionary and sEntiment Reasoner) is a **pre-trained,
lexicon-and-rule-based** sentiment model specifically tuned for **short, informal text** — an
exact match for hostel reviews. Crucially it needs **no training data**: it ships with a
sentiment lexicon and a set of grammatical/heuristic rules (handling capitalisation,
punctuation emphasis, and negation).

**How it works.**
- The VADER lexicon is **lazily loaded once** (and auto-downloaded on first use if missing),
  then reused as a module-level singleton.
- For a given review, VADER produces a **compound score** in the range **[-1, +1]**, which is
  thresholded into a class using VADER's standard convention:

  ```python
  compound >=  0.05  -> "positive"
  compound <= -0.05  -> "negative"
  otherwise          -> "neutral"
  ```

**Offline fallback.** If NLTK/the lexicon cannot be loaded (e.g. no internet on first run), the
model falls back to a small hand-built keyword lexicon (positive words like *clean, safe,
affordable*; negative words like *dirty, noisy, scam*) and scores by
`(positive − negative) / total`. This guarantees the endpoint **never fails**.

**Output.**
```json
{ "sentiment": "positive", "score": 0.7845, "model": "vader" }
```
(`model` becomes `"lexicon-fallback"` or `"none"` in the fallback/empty cases.)

**How it is used.** In `reviews.controller.js → createReview`, after the review is stored and the
hostel's aggregate rating is updated, the comment text is sent to `/sentiment`. The result is
returned in the API response (and logged server-side) — by design it is **not persisted** to a
database column (the schema has no sentiment field, and adding one was deliberately kept out of
scope). If the AI service is down, `sentiment` is simply `null`.

---

### 11.3 Listing Fraud / Anomaly Detection (FR-25/26) — Isolation Forest

**File:** `ai-service/app/fraud.py` · **Library:** scikit-learn (`IsolationForest`), NumPy.

**Concept.** Detecting fraudulent listings is framed as an **unsupervised anomaly-detection**
problem, because a new platform has **no labelled fraud data**. The **Isolation Forest**
algorithm builds an ensemble of random trees that repeatedly partition the feature space;
anomalies — being rare and "different" — get isolated in far fewer splits than normal points, and
so receive outlier scores. It is fast, needs no labels, and excels on low-dimensional numeric
data.

**Features.** Each listing is reduced to three features: `[price, distance_km, room_type_index]`.

**Training on a synthetic baseline.** Because there is no real dataset of "normal" listings, the
model is trained **once, in memory, at first use** on a **synthetically generated baseline** of
~600 realistic listings:

```python
_BASE_PRICE = {"Single Room": 10000, "Shared": 6000, "Studio": 18000, "Apartment": 25000}
# For each room type, draw prices ~ Normal(base_price, spread=4000)
# and distances ~ |Normal(2.5 km, 1.5)|, then:
model = IsolationForest(contamination=0.05, random_state=42)
model.fit(rows)
```

The trained model is cached as a module-level singleton (fit once per process, not per request).

**Hybrid rule + model design.** Alongside the ML model, a few **hard sanity rules** always flag
obviously bad values regardless of the model's opinion:
- price **< KSH 1,500** ("below realistic minimum"),
- price **> KSH 60,000** ("above realistic maximum"),
- distance **> 30 km** ("implausibly large").

**Scoring.** For an incoming listing, `model.predict` returns `-1` (anomaly) or `1` (normal), and
`model.decision_function` returns a raw anomaly score (lower = more anomalous).

**Output.**
```json
{ "flagged": true, "score": -0.0421,
  "reasons": ["price below realistic minimum"], "model": "isolation-forest" }
```

**How it is used.** In `landlord.controller.js`, both `createHostel` and `updateHostel` call
`/fraud` before writing. On **create**, a flagged listing is logged (new listings are unverified
anyway, so they already await admin review). On **update**, a flagged listing has `verified =
FALSE` **forcibly appended** to the SQL update — kicking a previously-approved listing back into
the admin's pending queue for manual re-review. Notably, **no new database column was added**:
the mechanism piggybacks on the existing `verified` boolean. On any model error it **fails open**
(returns not-flagged), so a model crash never blocks a legitimate landlord.

---

### 11.4 AI subsystem — summary table

| Feature | FR | File | Algorithm / Library | Training | Output | Consumed by |
|---------|----|------|--------------------|----------|--------|-------------|
| Recommendations | FR-23 | `recommender.py` | Content-based, **cosine similarity** + `StandardScaler` (scikit-learn) | Stateless, per-request (no model file) | Ranked hostels + top-3 IDs | `hostels.controller.js` → "AI Pick" + re-sort |
| Review sentiment | FR-24 | `sentiment.py` | **NLTK VADER** (pre-trained lexicon + rules) | None (pre-trained) | positive/neutral/negative + score | `reviews.controller.js` (returned, not stored) |
| Fraud / anomaly | FR-25/26 | `fraud.py` | **Isolation Forest** (scikit-learn) + hard rules | Once, in-memory, on synthetic baseline | flagged + reasons + score | `landlord.controller.js` → forces `verified = FALSE` |

**Key ML dependencies** (`ai-service/requirements.txt`): `fastapi`, `uvicorn`, `scikit-learn`,
`nltk`, `numpy`, `scipy`, `pydantic`.

---

## 12. Database Design

The MySQL database `student_accommodation` (schema in `database/CAMPUSNEST.sql`, demo data in
`database/seed_demo.sql`) contains eight tables.

| Table | Purpose | Key columns / notes |
|-------|---------|---------------------|
| **`users`** | All three roles in one table | `user_role` ENUM(student/landlord/admin), `password` (bcrypt), `email` UNIQUE, `is_active` |
| **`hostels`** | Core listing entity | FK `landlord_id`→users; `room_type` ENUM; `price`, `distance_km`; `verified` (moderation gate); `ai_pick`; cached `average_rating` & `reviews_count`; `availability` ENUM; `marker_x/marker_y` (map coords) |
| **`hostel_images`** | Image galleries | FK `hostel_id`; `image_url` (external URLs only); `is_primary`, `sort_order` |
| **`saved_hostels`** | Student wishlist | FK student + hostel, `UNIQUE(student_id, hostel_id)` |
| **`reviews`** | Tenant reviews | FK user + hostel; `rating` CHECK 1–5; `comment` |
| **`bookings`** | Reservations | FK user + hostel; `status` ENUM(pending/confirmed/cancelled); `UNIQUE(user_id, hostel_id, booking_date)` |
| **`payments`** | Simulated payment ledger | FK `booking_id`; `payment_status` ENUM; one `completed` row per simulated payment |
| **`user_interactions`** | Behavioural log (AI-ready) | FK user + (nullable) hostel; `interaction_type` ENUM(view/click/search) — feeds the recommender's history |

**Relationships:** `users 1–* hostels`, `hostels 1–* hostel_images`, `users *–* hostels` via
`saved_hostels` / `reviews` / `bookings`, `bookings 1–* payments`, `users 1–* user_interactions`.
All foreign keys cascade on delete. Notable design decisions:

- **Denormalised rating cache** — `hostels.average_rating` and `reviews_count` are recomputed and
  stored on each new review to avoid re-aggregating on every read.
- **Single-table roles** — one `users` table with a role enum, rather than a table per role.
- **Verified flag as the trust gate** — students' queries always filter `verified = TRUE`.

---

## 13. Security Design

- **Password security** — bcrypt hashing (cost 10); passwords never stored or returned in plain
  text; a strong password policy enforced at registration.
- **JWT authentication** — stateless signed tokens carrying `{ id, role }`; `JWT_SECRET` is
  mandatory (the server rejects all auth without it).
- **Role-based access control** — every protected route is gated by `authenticateToken` +
  `requireRole(...)`; the frontend guards are convenience only, with the server authoritative.
- **Ownership scoping** — landlord queries always filter by `landlord_id = req.user.id`, so a
  landlord can only ever access their own listings and images.
- **SQL-injection protection** — all queries are **parameterised** with `?` placeholders
  (`mysql2`).
- **Rate limiting** — login and registration are throttled to resist brute-force/abuse.
- **Input validation** — every controller hand-validates and sanitises input (trimming, type
  checks, allowlist `Set`s, regexes) before touching the database.
- **Self-protection rules** — an admin cannot demote or deactivate their own account.

*(Documented limitation: deactivating a user or changing their role does not invalidate an
already-issued JWT until it expires, as there is no token blocklist — noted as out of scope.)*

---

## 14. Results & Achieved Objectives

The following objectives were designed, implemented, and verified against the manual test plan
(FR-1 … FR-27). **Insert screenshots** at each marked point in the presentation.

| # | Objective | Status | Where to screenshot |
|---|-----------|--------|---------------------|
| 1 | Secure auth + RBAC (JWT, bcrypt, per-role login) | ✅ Achieved | Login/Register pages for each role; failed cross-role login |
| 2 | Landlord listing & image management + admin verification | ✅ Achieved | Landlord create/edit form; admin "Listings Needing Review" |
| 3 | Structured discovery (filters, sort, map, saved) | ✅ Achieved | Student browse dashboard; filter pills; map view; Saved page |
| 4 | Booking + simulated payment + notifications | ✅ Achieved | Hostel detail booking; My Bookings; receipt; landlord/admin booking panels |
| 5 | Booking-gated, one-per-hostel reviews + aggregate ratings | ✅ Achieved | Review form on detail page; star ratings on cards |
| 6 | **AI recommendations (FR-23)** | ✅ Achieved | Browse page showing "AI Pick" badges / re-ordered results |
| 7 | **AI review sentiment (FR-24)** | ✅ Achieved | Sentiment in the review submission API response / server log |
| 8 | **AI fraud/anomaly detection (FR-25/26)** | ✅ Achieved | A flagged listing landing in the admin review queue |
| 9 | Graceful degradation (AI optional) | ✅ Achieved | App running normally with the AI service stopped |

**Suggested screenshots for the "Results" slides:**
1. The three role-specific **login** screens.
2. **Student browse** dashboard — filters, sort, and an **AI Pick** badge.
3. **Map view** with hostel markers.
4. **Hostel detail** page — gallery, booking form, reviews.
5. **My Bookings** with a payment **receipt**.
6. **Landlord dashboard** — create/edit form + booking notifications.
7. **Admin dashboard** — "Listings Needing Review" + verify action + user management.
8. **AI service** terminal (`uvicorn` running) + a sample `/recommend`, `/sentiment`, `/fraud`
   JSON response.
9. The app **still working with the AI service turned off** (graceful degradation).

---

## 15. Limitations & Future Work

**Current limitations (be transparent in the report):**
- Payments are **simulated** — no real payment gateway (e.g. M-Pesa/Stripe) integration.
- Images are **external URLs only** — no file upload/storage.
- The backend uses a **single, non-pooled** MySQL connection (a scalability limitation).
- JWTs are **not revocable** before expiry (no token blocklist).
- ML models are trained on **synthetic/small** data (the fraud baseline is synthetic; the
  recommender is stateless per request) — accuracy would improve with real usage data.
- Sentiment results are **not persisted**, so they are not yet aggregated or displayed.
- "Messages" and some notifications are **UI placeholders**, not yet backed by an API.

**Future work:**
- Real payment gateway (M-Pesa Daraja API) and real image uploads (S3/Cloudinary).
- Persist sentiment and surface a per-hostel sentiment summary; retrain models on real
  interaction and review data.
- Add collaborative-filtering recommendations once enough users exist (hybrid recommender).
- Connection pooling, automated tests (unit + integration), and CI/CD.
- Real-time notifications and in-app messaging between students and landlords.

---

## 16. Technology Stack Summary

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, React Router 7, Vite 7, Tailwind CSS v4, axios, hand-written CSS |
| **Backend** | Node.js 18+, Express 5, mysql2 (callback API), jsonwebtoken, bcrypt, express-rate-limit, cors, dotenv (ES modules) |
| **AI Service** | Python 3.11+, FastAPI, Uvicorn, scikit-learn (StandardScaler, cosine_similarity, IsolationForest), NLTK (VADER), NumPy, SciPy, Pydantic |
| **Database** | MySQL 8 (`student_accommodation`) |
| **Tooling** | Git/GitHub, nodemon, ESLint, npm, Python venv |
| **Integration** | REST/JSON; JWT bearer auth (client↔backend); `fetch` with timeout + graceful fallback (backend↔AI) |

---

## 17. References

**Reference platforms and applied AI literature (from the project proposal's Literature Review,
[§6](#6-literature-review)):**

1. Airbnb — https://www.airbnb.com/ *(reference for the recommendation-engine concept and
   structured listing/review model)*
2. Booking.com — https://www.booking.com/ *(reference for structured listing, rating
   aggregation, and anomaly/fraud moderation)*
3. "AI-review use by Airbnb" — https://migrationletters.com/index.php/ml/article/view/8919
   *(reference for applying sentiment/AI analysis to short guest reviews)*
4. "Recommender systems in real estate: a systematic review" —
   https://www.researchgate.net/publication/392295516_Recommender_systems_in_real_estate_a_systematic_review
   *(reference for content-based vs. collaborative-filtering trade-offs in property recommenders)*

**Standards referenced by the SRS ([§7](#7-requirements-specification-srs-summary)):**

5. IEEE 830 / ISO/IEC/IEEE 29148 — Software Requirements Specification standard —
   https://ieeexplore.ieee.org/document/720574
6. Software requirements specification (overview) — Wikipedia —
   https://en.wikipedia.org/wiki/Software_requirements_specification

**Primary project documents (this repository):**

7. Project Proposal — *CampusNest (AI-Powered Student Accommodation (Hostels) Recommendation and
   Verification Web Application)*, BSD 3106, Leon John Makau (23/05483), KCA University,
   supervised by Ernest Madara.
8. Software Requirements Specification — `docs/Project_BSD3106_SRS_23_05483_Leon_john.docx`.
9. Manual Test Plan — `docs/MANUAL_TEST_PLAN.md`.
10. API Smoke Tests — `docs/API_SMOKE_TESTS.md`.

---

*Prepared as the reference document for the CampusNest final-year project report and
presentation. All technical details are drawn directly from the project's source code
(`backend/`, `frontend/`, `ai-service/`, `database/`), the approved Project Proposal, the SRS
(`docs/Project_BSD3106_SRS_23_05483_Leon_john.docx`), the README, and version-control history.*
