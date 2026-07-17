import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, UnauthorizedError } from "../lib/errors";

const repository = vi.hoisted(() => ({
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  userForRequest: vi.fn(),
  listLogs: vi.fn(),
  createLog: vi.fn(),
  updateLog: vi.fn(),
  removeLog: vi.fn()
}));

vi.mock("../lib/repository", () => repository);

import { POST as register } from "../app/api/auth/register/route";
import { POST as login } from "../app/api/auth/login/route";
import { GET as listLogs, POST as createLog } from "../app/api/logs/route";
import { PATCH as updateLog, DELETE as deleteLog } from "../app/api/logs/[id]/route";

const request = (path: string, method = "GET", body?: unknown) => new Request(`http://localhost${path}`, {
  method,
  headers: body === undefined ? undefined : { "content-type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body)
});

describe("authentication HTTP route handlers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201 and an httpOnly cookie after registration", async () => {
    repository.register.mockResolvedValue({ user: { id: "USR-1", name: "Dylan", email: "dylan@example.com" }, token: "secret-token" });
    const response = await register(request("/api/auth/register", "POST", { name: "Dylan", email: "dylan@example.com", password: "StrongPass123!" }));

    expect(response.status).toBe(201);
    expect(response.headers.get("set-cookie")).toMatch(/vitaforge_session=.*HttpOnly.*SameSite=Lax/i);
  });

  it("returns 401 for incorrect credentials", async () => {
    repository.login.mockRejectedValue(new UnauthorizedError("Email or password is incorrect."));
    const response = await login(request("/api/auth/login", "POST", { email: "dylan@example.com", password: "wrong-password" }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Email or password is incorrect." });
  });

  it("returns 409 for a duplicate registration", async () => {
    repository.register.mockRejectedValue(new ConflictError("An account already exists for this email."));
    const response = await register(request("/api/auth/register", "POST", { name: "Dylan", email: "dylan@example.com", password: "StrongPass123!" }));

    expect(response.status).toBe(409);
  });
});

describe("daily log HTTP route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository.userForRequest.mockResolvedValue({ id: "USR-1", name: "Dylan", email: "dylan@example.com" });
  });

  it("returns 401 when a log request has no session", async () => {
    repository.userForRequest.mockResolvedValue(null);
    const response = await listLogs(request("/api/logs"));
    expect(response.status).toBe(401);
  });

  it("returns 200 with the authenticated user's logs", async () => {
    repository.listLogs.mockResolvedValue([{ id: "LOG-1", date: "2026-07-17" }]);
    const response = await listLogs(request("/api/logs"));
    expect(response.status).toBe(200);
    expect((await response.json()).logs).toHaveLength(1);
    expect(repository.listLogs).toHaveBeenCalledWith("USR-1");
  });

  it("returns 201 after creating a log", async () => {
    repository.createLog.mockResolvedValue({ id: "LOG-1", date: "2026-07-17" });
    const response = await createLog(request("/api/logs", "POST", { date: "2026-07-17" }));
    expect(response.status).toBe(201);
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await createLog(new Request("http://localhost/api/logs", { method: "POST", body: "{" }));
    expect(response.status).toBe(400);
  });

  it("returns 404 when updating a missing log", async () => {
    repository.updateLog.mockResolvedValue(null);
    const response = await updateLog(request("/api/logs/missing", "PATCH", { notes: "Updated" }), { params: Promise.resolve({ id: "missing" }) });
    expect(response.status).toBe(404);
  });

  it("returns 404 when deleting a missing log", async () => {
    repository.removeLog.mockResolvedValue(false);
    const response = await deleteLog(request("/api/logs/missing", "DELETE"), { params: Promise.resolve({ id: "missing" }) });
    expect(response.status).toBe(404);
  });
});
