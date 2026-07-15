import { randomBytes } from "node:crypto";
import { getDatabase } from "./mongodb.js";
import {
  bearerToken,
  createPasswordRecord,
  createSessionRecord,
  hashToken,
  publicUser,
  validateLogin,
  validateRegistration,
  verifyPassword
} from "./auth.js";
import { sampleLogs } from "../src/health.js";
import { validateDailyLog } from "../src/validation.js";

const makeId = (prefix) => `${prefix}-${randomBytes(10).toString("hex")}`;

function serializeLog(log) {
  return {
    id: log.id,
    date: log.date,
    mood: log.mood,
    energy: log.energy,
    productivity: log.productivity,
    sleepHours: log.sleepHours,
    waterCups: log.waterCups,
    workoutMinutes: log.workoutMinutes,
    workoutIntensity: log.workoutIntensity,
    calories: log.calories,
    protein: log.protein,
    notes: log.notes,
    createdAt: log.createdAt instanceof Date ? log.createdAt.toISOString() : log.createdAt,
    updatedAt: log.updatedAt instanceof Date ? log.updatedAt.toISOString() : log.updatedAt
  };
}

function duplicate(error) {
  return error?.code === 11000;
}

export async function register(input) {
  const credentials = validateRegistration(input);
  const db = await getDatabase();
  const user = {
    id: makeId("USR"),
    name: credentials.name,
    email: credentials.email,
    ...createPasswordRecord(credentials.password),
    createdAt: new Date()
  };

  try {
    await db.collection("users").insertOne(user);
  } catch (error) {
    if (duplicate(error)) throw new Error("An account already exists for this email.");
    throw error;
  }

  try {
    const timestamp = new Date();
    await db.collection("dailyLogs").insertMany(sampleLogs.map((inputLog) => ({
      ...validateDailyLog(inputLog),
      id: makeId("LOG"),
      userId: user.id,
      createdAt: timestamp,
      updatedAt: timestamp
    })));
    const session = createSessionRecord(user.id);
    await db.collection("sessions").insertOne(session.record);
    return { user: publicUser(user), token: session.token };
  } catch (error) {
    await Promise.all([
      db.collection("dailyLogs").deleteMany({ userId: user.id }),
      db.collection("sessions").deleteMany({ userId: user.id }),
      db.collection("users").deleteOne({ id: user.id })
    ]);
    throw error;
  }
}

export async function login(input) {
  const credentials = validateLogin(input);
  const db = await getDatabase();
  const user = await db.collection("users").findOne({ email: credentials.email });
  if (!user || !verifyPassword(credentials.password, user.passwordSalt, user.passwordHash)) {
    throw new Error("Email or password is incorrect.");
  }
  const session = createSessionRecord(user.id);
  await db.collection("sessions").insertOne(session.record);
  return { user: publicUser(user), token: session.token };
}

export async function logout(request) {
  const token = bearerToken(request);
  if (!token) return;
  const db = await getDatabase();
  await db.collection("sessions").deleteOne({ tokenHash: hashToken(token) });
}

export async function userForRequest(request) {
  const token = bearerToken(request);
  if (!token) return null;
  const db = await getDatabase();
  const session = await db.collection("sessions").findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await db.collection("users").findOne({ id: session.userId });
  return user ? publicUser(user) : null;
}

export async function listLogs(userId) {
  const db = await getDatabase();
  const logs = await db.collection("dailyLogs").find({ userId }).sort({ date: 1 }).toArray();
  return logs.map(serializeLog);
}

export async function createLog(userId, input) {
  const db = await getDatabase();
  const timestamp = new Date();
  const log = { ...validateDailyLog(input), id: makeId("LOG"), userId, createdAt: timestamp, updatedAt: timestamp };
  try {
    await db.collection("dailyLogs").insertOne(log);
  } catch (error) {
    if (duplicate(error)) throw new Error("A log already exists for this date. Edit the existing entry instead.");
    throw error;
  }
  return serializeLog(log);
}

export async function updateLog(userId, logId, input) {
  const db = await getDatabase();
  const current = await db.collection("dailyLogs").findOne({ id: logId, userId });
  if (!current) return null;
  const validated = validateDailyLog({ ...current, ...input });
  try {
    const updated = await db.collection("dailyLogs").findOneAndUpdate(
      { id: logId, userId },
      { $set: { ...validated, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return updated ? serializeLog(updated) : null;
  } catch (error) {
    if (duplicate(error)) throw new Error("A log already exists for this date.");
    throw error;
  }
}

export async function removeLog(userId, logId) {
  const db = await getDatabase();
  return (await db.collection("dailyLogs").deleteOne({ id: logId, userId })).deletedCount === 1;
}
