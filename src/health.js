export const sampleLogs = [
  {
    date: "2026-06-17",
    mood: 6,
    energy: 5,
    productivity: 6,
    sleepHours: 6.2,
    waterCups: 5,
    workoutMinutes: 20,
    workoutIntensity: "Moderate",
    calories: 2180,
    protein: 118,
    notes: "Short lift before work. Energy dipped late afternoon."
  },
  {
    date: "2026-06-18",
    mood: 8,
    energy: 8,
    productivity: 9,
    sleepHours: 7.6,
    waterCups: 8,
    workoutMinutes: 45,
    workoutIntensity: "Hard",
    calories: 2460,
    protein: 152,
    notes: "Best day this week. Workout and meals were planned."
  },
  {
    date: "2026-06-19",
    mood: 5,
    energy: 4,
    productivity: 5,
    sleepHours: 5.8,
    waterCups: 4,
    workoutMinutes: 0,
    workoutIntensity: "Rest",
    calories: 1960,
    protein: 86,
    notes: "Skipped training and worked late."
  },
  {
    date: "2026-06-20",
    mood: 7,
    energy: 7,
    productivity: 8,
    sleepHours: 7.1,
    waterCups: 7,
    workoutMinutes: 35,
    workoutIntensity: "Moderate",
    calories: 2310,
    protein: 136,
    notes: "Walk plus upper body. Focus felt stable."
  },
  {
    date: "2026-06-21",
    mood: 7,
    energy: 6,
    productivity: 7,
    sleepHours: 6.9,
    waterCups: 6,
    workoutMinutes: 30,
    workoutIntensity: "Easy",
    calories: 2250,
    protein: 128,
    notes: "Light cardio and meal prep."
  },
  {
    date: "2026-06-22",
    mood: 9,
    energy: 8,
    productivity: 9,
    sleepHours: 8.1,
    waterCups: 9,
    workoutMinutes: 50,
    workoutIntensity: "Hard",
    calories: 2540,
    protein: 164,
    notes: "Strongest day. Slept well and trained early."
  }
];

export const foodCatalog = [
  { name: "Chicken breast bowl", calories: 620, protein: 58, carbs: 54, fat: 16 },
  { name: "Greek yogurt parfait", calories: 340, protein: 32, carbs: 38, fat: 8 },
  { name: "Salmon rice plate", calories: 710, protein: 46, carbs: 62, fat: 28 },
  { name: "Protein smoothie", calories: 420, protein: 40, carbs: 44, fat: 10 },
  { name: "Steak and potatoes", calories: 780, protein: 55, carbs: 50, fat: 34 }
];

export const exerciseCatalog = [
  { name: "Push day strength", type: "Strength", minutes: 45, intensity: "Hard" },
  { name: "Zone 2 run", type: "Cardio", minutes: 35, intensity: "Moderate" },
  { name: "Mobility reset", type: "Recovery", minutes: 20, intensity: "Easy" },
  { name: "Full body lift", type: "Strength", minutes: 50, intensity: "Hard" },
  { name: "Brisk walk", type: "Cardio", minutes: 30, intensity: "Easy" }
];

export function clampScore(value) {
  return Math.max(1, Math.min(10, Number(value)));
}

export function average(values) {
  if (!values.length) return 0;
  return round(values.reduce((sum, value) => sum + Number(value), 0) / values.length, 1);
}

export function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function pearsonCorrelation(xValues, yValues) {
  if (xValues.length !== yValues.length || xValues.length < 2) return 0;
  const xAvg = average(xValues);
  const yAvg = average(yValues);
  const numerator = xValues.reduce((sum, x, index) => sum + (x - xAvg) * (yValues[index] - yAvg), 0);
  const xSpread = Math.sqrt(xValues.reduce((sum, x) => sum + (x - xAvg) ** 2, 0));
  const ySpread = Math.sqrt(yValues.reduce((sum, y) => sum + (y - yAvg) ** 2, 0));
  if (!xSpread || !ySpread) return 0;
  return round(numerator / (xSpread * ySpread), 2);
}

export function currentStreak(logs) {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let expected = sorted[0]?.date ? new Date(`${sorted[0].date}T12:00:00`) : null;

  for (const log of sorted) {
    const actual = new Date(`${log.date}T12:00:00`);
    if (expected && actual.toDateString() === expected.toDateString()) {
      streak += 1;
      expected.setDate(expected.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateWellnessScore(log) {
  const mood = clampScore(log.mood);
  const energy = clampScore(log.energy);
  const productivity = clampScore(log.productivity);
  const sleepScore = Math.min(10, Math.max(1, (Number(log.sleepHours) / 8) * 10));
  const movementScore = Math.min(10, Math.max(1, (Number(log.workoutMinutes) / 45) * 10));
  const proteinScore = Math.min(10, Math.max(1, (Number(log.protein) / 150) * 10));

  return Math.round(
    mood * 0.22 +
      energy * 0.2 +
      productivity * 0.2 +
      sleepScore * 0.16 +
      movementScore * 0.12 +
      proteinScore * 0.1
  );
}

export function buildInsights(logs) {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const wellnessScores = sorted.map(calculateWellnessScore);
  const workoutMood = pearsonCorrelation(
    sorted.map((log) => Number(log.workoutMinutes)),
    sorted.map((log) => Number(log.mood))
  );
  const sleepEnergy = pearsonCorrelation(
    sorted.map((log) => Number(log.sleepHours)),
    sorted.map((log) => Number(log.energy))
  );
  const proteinProductivity = pearsonCorrelation(
    sorted.map((log) => Number(log.protein)),
    sorted.map((log) => Number(log.productivity))
  );

  return {
    latest,
    streak: currentStreak(sorted),
    averages: {
      mood: average(sorted.map((log) => log.mood)),
      energy: average(sorted.map((log) => log.energy)),
      productivity: average(sorted.map((log) => log.productivity)),
      sleep: average(sorted.map((log) => log.sleepHours)),
      workoutMinutes: average(sorted.map((log) => log.workoutMinutes)),
      protein: average(sorted.map((log) => log.protein)),
      wellness: average(wellnessScores)
    },
    correlations: [
      {
        key: "workoutMood",
        label: "Workout minutes to mood",
        value: workoutMood,
        recommendation:
          workoutMood >= 0.45
            ? "Movement is strongly linked with better mood in this sample. Protect short workouts on busy days."
            : "Movement is not clearly lifting mood yet. Try consistent easy sessions before increasing intensity."
      },
      {
        key: "sleepEnergy",
        label: "Sleep to energy",
        value: sleepEnergy,
        recommendation:
          sleepEnergy >= 0.45
            ? "Sleep is a high-leverage energy driver. Keep bedtime consistent before adding more habits."
            : "Energy may be affected by hydration, meal timing, or stress more than sleep in this sample."
      },
      {
        key: "proteinProductivity",
        label: "Protein to productivity",
        value: proteinProductivity,
        recommendation:
          proteinProductivity >= 0.45
            ? "Higher-protein days are tracking with better output. Pre-plan one anchor meal."
            : "Protein is not showing a strong productivity relationship yet. Keep tracking for more signal."
      }
    ],
    timeline: sorted.map((log) => ({
      date: log.date,
      wellness: calculateWellnessScore(log),
      mood: Number(log.mood),
      energy: Number(log.energy),
      productivity: Number(log.productivity),
      workoutMinutes: Number(log.workoutMinutes)
    }))
  };
}

export function createLogFromForm(formValues) {
  return {
    date: formValues.date,
    mood: clampScore(formValues.mood),
    energy: clampScore(formValues.energy),
    productivity: clampScore(formValues.productivity),
    sleepHours: Math.max(0, Number(formValues.sleepHours)),
    waterCups: Math.max(0, Number(formValues.waterCups)),
    workoutMinutes: Math.max(0, Number(formValues.workoutMinutes)),
    workoutIntensity: formValues.workoutIntensity,
    calories: Math.max(0, Number(formValues.calories)),
    protein: Math.max(0, Number(formValues.protein)),
    notes: formValues.notes?.trim() || "No notes yet."
  };
}

export function searchCatalog(items, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items.slice(0, 3);
  return items.filter((item) => item.name.toLowerCase().includes(normalized)).slice(0, 5);
}
