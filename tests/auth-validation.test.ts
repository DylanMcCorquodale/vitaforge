import { describe, expect, it } from "vitest";
import { createPasswordRecord, createSessionRecord, hashToken, requestToken, validateLogin, validateRegistration, verifyPassword } from "../lib/auth";
import { ConflictError, UnauthorizedError } from "../lib/errors";
import { errorResponse } from "../lib/http";
import { authenticatedResponse } from "../lib/session-cookie";
import { finiteNumber, validateDailyLog, validDate } from "../src/validation";

describe("authentication and validation", () => {
  it("hashes passwords and session tokens", () => {
    const password = "strong-test-password";
    const record = createPasswordRecord(password);
    expect(record.passwordHash).not.toBe(password);
    expect(verifyPassword(password, record.passwordSalt, record.passwordHash)).toBe(true);
    const session = createSessionRecord("USR-test");
    expect(session.record.tokenHash).toBe(hashToken(session.token));
    expect(session.record.tokenHash).not.toBe(session.token);
  });

  it("normalizes valid credentials", () => {
    const password = "strong-test-password";
    expect(validateRegistration({ name: " Test User ", email: "TEST@Example.com", password })).toEqual({ name: "Test User", email: "test@example.com", password });
    expect(validateLogin({ email: "TEST@Example.com", password })).toEqual({ email: "test@example.com", password });
  });

  it("rejects invalid numeric and date values", () => {
    for (const badValue of [undefined, null, "", "abc", Number.NaN, Infinity, -Infinity]) expect(() => finiteNumber(badValue, "Mood", { min: 1, max: 10 })).toThrow(/required|finite number/);
    expect(() => validDate("2026-02-30")).toThrow(/valid calendar date/);
    expect(() => validateDailyLog({ date: "2026-07-14", mood: 7 })).toThrow();
  });

  it("maps typed errors to RESTful statuses", async () => {
    expect(errorResponse(new UnauthorizedError()).status).toBe(401);
    expect(errorResponse(new ConflictError("Duplicate.")).status).toBe(409);
  });

  it("keeps the session token in an httpOnly same-site cookie", () => {
    const response = authenticatedResponse({ user: { id: "USR-test" } }, "secret-token");
    const cookie = response.headers.get("set-cookie") || "";
    expect(cookie).toContain("vitaforge_session=secret-token");
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("samesite=lax");
    expect(requestToken(new Request("http://localhost", { headers: { cookie: "vitaforge_session=secret-token" } }))).toBe("secret-token");
  });
});
