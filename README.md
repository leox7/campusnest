# CampusNest

**Target user**: University students near their campuses.

**Problem**: Difficulty finding legitimate hostels and services.

**Solution**: A simple accommodation marketplace with verified listings, bookings,
simulated payments, reviews, and AI-assisted recommendations, sentiment, and
fraud checks.

CampusNest has three roles — **student**, **landlord**, and **admin** — each with
its own login, dashboard, and API surface. It is a two-part app: an Express +
MySQL REST API (`backend/`) and a React + Vite SPA (`frontend/`), plus an optional
Python FastAPI AI microservice (`ai-service/`). Prices are displayed in **KSH**.

**MVP features**

- Hostels listed near campus with images and details
- Students browse verified listings, view details, save, book, and pay (simulated)
- Students review hostels they have confirmed bookings for
- Landlords manage their own listings and images
- Admin verifies listings and manages users

---

## Getting Started

Prerequisites: **Node.js 18+**, **MySQL 8+**, and (optional) **Python 3.11+** for the AI service.

Run the four steps below in order. Use four terminals for the long-running dev servers.

### 1. Database — MySQL

Create the schema (this **drops and recreates** the `student_accommodation`
database and seeds the default admin), then load the demo data:

```bash
mysql -u root -p < database/CAMPUSNEST.sql
mysql -u root -p < database/seed_demo.sql     # optional demo hostels/users/bookings
```

Demo accounts seeded by `seed_demo.sql` use password `Password123`. The admin
account (`campusnestai@gmail.com`) is created by `CAMPUSNEST.sql` and is left
untouched by the seed — log in with its existing password.

| Role | Email | Password |
|------|-------|----------|
| Admin | campusnestai@gmail.com | (existing admin password) |
| Landlord | landlord.demo@campusnest.test | Password123 |
| Student | student.demo@campusnest.test | Password123 |

### 2. Backend — Express API

```bash
cd backend
npm install
# create backend/.env (see below), then:
npm run dev            # starts on http://localhost:5000 (nodemon hot reload)
```

Required `backend/.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_accommodation
PORT=5000
JWT_SECRET=change_me_to_a_long_random_string
JWT_EXPIRES_IN=1d
# Optional AI service wiring:
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT_MS=4000
```

> `JWT_SECRET` is required — every login and auth-protected request fails without it.
> `DB_NAME` must match the database name in `CAMPUSNEST.sql` (`student_accommodation`).

Health check: `GET http://localhost:5000/health`.

### 3. Frontend — React + Vite SPA

```bash
cd frontend
npm install
# optional: create frontend/.env with VITE_API_BASE_URL (defaults to http://localhost:5000)
npm run dev            # starts on http://localhost:5173
```

Other frontend commands: `npm run build`, `npm run preview`, `npm run lint`.

### 4. AI microservice (optional) — FastAPI

The AI service powers recommendations, review sentiment, and listing
fraud/anomaly detection. It is integrated with the backend over REST only, and
the backend **degrades gracefully**: if this service is not running, the main app
keeps working and simply skips the AI-enhanced behaviour.

```bash
cd ai-service
python -m venv venv                 # first time only
venv\Scripts\activate               # Windows
# source venv/bin/activate          # macOS / Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The service listens on `http://localhost:8000` (health check: `GET /health`).
Endpoints: `POST /recommend`, `POST /sentiment`, `POST /fraud`.

---

## Testing & documentation

- Manual test plan (FR-1–FR-27): [docs/MANUAL_TEST_PLAN.md](docs/MANUAL_TEST_PLAN.md)
- API smoke tests (curl for every endpoint): [docs/API_SMOKE_TESTS.md](docs/API_SMOKE_TESTS.md)

---

## Project structure

```
backend/     Express + MySQL REST API (ES modules)
frontend/    React 19 + React Router 7 + Vite SPA
ai-service/  Python FastAPI microservice (recommend / sentiment / fraud)
database/    CAMPUSNEST.sql (schema + admin seed) and seed_demo.sql (demo data)
docs/        Test plan and API smoke tests
```
