# Capstone Frontend Control Flow

## Route flow

- `/` presents the VitaForge preview and entry point.
- `/login` provides a dedicated authentication route.
- `/dashboard` is the authenticated journal route, with links to its log, insights, and catalog sections.
- Next.js App Router resolves each route and renders the shared typed React application.

## Authentication flow

1. The browser posts registration or login data to a Next.js route handler.
2. The server validates credentials, creates a random session, stores only its SHA-256 hash, and returns the raw token in an `httpOnly`, `SameSite=Lax` cookie.
3. Client JavaScript cannot read the cookie. Same-origin API requests include it automatically.
4. `/api/me` determines whether the current browser session is authenticated.
5. Logout revokes the MongoDB session and expires the cookie.

## Dashboard data flow

1. Authenticated startup requests `/api/me`, `/api/logs`, and `/api/insights`.
2. MongoDB repository functions scope all records by the authenticated user ID.
3. `/api/insights` calculates averages, streaks, timeline scores, and correlations on the server.
4. Create, update, and delete actions mutate one owned MongoDB document, then refresh logs and insights together.
5. Real accounts begin empty; the fixed sample dataset is used only for the unauthenticated preview.

## Search flow

Food and exercise inputs call same-origin search endpoints after a short debounce. Those endpoints currently search curated in-repository demonstration catalogs. They are adapter boundaries for a future external provider, not live third-party API integrations.

## Error flow

Validation, unauthorized, and conflict failures use typed errors. The API maps them to `400`, `401`, and `409` respectively; unexpected failures return `500`. The client displays the human-readable API message without classifying errors by message text.
