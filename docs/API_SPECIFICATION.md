# Capstone Step 5 - API Specification

## Overview

VitaForge uses typed Next.js App Router route handlers to expose a REST-style JSON API backed by MongoDB. Protected routes use an `httpOnly`, `SameSite=Lax` session cookie. MongoDB stores only a SHA-256 hash of each raw session token.

## Endpoints

| Method | Route | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Verify API availability and identify the data store |
| POST | `/api/auth/register` | No | Create an account, seed demonstration logs, and start a session |
| POST | `/api/auth/login` | No | Verify credentials and start a session |
| POST | `/api/auth/logout` | Token | Revoke the current session |
| GET | `/api/me` | Token | Return the authenticated public profile |
| GET | `/api/logs` | Token | List the user's daily logs in date order |
| POST | `/api/logs` | Token | Create a daily log |
| PATCH | `/api/logs/:id` | Token | Update one owned daily log |
| DELETE | `/api/logs/:id` | Token | Delete one owned daily log |
| GET | `/api/insights` | Token | Calculate averages, timeline, streak, correlations, and recommendations |
| GET | `/api/foods/search?q=` | No | Search normalized food results |
| GET | `/api/exercises/search?q=` | No | Search normalized exercise results |

## Authentication requests

`POST /api/auth/register`

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "a-long-private-password"
}
```

Successful response (`201`):

```json
{
  "user": {
    "id": "USR-...",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "createdAt": "2026-07-14T18:00:00.000Z"
  },
}
```

`POST /api/auth/login` accepts `email` and `password` and returns the same public user shape with status `200`. Both authentication endpoints set the protected session cookie; password hashes, salts, and raw tokens are never returned in JSON.

## Daily log contract

`POST /api/logs`

```json
{
  "date": "2026-07-14",
  "mood": 8,
  "energy": 7,
  "productivity": 9,
  "sleepHours": 7.5,
  "waterCups": 8,
  "workoutMinutes": 40,
  "workoutIntensity": "Moderate",
  "calories": 2350,
  "protein": 145,
  "notes": "Good focus after an early workout."
}
```

The response is `{ "log": { ... } }` with generated `id`, `createdAt`, and `updatedAt` fields. `PATCH /api/logs/:id` accepts the same fields. `DELETE` returns `{ "ok": true }`.

## Search contracts

`GET /api/foods/search?q=chicken`

```json
{
  "foods": [
    { "name": "Chicken breast bowl", "calories": 620, "protein": 58, "carbs": 54, "fat": 16 }
  ]
}
```

`GET /api/exercises/search?q=run`

```json
{
  "exercises": [
    { "name": "Zone 2 run", "type": "Cardio", "minutes": 35, "intensity": "Moderate" }
  ]
}
```

## Status and error behavior

- `200`: successful read, update, delete, login, or logout
- `201`: account or daily log created
- `400`: invalid input
- `401`: incorrect credentials or missing, expired, or invalid session
- `409`: duplicate email or user/date record
- `404`: owned resource or route not found
- `500`: unexpected local server failure

Errors use `{ "error": "Human-readable message" }`.

## Future API work

- Secure cookie sessions, CSRF protection, rate limits, and login throttling
- Email verification, password reset, account deletion, and data export
- USDA and exercise-provider adapters with caching and source attribution
- Pagination and date-range filters
- API versioning and schema validation
