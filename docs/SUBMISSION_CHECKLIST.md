# Capstone Step 6 - Submission Checklist

Reviewed against the supplied Step 6 instructions and external code-review feedback on July 14, 2026.

## Build and test

- [x] Configured project structure with Next.js App Router
- [x] Created UI components and state management with React
- [x] Implemented MongoDB CRUD through Next.js route handlers
- [x] Added registration, login, logout, expiring sessions, and per-user authorization
- [x] Added unique MongoDB indexes for email and `(userId, date)`
- [x] Replaced shared-state Blob writes with atomic per-record MongoDB operations
- [x] Added strict validation for missing, malformed, non-finite, and out-of-range input
- [x] Integrated the React UI with backend data fetching and mutation
- [x] Added responsive CSS styling
- [x] Migrated application, API, and domain code to TypeScript
- [x] Added real `/login` and `/dashboard` routes
- [x] Split authentication and daily-log forms into reusable React components
- [x] Replaced browser-readable localStorage tokens with httpOnly SameSite cookies
- [x] Replaced message-regex error classification with typed 400/401/409 errors
- [x] Kept fabricated sample entries in preview mode instead of real user histories
- [x] Connected the dashboard to the server `/api/insights` endpoint
- [x] Added Vitest domain, authentication, validation, component, HTTP-route, and optional MongoDB integration tests
- [x] Required `MONGODB_TEST_DB` for live database tests
- [x] Added the required frontend control-flow document
- [x] Confirmed `npm test` passes without a configured database
- [x] Confirmed `npm run build` succeeds with all Next.js routes
- [x] Confirmed `npm audit --omit=dev` reports zero vulnerabilities
- [x] Ran the live MongoDB integration suite against MongoDB 8.0.20 using the local Compass workflow on July 14, 2026
- [x] Verified the production app and `/api/health` endpoint return HTTP 200 with MongoDB connected
- [x] Connected the application to a free MongoDB Atlas cluster
- [x] Deployed [VitaForge on Vercel](https://vitaforge-six.vercel.app)
- [x] Verified the live homepage, database health endpoint, registration, CRUD operations, logout, and session revocation

## Required documentation

- [x] [Initial project ideas](INITIAL_PROJECT_IDEAS.md)
- [x] [Project proposal](PROJECT_PROPOSAL.md)
- [x] [MongoDB model](DATA_MODEL.md)
- [x] [API specification](API_SPECIFICATION.md)
- [x] [Main README](../README.md)
- [x] [Deployment guide](../DEPLOY.md)
- [x] [Frontend control flow](FRONTEND_CONTROL_FLOW.md)

## Repository and submission

- [x] Initialized Git and preserved the original MVP on `main`
- [x] Completed final work on local `dev`
- [x] Created the public VitaForge GitHub repository after owner approval
- [x] Pushed `main` and `dev`
- [x] Opened pull request #1 from `dev` into `main` and left it unmerged for review
- [x] Received mentor PR review and documented requested improvements on July 16, 2026
- [ ] Receive official grading decision
- [ ] Click **Ready To Submit** in the course portal

## Remaining external requirements

The implementation matches the requested TypeScript, Next.js, React, and MongoDB stack. Mentor review feedback has been addressed locally. The updated branch still needs to be pushed/deployed and the `main` versus unmerged-PR submission decision must be reconciled before official grading and the final course-portal action.
