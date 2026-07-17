# Deploying VitaForge

VitaForge supports both the MongoDB Compass workflow used for local development and MongoDB Atlas for a publicly reachable deployment. Compass connects to a MongoDB server; it does not host the database for Vercel.

## Prerequisites

- A MongoDB Atlas database or another reachable MongoDB deployment
- A Vercel account connected to GitHub
- The VitaForge GitHub repository

## MongoDB Atlas

1. Create a free Atlas cluster.
2. Create a database user with a strong unique password.
3. Configure network access for the deployment environment.
4. Copy the application connection string.
5. Do not commit the connection string or password.

## Vercel

1. Import the VitaForge GitHub repository.
2. Keep the detected Next.js framework settings.
3. Add these encrypted environment variables:

```text
MONGODB_URI=<Atlas connection string>
MONGODB_DB=vitaforge
```

4. Deploy from `dev` for review or from the approved production branch.

## Verification

After deployment, verify:

1. `/` loads the Next.js application.
2. `/api/health` reports `{ "ok": true, "database": "mongodb" }`.
3. A new account starts with an empty real journal; sample logs remain confined to preview mode.
4. A user can add, edit, and delete a log.
5. Duplicate emails and duplicate user/date logs are rejected.
6. Signing out revokes the session.
7. A request using the revoked token receives `401`.
8. Food and exercise searches return normalized results.

## Local Production Check

With a local MongoDB server running, connect Compass to `mongodb://127.0.0.1:27017` and set `.env.local` to:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/?directConnection=true
MONGODB_DB=vitaforge
```

```bash
npm test
npm run build
npm start
```

Open `http://localhost:3000`.
