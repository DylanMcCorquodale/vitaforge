import assert from "node:assert/strict";
import { join } from "node:path";
import { tmpdir } from "node:os";

process.env.VITAFORGE_DB_PATH = join(tmpdir(), `vitaforge-${process.pid}-${Date.now()}.sqlite`);

const {
  createLog,
  deleteLog,
  deleteSession,
  getLogs,
  loginUser,
  registerUser,
  updateLog,
  userForToken
} = await import("../server/database.js");

const registered = registerUser({
  name: "Test User",
  email: "test@vitaforge.local",
  password: "strong-test-password"
});

assert.equal(registered.user.name, "Test User");
assert.equal(userForToken(registered.token).email, "test@vitaforge.local");
assert.equal(getLogs(registered.user.id).length, 6);

const created = createLog(registered.user.id, {
  date: "2026-06-23",
  mood: 8,
  energy: 7,
  productivity: 9,
  sleepHours: 7.5,
  waterCups: 8,
  workoutMinutes: 40,
  workoutIntensity: "Moderate",
  calories: 2350,
  protein: 145,
  notes: "Integration test log."
});

assert.equal(created.date, "2026-06-23");
assert.equal(getLogs(registered.user.id).length, 7);

const updated = updateLog(registered.user.id, created.id, { mood: 9, notes: "Updated test log." });
assert.equal(updated.mood, 9);
assert.equal(updated.notes, "Updated test log.");

const login = loginUser({ email: "test@vitaforge.local", password: "strong-test-password" });
assert.equal(login.user.id, registered.user.id);
deleteSession(login.token);
assert.equal(userForToken(login.token), null);

assert.equal(deleteLog(registered.user.id, created.id), true);
assert.equal(getLogs(registered.user.id).length, 6);

console.log("All VitaForge database tests passed.");
