export type WorkoutIntensity = "Easy" | "Moderate" | "Hard" | "Rest";

export interface DailyLogInput {
  date: string;
  mood: number;
  energy: number;
  productivity: number;
  sleepHours: number;
  waterCups: number;
  workoutMinutes: number;
  workoutIntensity: WorkoutIntensity;
  calories: number;
  protein: number;
  notes: string;
}

export interface DailyLog extends DailyLogInput {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Insights {
  latest?: DailyLog;
  streak: number;
  averages: Record<string, number>;
  correlations: Array<{ key: string; label: string; value: number; recommendation: string }>;
  timeline: Array<Pick<DailyLog, "id" | "date" | "mood" | "energy" | "productivity" | "workoutMinutes"> & { wellness: number }>;
}
