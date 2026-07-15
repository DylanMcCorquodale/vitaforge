import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createLog,
  databasePath,
  deleteLog,
  deleteSession,
  getLogs,
  loginUser,
  registerUser,
  updateLog,
  userForToken
} from "./database.js";
import { buildInsights, exerciseCatalog, foodCatalog, searchCatalog } from "../src/health.js";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(rootDir, "dist");
const port = Number(process.env.PORT || 5177);
const contentTypes = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png" };

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(body));
}

async function body(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function tokenFrom(request) {
  return request.headers.authorization?.replace(/^Bearer\s+/i, "") || "";
}

function requireUser(request, response) {
  const user = userForToken(tokenFrom(request));
  if (!user) sendJson(response, 401, { error: "Sign in to continue." });
  return user;
}

async function staticFile(pathname, response) {
  const requestPath = pathname === "/" ? "/index.html" : pathname;
  let filePath = normalize(join(publicDir, requestPath));
  if (!filePath.startsWith(publicDir)) return sendJson(response, 403, { error: "Forbidden" });
  try {
    const file = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream" });
    response.end(file);
  } catch {
    try {
      const index = await readFile(join(publicDir, "index.html"));
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(index);
    } catch {
      sendJson(response, 503, { error: "Frontend build not found. Run npm run build first." });
    }
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  try {
    if (request.method === "GET" && url.pathname === "/api/health") return sendJson(response, 200, { ok: true, database: databasePath() });
    if (request.method === "POST" && url.pathname === "/api/auth/register") return sendJson(response, 201, registerUser(await body(request)));
    if (request.method === "POST" && url.pathname === "/api/auth/login") return sendJson(response, 200, loginUser(await body(request)));
    if (request.method === "POST" && url.pathname === "/api/auth/logout") { deleteSession(tokenFrom(request)); return sendJson(response, 200, { ok: true }); }
    if (request.method === "GET" && url.pathname === "/api/me") {
      const user = requireUser(request, response); if (!user) return; return sendJson(response, 200, { user });
    }
    if (request.method === "GET" && url.pathname === "/api/foods/search") return sendJson(response, 200, { foods: searchCatalog(foodCatalog, url.searchParams.get("q") || "") });
    if (request.method === "GET" && url.pathname === "/api/exercises/search") return sendJson(response, 200, { exercises: searchCatalog(exerciseCatalog, url.searchParams.get("q") || "") });

    if (url.pathname === "/api/logs" || url.pathname === "/api/insights" || url.pathname.startsWith("/api/logs/")) {
      const user = requireUser(request, response); if (!user) return;
      if (request.method === "GET" && url.pathname === "/api/logs") return sendJson(response, 200, { logs: getLogs(user.id) });
      if (request.method === "POST" && url.pathname === "/api/logs") return sendJson(response, 201, { log: createLog(user.id, await body(request)) });
      if (request.method === "GET" && url.pathname === "/api/insights") return sendJson(response, 200, buildInsights(getLogs(user.id)));
      const match = url.pathname.match(/^\/api\/logs\/([^/]+)$/);
      if (match && request.method === "PATCH") {
        const log = updateLog(user.id, match[1], await body(request));
        return log ? sendJson(response, 200, { log }) : sendJson(response, 404, { error: "Log not found." });
      }
      if (match && request.method === "DELETE") return deleteLog(user.id, match[1]) ? sendJson(response, 200, { ok: true }) : sendJson(response, 404, { error: "Log not found." });
    }

    if (request.method === "GET" || request.method === "HEAD") return staticFile(url.pathname, response);
    sendJson(response, 404, { error: "Not found." });
  } catch (error) {
    const message = error instanceof SyntaxError ? "Request body must be valid JSON." : error.message;
    const status = /exists|valid|least|incorrect|already/i.test(message) ? 400 : 500;
    sendJson(response, status, { error: message });
  }
});

server.listen(port, () => {
  console.log(`VitaForge running at http://localhost:${port}`);
  console.log(`SQLite database: ${databasePath()}`);
});
