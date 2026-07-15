import assert from "node:assert/strict";
import {
  average,
  buildInsights,
  calculateWellnessScore,
  createLogFromForm,
  currentStreak,
  pearsonCorrelation,
  sampleLogs,
  searchCatalog,
  foodCatalog
} from "../src/health.js";

assert.equal(average([2, 4, 6]), 4);
assert.equal(average([]), 0);

assert.equal(pearsonCorrelation([1, 2, 3], [2, 4, 6]), 1);
assert.equal(pearsonCorrelation([1, 2, 3], [6, 4, 2]), -1);
assert.equal(pearsonCorrelation([1], [1]), 0);

assert.equal(currentStreak(sampleLogs), 6);

const greatDay = {
  mood: 10,
  energy: 10,
  productivity: 10,
  sleepHours: 8,
  workoutMinutes: 45,
  protein: 150
};

const lowDay = {
  mood: 2,
  energy: 2,
  productivity: 2,
  sleepHours: 4,
  workoutMinutes: 0,
  protein: 30
};

assert.ok(calculateWellnessScore(greatDay) > calculateWellnessScore(lowDay));

const insights = buildInsights(sampleLogs);
assert.equal(insights.timeline.length, sampleLogs.length);
assert.ok(insights.averages.mood > 0);
assert.equal(insights.correlations.length, 3);

const formLog = createLogFromForm({
  date: "2026-06-23",
  mood: 11,
  energy: 7,
  productivity: 8,
  sleepHours: 7.5,
  waterCups: 8,
  workoutMinutes: 30,
  workoutIntensity: "Moderate",
  calories: 2300,
  protein: 140,
  notes: "  Good focus. "
});

assert.equal(formLog.mood, 10);
assert.equal(formLog.notes, "Good focus.");
assert.equal(searchCatalog(foodCatalog, "chicken")[0].name, "Chicken breast bowl");

console.log("All VitaForge health tests passed.");
