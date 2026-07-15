# VitaForge

VitaForge is a full-stack wellness journal that helps users see how movement, nutrition, sleep, hydration, mood, energy, and productivity move together over time.

**Live application:** [vitaforge-six.vercel.app](https://vitaforge-six.vercel.app)

The application turns daily self-reported habits into an explainable wellness score, simple correlations, and practical recommendations. It is an educational portfolio project, not a medical device or a substitute for professional advice.

## Features

- Next.js App Router interface and API route handlers
- Account registration and login with salted `scrypt` password hashing
- Hashed, expiring, revocable session tokens
- Authenticated create, read, update, and delete operations for daily logs
- MongoDB collections with atomic per-record writes
- Unique email and `(userId, date)` indexes that prevent concurrency-related duplicates
- Strict validation that rejects missing, malformed, `NaN`, infinite, and out-of-range values
- Average mood, energy, productivity, sleep, protein, and streak metrics
- Wellness timeline with editable entries
- Correlations for workout-to-mood, sleep-to-energy, and protein-to-productivity
- Food and exercise search adapters
- Responsive React UI with an unauthenticated sample-data preview
- Unit, authentication, validation, and optional live-MongoDB integration tests

## Technology

- Next.js 16 App Router and React 19
- Next.js route handlers for the REST API
- MongoDB Node.js driver 7.5
- MongoDB Atlas-compatible persistence
- Node crypto for password and session security
- Responsive CSS

## Capstone Documentation

- [Initial project ideas](docs/INITIAL_PROJECT_IDEAS.md)
- [Project proposal](docs/PROJECT_PROPOSAL.md)
- [Database model](docs/DATA_MODEL.md)
- [API specification](docs/API_SPECIFICATION.md)
- [Submission checklist](docs/SUBMISSION_CHECKLIST.md)
- [Deployment guide](DEPLOY.md)

## Project Structure

- `app/page.jsx`: main Next.js page
- `app/api/**/route.js`: API route handlers
- `src/App.jsx`: authenticated React dashboard and CRUD interactions
- `src/health.js`: wellness scoring, correlations, streaks, and searches
- `src/validation.js`: strict daily-log validation
- `lib/mongodb.js`: pooled MongoDB connection and index creation
- `lib/repository.js`: atomic account, session, and daily-log operations
- `lib/auth.js`: password hashing, token hashing, and credential validation
- `tests/`: domain, security, validation, and MongoDB integration tests

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Replace `MONGODB_URI` with a MongoDB Atlas or local MongoDB connection string.
3. Install, test, and run:

```bash
npm install
npm test
npm run dev
```

Open `http://localhost:3000`.

`npm test` always runs the health, authentication, and validation suites. The MongoDB integration suite runs automatically when `.env.local` contains `MONGODB_URI`; otherwise it reports a clear skip.

### MongoDB Compass workflow

For the local workflow taught in Springboard, start the MongoDB server and connect MongoDB Compass to `mongodb://127.0.0.1:27017`. Use this local configuration in `.env.local`:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/?directConnection=true
MONGODB_DB=vitaforge
```

Compass is the graphical interface for viewing the local `vitaforge` database. MongoDB Atlas provides a hosted database when the application is deployed publicly. The committed `.env.example` shows the Atlas format; `.env.local` is ignored by Git so credentials are not published.

Production check:

```bash
npm run build
npm start
```

## API Routes

```text
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/me
GET    /api/logs
POST   /api/logs
PATCH  /api/logs/:id
DELETE /api/logs/:id
GET    /api/insights
GET    /api/foods/search?q=chicken
GET    /api/exercises/search?q=run
```

Protected routes require `Authorization: Bearer <token>`.

## Concurrency and Data Integrity

VitaForge does not store the whole application in one shared document. Users, sessions, and daily logs are separate MongoDB documents. Creating a user or log is an atomic insert, updates target one owned document, and unique indexes enforce email and per-day uniqueness even when requests arrive concurrently. MongoDB's TTL index removes expired sessions.

## Security and Privacy Scope

- Passwords are stored only as salted `scrypt` hashes.
- Raw session tokens are returned to the client once; MongoDB stores only their SHA-256 hashes.
- Every log operation includes the authenticated `userId`.
- Input validation rejects non-finite and out-of-range values before persistence.
- A larger public release should add verified email ownership, password reset, login rate limiting, secure HTTP-only cookies, audit logs, and formal privacy controls.
- Wellness insights describe correlations and do not make diagnoses.

## Portfolio Explanation

> VitaForge is a Next.js and MongoDB full-stack capstone that connects daily wellness habits with mood, energy, and productivity. I built authentication, protected CRUD route handlers, atomic MongoDB persistence, strict validation, automated tests, responsive UI, and an explainable correlation engine. The product deliberately presents patterns as personal observations rather than medical conclusions.
