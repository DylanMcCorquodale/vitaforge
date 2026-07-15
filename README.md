# VitaForge

VitaForge is a full-stack wellness journal that helps users see how movement, nutrition, sleep, hydration, mood, energy, and productivity move together over time.

The application turns daily self-reported habits into an explainable wellness score, simple correlations, and practical recommendations. It is an educational portfolio project, not a medical device or a substitute for professional advice.

## Features

- Account registration and login with salted password hashing
- Seven-day session tokens and protected user data
- Create, read, update, and delete daily wellness logs
- Persistent SQLite storage during local development
- Netlify Function and Netlify Blobs persistence when deployed
- Average mood, energy, productivity, sleep, protein, and streak metrics
- Wellness timeline with editable entries
- Correlations for workout-to-mood, sleep-to-energy, and protein-to-productivity
- Explainable recommendation cards
- API-backed food and exercise catalog searches
- Responsive React interface with an unauthenticated sample-data preview
- Unit and database integration tests

## Technology

- React and Vite
- Node.js REST API
- SQLite using Node's built-in database module
- Netlify Functions and Netlify Blobs for deployed persistence
- Node crypto (`scrypt`) for password hashing and random session tokens
- CSS with responsive desktop and mobile layouts

## Capstone Documentation

- [Initial project ideas](docs/INITIAL_PROJECT_IDEAS.md)
- [Project proposal](docs/PROJECT_PROPOSAL.md)
- [Database model](docs/DATA_MODEL.md)
- [API specification](docs/API_SPECIFICATION.md)
- [Submission checklist](docs/SUBMISSION_CHECKLIST.md)
- [Deployment guide](DEPLOY.md)

## Project Structure

- `src/App.jsx`: React UI, authentication flow, dashboard state, and CRUD interactions
- `src/health.js`: wellness scoring, correlations, search catalogs, and input normalization
- `src/api.js`: authenticated API client
- `server/database.js`: SQLite schema, authentication, sessions, and log operations
- `server/server.js`: local REST API and production-build server
- `netlify/functions/api.mjs`: deployed REST API using Netlify Blobs
- `tests/health.test.js`: health-domain unit tests
- `tests/database.test.js`: authentication and database integration tests

## Running Locally

Install dependencies, build the React application, and start the API server:

```bash
npm install
npm test
npm run build
npm start
```

Open `http://localhost:5177`.

For frontend development, run `npm run dev` in one terminal and `npm start` in another. Vite runs at `http://localhost:5176` and proxies `/api` requests to the local API.

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

## Security and Privacy Scope

- Passwords are never stored directly; local and deployed APIs store a salted `scrypt` hash.
- Daily logs are scoped to the authenticated user.
- Session tokens expire after seven days and can be revoked through logout.
- Production hardening would add verified email ownership, password reset, rate limiting, secure cookies, audit logging, data export/deletion, and a formal privacy review.
- Wellness insights describe correlations in the user's entries and do not make diagnoses.

## Portfolio Explanation

> VitaForge is a React and Node full-stack capstone that connects daily wellness habits with mood, energy, and productivity. I built account authentication, protected CRUD APIs, SQLite persistence, deployed Blob storage, automated tests, responsive UI, and an explainable correlation engine. The product deliberately presents patterns as personal observations rather than medical conclusions.
