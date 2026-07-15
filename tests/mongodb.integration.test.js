import assert from "node:assert/strict";

if (!process.env.MONGODB_URI) {
  console.log("MongoDB integration test skipped (set MONGODB_URI to run it).");
} else {
  const { getDatabase, closeDatabaseForTests } = await import("../lib/mongodb.js");
  const { createLog, listLogs, login, register, removeLog, updateLog } = await import("../lib/repository.js");
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const credentials = { name: "Integration Test", email: `vitaforge-${unique}@example.com`, password: "integration-test-password" };

  try {
    const registered = await register(credentials);
    assert.equal(registered.user.email, credentials.email);
    assert.equal((await listLogs(registered.user.id)).length, 6);

    const created = await createLog(registered.user.id, {
      date: "2026-07-14",
      mood: 8,
      energy: 7,
      productivity: 9,
      sleepHours: 7.5,
      waterCups: 8,
      workoutMinutes: 40,
      workoutIntensity: "Moderate",
      calories: 2350,
      protein: 145,
      notes: "MongoDB integration test."
    });
    assert.equal(created.mood, 8);
    assert.equal((await updateLog(registered.user.id, created.id, { ...created, mood: 9 })).mood, 9);
    assert.equal((await login(credentials)).user.id, registered.user.id);
    assert.equal(await removeLog(registered.user.id, created.id), true);
  } finally {
    const db = await getDatabase();
    const user = await db.collection("users").findOne({ email: credentials.email });
    if (user) {
      await Promise.all([
        db.collection("dailyLogs").deleteMany({ userId: user.id }),
        db.collection("sessions").deleteMany({ userId: user.id }),
        db.collection("users").deleteOne({ id: user.id })
      ]);
    }
    await closeDatabaseForTests();
  }

  console.log("All VitaForge MongoDB integration tests passed.");
}
