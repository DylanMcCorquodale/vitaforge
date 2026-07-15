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
- [x] Added domain, authentication, validation, and optional MongoDB integration tests
- [x] Confirmed `npm test` passes without a configured database
- [x] Confirmed `npm run build` succeeds with all Next.js routes
- [x] Confirmed `npm audit --omit=dev` reports zero vulnerabilities
- [x] Ran the live MongoDB integration suite against MongoDB 8.0.20 using the local Compass workflow on July 14, 2026
- [x] Verified the production app and `/api/health` endpoint return HTTP 200 with MongoDB connected
- [x] Connected the application to a free MongoDB Atlas cluster
- [x] Deployed [VitaForge on Vercel](https://vitaforge-six.vercel.app)
- [x] Verified the live homepage, database health endpoint, registration, starter logs, CRUD operations, logout, and session revocation

## Required documentation

- [x] [Initial project ideas](INITIAL_PROJECT_IDEAS.md)
- [x] [Project proposal](PROJECT_PROPOSAL.md)
- [x] [MongoDB model](DATA_MODEL.md)
- [x] [API specification](API_SPECIFICATION.md)
- [x] [Main README](../README.md)
- [x] [Deployment guide](../DEPLOY.md)

## Repository and submission

- [x] Initialized Git and preserved the original MVP on `main`
- [x] Completed final work on local `dev`
- [x] Created the public VitaForge GitHub repository after owner approval
- [x] Pushed `main` and `dev`
- [x] Opened pull request #1 from `dev` into `main` and left it unmerged for review
- [ ] Obtain or document mentor approval for the idea and proposal
- [ ] Click **Ready To Submit** in the course portal

## Remaining external requirements

The implementation matches the requested Next.js, React, and MongoDB stack. It has been verified against local MongoDB 8.0.20 and a free MongoDB Atlas cluster, published to GitHub, and deployed successfully on Vercel. Mentor approval and the final course-portal submission remain outstanding.
