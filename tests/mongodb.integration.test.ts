import { afterAll, beforeAll, describe, expect, it } from "vitest";

const enabled = Boolean(process.env.MONGODB_URI && process.env.MONGODB_TEST_DB);
const integration = enabled ? describe : describe.skip;

integration("MongoDB integration (dedicated MONGODB_TEST_DB)", () => {
  let repository: typeof import("../lib/repository");
  let mongodb: typeof import("../lib/mongodb");
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const credentials = { name: "Integration Test", email: `vitaforge-${unique}@example.com`, password: "integration-test-password" };
  let userId = "";

  beforeAll(async () => { repository = await import("../lib/repository"); mongodb = await import("../lib/mongodb"); });
  afterAll(async () => {
    if (!enabled) return;
    const db = await mongodb.getDatabase();
    const user = await db.collection("users").findOne({ email: credentials.email });
    if (user) await Promise.all([db.collection("dailyLogs").deleteMany({ userId: user.id }), db.collection("sessions").deleteMany({ userId: user.id }), db.collection("users").deleteOne({ id: user.id })]);
    await mongodb.closeDatabaseForTests();
  });

  it("registers with an empty real history", async () => {
    const registered = await repository.register(credentials);
    userId = registered.user.id;
    expect(await repository.listLogs(userId)).toHaveLength(0);
  });

  it("creates, updates, authenticates, and deletes a log", async () => {
    const created = await repository.createLog(userId, { date: "2026-07-14", mood: 8, energy: 7, productivity: 9, sleepHours: 7.5, waterCups: 8, workoutMinutes: 40, workoutIntensity: "Moderate", calories: 2350, protein: 145, notes: "Integration test." });
    expect((await repository.updateLog(userId, created.id!, { ...created, mood: 9 }))?.mood).toBe(9);
    expect((await repository.login(credentials)).user.id).toBe(userId);
    expect(await repository.removeLog(userId, created.id!)).toBe(true);
  });
});
