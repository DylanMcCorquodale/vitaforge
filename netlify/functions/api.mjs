import { getStore } from "@netlify/blobs";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { buildInsights, createLogFromForm, exerciseCatalog, foodCatalog, sampleLogs, searchCatalog } from "../../src/health.js";

const STORE = "vitaforge-live-data";
const KEY = "state";

const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}-${randomBytes(10).toString("hex")}`;
const email = (value) => String(value || "").trim().toLowerCase();

function initialState() {
  return { users: [], sessions: [], logs: [] };
}

async function readState() {
  const store = getStore(STORE);
  const state = await store.get(KEY, { type: "json" });
  return state || initialState();
}

async function writeState(state) {
  await getStore(STORE).setJSON(KEY, state);
}

function json(body, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function readJson(request) {
  try { return await request.json(); } catch { return {}; }
}

function pathFor(request) {
  return new URL(request.url).pathname
    .replace(/^\/api/, "")
    .replace(/^\/\.netlify\/functions\/api/, "")
    .replace(/\/$/, "");
}

function validate(input, needName = false) {
  if (needName && String(input.name || "").trim().length < 2) throw new Error("Name must be at least 2 characters.");
  if (!/^\S+@\S+\.\S+$/.test(email(input.email))) throw new Error("Enter a valid email address.");
  if (String(input.password || "").length < 8) throw new Error("Password must be at least 8 characters.");
}

function passwordHash(password, salt) {
  return scryptSync(password, salt, 64).toString("hex");
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

function addSession(state, userId) {
  const token = randomBytes(32).toString("hex");
  state.sessions.push({ token, userId, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() });
  return token;
}

function currentUser(request, state) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  state.sessions = state.sessions.filter((session) => session.expiresAt > now());
  const session = state.sessions.find((item) => item.token === token);
  return session ? state.users.find((user) => user.id === session.userId) : null;
}

function makeLog(userId, input, existing = {}) {
  const log = createLogFromForm({ ...existing, ...input });
  const timestamp = now();
  return {
    ...log,
    id: existing.id || id("LOG"),
    userId,
    createdAt: existing.createdAt || timestamp,
    updatedAt: timestamp
  };
}

export default async (request) => {
  const path = pathFor(request);
  const method = request.method;
  const state = await readState();

  try {
    if (method === "GET" && path === "/health") return json({ ok: true, database: "netlify-blobs", store: STORE });
    if (method === "GET" && path === "/foods/search") return json({ foods: searchCatalog(foodCatalog, new URL(request.url).searchParams.get("q") || "") });
    if (method === "GET" && path === "/exercises/search") return json({ exercises: searchCatalog(exerciseCatalog, new URL(request.url).searchParams.get("q") || "") });

    if (method === "POST" && path === "/auth/register") {
      const input = await readJson(request);
      validate(input, true);
      const normalized = email(input.email);
      if (state.users.some((user) => user.email === normalized)) return json({ error: "An account already exists for this email." }, 400);
      const salt = randomBytes(16).toString("hex");
      const user = { id: id("USR"), name: String(input.name).trim(), email: normalized, passwordSalt: salt, passwordHash: passwordHash(input.password, salt), createdAt: now() };
      state.users.push(user);
      state.logs.push(...sampleLogs.map((log) => makeLog(user.id, log)));
      const token = addSession(state, user.id);
      await writeState(state);
      return json({ user: publicUser(user), token }, 201);
    }

    if (method === "POST" && path === "/auth/login") {
      const input = await readJson(request);
      validate(input);
      const user = state.users.find((record) => record.email === email(input.email));
      if (!user) return json({ error: "Email or password is incorrect." }, 400);
      const expected = Buffer.from(user.passwordHash, "hex");
      const actual = Buffer.from(passwordHash(input.password, user.passwordSalt), "hex");
      if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return json({ error: "Email or password is incorrect." }, 400);
      const token = addSession(state, user.id);
      await writeState(state);
      return json({ user: publicUser(user), token });
    }

    if (method === "POST" && path === "/auth/logout") {
      const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
      state.sessions = state.sessions.filter((session) => session.token !== token);
      await writeState(state);
      return json({ ok: true });
    }

    const user = currentUser(request, state);
    if (!user) return json({ error: "Sign in to continue." }, 401);

    if (method === "GET" && path === "/me") return json({ user: publicUser(user) });
    if (method === "GET" && path === "/logs") return json({ logs: state.logs.filter((log) => log.userId === user.id).sort((a, b) => a.date.localeCompare(b.date)) });
    if (method === "GET" && path === "/insights") return json(buildInsights(state.logs.filter((log) => log.userId === user.id)));

    if (method === "POST" && path === "/logs") {
      const input = await readJson(request);
      if (state.logs.some((log) => log.userId === user.id && log.date === input.date)) return json({ error: "A log already exists for this date. Edit the existing entry instead." }, 400);
      const log = makeLog(user.id, input);
      state.logs.push(log);
      await writeState(state);
      return json({ log }, 201);
    }

    const match = path.match(/^\/logs\/([^/]+)$/);
    if (match && method === "PATCH") {
      const index = state.logs.findIndex((log) => log.id === match[1] && log.userId === user.id);
      if (index < 0) return json({ error: "Log not found." }, 404);
      const input = await readJson(request);
      if (state.logs.some((log, itemIndex) => itemIndex !== index && log.userId === user.id && log.date === input.date)) return json({ error: "A log already exists for this date." }, 400);
      state.logs[index] = makeLog(user.id, input, state.logs[index]);
      await writeState(state);
      return json({ log: state.logs[index] });
    }

    if (match && method === "DELETE") {
      const before = state.logs.length;
      state.logs = state.logs.filter((log) => !(log.id === match[1] && log.userId === user.id));
      if (state.logs.length === before) return json({ error: "Log not found." }, 404);
      await writeState(state);
      return json({ ok: true });
    }

    return json({ error: "Not found." }, 404);
  } catch (error) {
    return json({ error: error.message }, 400);
  }
};
