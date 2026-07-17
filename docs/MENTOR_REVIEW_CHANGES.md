# VitaForge Mentor Review — Resolution Report

This report maps Omar Qaddoumi's review of pull request #1 to the completed changes in this package.

Review: https://github.com/DylanMcCorquodale/vitaforge/pull/1

## Inline review comments

### 1. Fragile error classification and incorrect authentication status

**Comment:** Error messages were classified with a regular expression, and incorrect credentials returned HTTP 400 rather than 401.

**Resolution:** Added typed `UnauthorizedError` and `ConflictError` classes in `lib/errors.ts`. `lib/http.ts` now maps errors using `instanceof` only. Incorrect credentials return 401, duplicate records return 409, validation errors return 400, and unexpected failures return 500.

### 2. Session token stored in localStorage

**Comment:** A token in `localStorage` can be read by injected JavaScript.

**Resolution:** Removed browser token storage. Authentication now uses an `httpOnly`, `SameSite=Lax` cookie, with `Secure` enabled in production. Login and registration set the cookie; logout revokes the server-side session and clears the cookie. Session tokens remain SHA-256 hashed in MongoDB.

### 3. Sample records inserted into real user accounts

**Comment:** Six fabricated logs distorted real correlations and streaks.

**Resolution:** New accounts now begin with an empty log history. Sample records are used only in the unauthenticated preview and are never inserted into MongoDB.

### 4. Oversized App component

**Comment:** `App`, `AuthCard`, and `LogForm` lived in one 367-line file.

**Resolution:** Extracted reusable components into `src/components/AuthCard.tsx` and `src/components/LogForm.tsx`. Shared domain models are defined in `src/types.ts`.

### 5. Unused insights endpoint

**Comment:** `/api/insights` existed, but the frontend recomputed the same result locally.

**Resolution:** The authenticated dashboard now requests insights from `/api/insights`. Local computation remains only for the public preview, where no authenticated API data exists.

### 6. Bare assertion scripts and unsafe integration-test database selection

**Comment:** Tests lacked a real runner, component coverage, HTTP coverage, and a dedicated database requirement.

**Resolution:** Migrated the suite to Vitest with per-test reporting. Added React Testing Library coverage for authentication mode switching, authentication errors, the daily-log form, preview mode, and the authenticated dashboard. Added route-level HTTP coverage for registration, login, log listing/creation/update/deletion, RESTful 200/201/400/401/404/409 statuses, and food/exercise searches. Database integration tests require `MONGODB_TEST_DB`, preventing accidental writes to the normal application database.

## General rubric comments and GitHub issues

### Issue #2 — Frontend Control Flow document

**Resolution:** Added `docs/FRONTEND_CONTROL_FLOW.md`, covering the component tree, authentication state machine, routing, CRUD flows, catalog autofill, and insight refresh flow.

### Issue #3 — TypeScript migration

**Resolution:** Migrated application pages, route handlers, backend libraries, frontend code, and tests from JavaScript/JSX to TypeScript/TSX. Added `tsconfig.json`, `next-env.d.ts`, and typed shared models.

### Issue #4 — Component and HTTP tests

**Resolution:** Added Vitest, React Testing Library tests for `AuthCard`, `LogForm`, and preview/authenticated dashboard states, route-level HTTP tests for authentication, CRUD, error statuses, and catalog search, plus dedicated-database MongoDB integration coverage.

### Issue #5 — Routing

**Resolution:** Added real Next.js App Router pages for `/`, `/login`, and `/dashboard`. Unauthenticated `/dashboard` requests redirect to `/login`, and an authenticated visitor on `/login` is redirected to `/dashboard`. Navigation no longer relies only on single-page anchor links.

### Curated catalog disclosure

**Resolution:** The README now states explicitly that food and exercise results come from curated in-repository catalogs, not third-party live APIs.

### Default-branch process note

**Comment:** Merge the fixed pull request because graders commonly clone the default `main` branch.

**Status:** Complete. The reviewed fixes were pushed to `dev`, pull request #1 was merged into `main`, and the resulting production deployment passed.

## Additional resilience improvement

MongoDB connection setup now clears a failed cached connection attempt. If the database is temporarily unavailable and later returns, the application can retry without requiring a process restart.

## Verification completed

- `npm test`: 26 tests passed; 2 MongoDB integration tests skipped when `MONGODB_TEST_DB` was intentionally absent.
- `npm run build`: production build and TypeScript checking passed.
- `npm audit`: zero known package vulnerabilities.
- Live smoke test: health check, registration, empty new-account history, log creation, insights retrieval, logout, and session revocation all passed against an isolated local MongoDB database.

## Remaining account-level work

- Receive the official grading decision.
- Complete the final course-portal submission action.
- Recover Vercel 2FA later if direct access to deployment settings, environment variables, or account management is required.
