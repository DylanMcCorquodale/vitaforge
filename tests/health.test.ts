import { describe, expect, it } from "vitest";
import { average, buildInsights, calculateWellnessScore, createLogFromForm, currentStreak, pearsonCorrelation, sampleLogs, searchCatalog, foodCatalog } from "../src/health";

describe("wellness analytics", () => {
  it("calculates averages and correlations", () => {
    expect(average([2, 4, 6])).toBe(4);
    expect(average([])).toBe(0);
    expect(pearsonCorrelation([1, 2, 3], [2, 4, 6])).toBe(1);
    expect(pearsonCorrelation([1, 2, 3], [6, 4, 2])).toBe(-1);
  });

  it("builds a timeline and streak", () => {
    expect(currentStreak(sampleLogs)).toBe(6);
    const insights = buildInsights(sampleLogs);
    expect(insights.timeline).toHaveLength(sampleLogs.length);
    expect(insights.correlations).toHaveLength(3);
  });

  it("scores a strong day above a weak day", () => {
    const strong = { ...sampleLogs[0], mood: 10, energy: 10, productivity: 10, sleepHours: 8, workoutMinutes: 45, protein: 150 };
    const weak = { ...sampleLogs[0], mood: 2, energy: 2, productivity: 2, sleepHours: 4, workoutMinutes: 0, protein: 30 };
    expect(calculateWellnessScore(strong)).toBeGreaterThan(calculateWellnessScore(weak));
  });

  it("validates forms and searches catalogs", () => {
    const form = createLogFromForm({ ...sampleLogs[0], notes: "  Good focus. " });
    expect(form.notes).toBe("Good focus.");
    expect(searchCatalog(foodCatalog, "chicken")[0].name).toBe("Chicken breast bowl");
    expect(() => createLogFromForm({ ...form, mood: "not-a-number" })).toThrow(/finite number/);
  });
});
