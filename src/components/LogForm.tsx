"use client";

import type { FormEvent } from "react";
import type { DailyLog } from "../types";

interface Props {
  value: DailyLog;
  editingId: string | null;
  onChange: (log: DailyLog) => void;
  onSave: (event: FormEvent) => void;
  onCancel: () => void;
  busy: boolean;
}

export function LogForm({ value, editingId, onChange, onSave, onCancel, busy }: Props) {
  const field = (name: keyof DailyLog, nextValue: unknown) => onChange({ ...value, [name]: nextValue });
  return (
    <form id="log" className="panel form-panel" onSubmit={onSave}>
      <div className="section-head"><div><p className="eyebrow">Daily Log</p><h3>{editingId ? "Update this day" : "Record today"}</h3></div>{editingId && <button className="text-button" type="button" onClick={onCancel}>Cancel edit</button>}</div>
      <label>Date<input type="date" value={value.date} onChange={(e) => field("date", e.target.value)} required /></label>
      <div className="three">
        <label>Mood<input type="number" min="1" max="10" value={value.mood} onChange={(e) => field("mood", e.target.value)} required /></label>
        <label>Energy<input type="number" min="1" max="10" value={value.energy} onChange={(e) => field("energy", e.target.value)} required /></label>
        <label>Productivity<input type="number" min="1" max="10" value={value.productivity} onChange={(e) => field("productivity", e.target.value)} required /></label>
      </div>
      <div className="two"><label>Sleep hours<input type="number" min="0" max="24" step="0.1" value={value.sleepHours} onChange={(e) => field("sleepHours", e.target.value)} required /></label><label>Water cups<input type="number" min="0" value={value.waterCups} onChange={(e) => field("waterCups", e.target.value)} required /></label></div>
      <div className="two"><label>Workout minutes<input type="number" min="0" value={value.workoutMinutes} onChange={(e) => field("workoutMinutes", e.target.value)} required /></label><label>Intensity<select value={value.workoutIntensity} onChange={(e) => field("workoutIntensity", e.target.value)}>{["Easy", "Moderate", "Hard", "Rest"].map((option) => <option key={option}>{option}</option>)}</select></label></div>
      <div className="two"><label>Calories<input type="number" min="0" value={value.calories} onChange={(e) => field("calories", e.target.value)} required /></label><label>Protein grams<input type="number" min="0" value={value.protein} onChange={(e) => field("protein", e.target.value)} required /></label></div>
      <label>Notes<textarea value={value.notes} onChange={(e) => field("notes", e.target.value)} /></label>
      <button className="primary-button" disabled={busy} type="submit">{busy ? "Saving..." : editingId ? "Update Daily Log" : "Save Daily Log"}</button>
    </form>
  );
}
