import assert from "node:assert/strict";
import {
  createPasswordRecord,
  createSessionRecord,
  hashToken,
  validateLogin,
  validateRegistration,
  verifyPassword
} from "../lib/auth.js";
import { finiteNumber, validateDailyLog, validDate } from "../src/validation.js";

const password = "strong-test-password";
const record = createPasswordRecord(password);
assert.notEqual(record.passwordHash, password);
assert.equal(verifyPassword(password, record.passwordSalt, record.passwordHash), true);
assert.equal(verifyPassword("wrong-password", record.passwordSalt, record.passwordHash), false);

const session = createSessionRecord("USR-test");
assert.equal(session.token.length, 64);
assert.equal(session.record.tokenHash, hashToken(session.token));
assert.notEqual(session.record.tokenHash, session.token);

assert.deepEqual(validateRegistration({ name: " Test User ", email: "TEST@Example.com", password }), {
  name: "Test User",
  email: "test@example.com",
  password
});
assert.deepEqual(validateLogin({ email: "TEST@Example.com", password }), { email: "test@example.com", password });

for (const badValue of [undefined, null, "", "abc", Number.NaN, Infinity, -Infinity]) {
  assert.throws(() => finiteNumber(badValue, "Mood", { min: 1, max: 10 }), /required|finite number/);
}

assert.throws(() => validDate("2026-02-30"), /valid calendar date/);
assert.throws(() => validateDailyLog({ date: "2026-07-14", mood: 7 }), /required|valid workout intensity/);
assert.throws(
  () => validateDailyLog({
    date: "2026-07-14",
    mood: "NaN",
    energy: 7,
    productivity: 8,
    sleepHours: 7,
    waterCups: 8,
    workoutMinutes: 30,
    workoutIntensity: "Moderate",
    calories: 2200,
    protein: 130,
    notes: "Invalid mood"
  }),
  /finite number/
);

console.log("All VitaForge authentication and validation tests passed.");
