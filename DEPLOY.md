# Deploying VitaForge

## Netlify

The repository includes `netlify.toml`. Netlify should detect these settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

Requests to `/api/*` are redirected to the VitaForge Netlify Function. The function stores users, sessions, and daily logs in the `vitaforge-live-data` Blob store.

## Verification

After deployment, verify:

1. `/` loads the React application.
2. `/api/health` returns `{ "ok": true, "database": "netlify-blobs" }`.
3. A new user can register and receives six sample logs.
4. The user can add, edit, and delete a daily log.
5. Signing out prevents access to protected logs.
6. Food and exercise searches return results.

## Local Production Check

```bash
npm test
npm run build
npm start
```

Then open `http://localhost:5177`.
