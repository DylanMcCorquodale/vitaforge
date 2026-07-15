import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { ValidationError } from "../src/validation.js";

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function validateRegistration(input) {
  const name = String(input.name || "").trim();
  const email = normalizeEmail(input.email);
  const password = String(input.password || "");
  if (name.length < 2 || name.length > 100) throw new ValidationError("Name must be between 2 and 100 characters.");
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) throw new ValidationError("Enter a valid email address.");
  if (password.length < 8 || password.length > 200) throw new ValidationError("Password must be between 8 and 200 characters.");
  return { name, email, password };
}

export function validateLogin(input) {
  const email = normalizeEmail(input.email);
  const password = String(input.password || "");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new ValidationError("Enter a valid email address.");
  if (!password) throw new ValidationError("Password is required.");
  return { email, password };
}

export function createPasswordRecord(password) {
  const salt = randomBytes(16).toString("hex");
  return { passwordSalt: salt, passwordHash: scryptSync(password, salt, 64).toString("hex") };
}

export function verifyPassword(password, salt, storedHash) {
  const expected = Buffer.from(storedHash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createSessionRecord(userId) {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    record: {
      tokenHash: hashToken(token),
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  };
}

export function hashToken(token) {
  return createHash("sha256").update(String(token || "")).digest("hex");
}

export function bearerToken(request) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
}

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt
  };
}
