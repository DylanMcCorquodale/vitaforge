export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export function finiteNumber(value, field, { min = -Infinity, max = Infinity, integer = false } = {}) {
  if (value === "" || value === null || value === undefined) {
    throw new ValidationError(`${field} is required.`);
  }
  const number = Number(value);
  if (!Number.isFinite(number)) throw new ValidationError(`${field} must be a finite number.`);
  if (integer && !Number.isInteger(number)) throw new ValidationError(`${field} must be a whole number.`);
  if (number < min || number > max) throw new ValidationError(`${field} must be between ${min} and ${max}.`);
  return number;
}

export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) throw new ValidationError("Date must use YYYY-MM-DD.");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new ValidationError("Enter a valid calendar date.");
  return value;
}

export function validateDailyLog(input) {
  const intensities = new Set(["Easy", "Moderate", "Hard", "Rest"]);
  if (!intensities.has(input.workoutIntensity)) throw new ValidationError("Choose a valid workout intensity.");
  const notes = String(input.notes || "").trim() || "No notes yet.";
  if (notes.length > 2000) throw new ValidationError("Notes must be 2,000 characters or fewer.");

  return {
    date: validDate(input.date),
    mood: finiteNumber(input.mood, "Mood", { min: 1, max: 10, integer: true }),
    energy: finiteNumber(input.energy, "Energy", { min: 1, max: 10, integer: true }),
    productivity: finiteNumber(input.productivity, "Productivity", { min: 1, max: 10, integer: true }),
    sleepHours: finiteNumber(input.sleepHours, "Sleep hours", { min: 0, max: 24 }),
    waterCups: finiteNumber(input.waterCups, "Water cups", { min: 0, max: 100, integer: true }),
    workoutMinutes: finiteNumber(input.workoutMinutes, "Workout minutes", { min: 0, max: 1440, integer: true }),
    workoutIntensity: input.workoutIntensity,
    calories: finiteNumber(input.calories, "Calories", { min: 0, max: 30000, integer: true }),
    protein: finiteNumber(input.protein, "Protein", { min: 0, max: 2000, integer: true }),
    notes
  };
}
