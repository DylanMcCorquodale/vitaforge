import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { createLogFromForm, sampleLogs } from "../src/health.js";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const dbPath = process.env.VITAFORGE_DB_PATH || join(rootDir, "data", "vitaforge.sqlite");
mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 10),
    energy INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 10),
    productivity INTEGER NOT NULL CHECK (productivity BETWEEN 1 AND 10),
    sleep_hours REAL NOT NULL CHECK (sleep_hours BETWEEN 0 AND 24),
    water_cups INTEGER NOT NULL CHECK (water_cups >= 0),
    workout_minutes INTEGER NOT NULL CHECK (workout_minutes >= 0),
    workout_intensity TEXT NOT NULL,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    protein INTEGER NOT NULL CHECK (protein >= 0),
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS daily_logs_user_date_idx ON daily_logs(user_id, date DESC);
  CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
`);

function id(prefix) {
  return `${prefix}-${randomBytes(10).toString("hex")}`;
}

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, createdAt: row.created_at };
}

function logFromRow(row) {
  return {
    id: row.id,
    date: row.date,
    mood: row.mood,
    energy: row.energy,
    productivity: row.productivity,
    sleepHours: row.sleep_hours,
    waterCups: row.water_cups,
    workoutMinutes: row.workout_minutes,
    workoutIntensity: row.workout_intensity,
    calories: row.calories,
    protein: row.protein,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateCredentials({ name, email, password }, requireName = false) {
  const normalizedEmail = normalizeEmail(email);
  if (requireName && String(name || "").trim().length < 2) throw new Error("Name must be at least 2 characters.");
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error("Enter a valid email address.");
  if (String(password || "").length < 8) throw new Error("Password must be at least 8 characters.");
  return normalizedEmail;
}

function hashPassword(password, salt) {
  return scryptSync(password, salt, 64).toString("hex");
}

function createSession(userId) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, userId, expiresAt);
  return token;
}

function insertLog(userId, input, logId = id("LOG")) {
  const log = createLogFromForm(input);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(log.date)) throw new Error("Date must use YYYY-MM-DD.");
  const timestamp = new Date().toISOString();
  db.prepare(`
    INSERT INTO daily_logs (
      id, user_id, date, mood, energy, productivity, sleep_hours, water_cups,
      workout_minutes, workout_intensity, calories, protein, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    logId, userId, log.date, log.mood, log.energy, log.productivity, log.sleepHours,
    log.waterCups, log.workoutMinutes, log.workoutIntensity, log.calories, log.protein,
    log.notes, timestamp, timestamp
  );
  return getLog(userId, logId);
}

export function registerUser(input) {
  const email = validateCredentials(input, true);
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) throw new Error("An account already exists for this email.");

  const userId = id("USR");
  const salt = randomBytes(16).toString("hex");
  const timestamp = new Date().toISOString();
  db.prepare("INSERT INTO users (id, name, email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(userId, String(input.name).trim(), email, hashPassword(input.password, salt), salt, timestamp);

  for (const log of sampleLogs) insertLog(userId, log);
  const user = publicUser(db.prepare("SELECT * FROM users WHERE id = ?").get(userId));
  return { user, token: createSession(userId) };
}

export function loginUser(input) {
  const email = validateCredentials(input);
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!row) throw new Error("Email or password is incorrect.");
  const expected = Buffer.from(row.password_hash, "hex");
  const actual = Buffer.from(hashPassword(input.password, row.password_salt), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error("Email or password is incorrect.");
  return { user: publicUser(row), token: createSession(row.id) };
}

export function userForToken(token) {
  if (!token) return null;
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(new Date().toISOString());
  const row = db.prepare(`
    SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token = ? AND sessions.expires_at > ?
  `).get(token, new Date().toISOString());
  return row ? publicUser(row) : null;
}

export function deleteSession(token) {
  if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function getLogs(userId) {
  return db.prepare("SELECT * FROM daily_logs WHERE user_id = ? ORDER BY date ASC").all(userId).map(logFromRow);
}

export function getLog(userId, logId) {
  const row = db.prepare("SELECT * FROM daily_logs WHERE id = ? AND user_id = ?").get(logId, userId);
  return row ? logFromRow(row) : null;
}

export function createLog(userId, input) {
  try {
    return insertLog(userId, input);
  } catch (error) {
    if (String(error.message).includes("UNIQUE constraint failed")) throw new Error("A log already exists for this date. Edit the existing entry instead.");
    throw error;
  }
}

export function updateLog(userId, logId, input) {
  const existing = getLog(userId, logId);
  if (!existing) return null;
  const log = createLogFromForm({ ...existing, ...input });
  const timestamp = new Date().toISOString();
  try {
    db.prepare(`
      UPDATE daily_logs SET date = ?, mood = ?, energy = ?, productivity = ?, sleep_hours = ?,
        water_cups = ?, workout_minutes = ?, workout_intensity = ?, calories = ?, protein = ?,
        notes = ?, updated_at = ? WHERE id = ? AND user_id = ?
    `).run(log.date, log.mood, log.energy, log.productivity, log.sleepHours, log.waterCups,
      log.workoutMinutes, log.workoutIntensity, log.calories, log.protein, log.notes,
      timestamp, logId, userId);
  } catch (error) {
    if (String(error.message).includes("UNIQUE constraint failed")) throw new Error("A log already exists for this date.");
    throw error;
  }
  return getLog(userId, logId);
}

export function deleteLog(userId, logId) {
  return db.prepare("DELETE FROM daily_logs WHERE id = ? AND user_id = ?").run(logId, userId).changes > 0;
}

export function databasePath() {
  return dbPath;
}
