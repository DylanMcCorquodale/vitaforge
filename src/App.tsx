"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "./api";
import { AuthCard } from "./components/AuthCard";
import { LogForm } from "./components/LogForm";
import type { DailyLog, Insights, PublicUser } from "./types";
import {
  buildInsights,
  createLogFromForm,
  exerciseCatalog,
  foodCatalog,
  sampleLogs,
  searchCatalog
} from "./health";

const emptyLog: DailyLog = {
  date: new Date().toISOString().slice(0, 10),
  mood: 7,
  energy: 7,
  productivity: 8,
  sleepHours: 7.4,
  waterCups: 8,
  workoutMinutes: 35,
  workoutIntensity: "Moderate",
  calories: 2300,
  protein: 140,
  notes: "Solid day. Training helped focus."
};

function scoreColor(score) {
  if (score >= 8) return "#3ac47d";
  if (score >= 6) return "#f0b84a";
  return "#ff6f61";
}

function percent(value, max = 10) {
  return Math.max(0, Math.min(100, (Number(value) / max) * 100));
}

function friendlyDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function App() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>(sampleLogs);
  const [insights, setInsights] = useState<Insights>(buildInsights(sampleLogs));
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState<DailyLog>(emptyLog);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [foodQuery, setFoodQuery] = useState("");
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [foods, setFoods] = useState(foodCatalog.slice(0, 3));
  const [exercises, setExercises] = useState(exerciseCatalog.slice(0, 3));

  async function refreshDashboard() {
    const [logResult, insightResult] = await Promise.all([api<{ logs: DailyLog[] }>("/logs"), api<Insights>("/insights")]);
    setLogs(logResult.logs);
    setInsights(insightResult);
  }

  useEffect(() => {
    Promise.all([api<{ user: PublicUser }>("/me"), api<{ logs: DailyLog[] }>("/logs"), api<Insights>("/insights")])
      .then(([profile, result, serverInsights]) => {
        setUser(profile.user);
        setLogs(result.logs);
        setInsights(serverInsights);
        if (pathname === "/login") router.replace("/dashboard");
      })
      .catch(() => {
        setUser(null);
        setLogs(sampleLogs);
        setInsights(buildInsights(sampleLogs));
        if (pathname === "/dashboard") router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      api(`/foods/search?q=${encodeURIComponent(foodQuery)}`)
        .then((result) => setFoods(result.foods))
        .catch(() => setFoods(searchCatalog(foodCatalog, foodQuery)));
    }, 180);
    return () => clearTimeout(timer);
  }, [foodQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      api(`/exercises/search?q=${encodeURIComponent(exerciseQuery)}`)
        .then((result) => setExercises(result.exercises))
        .catch(() => setExercises(searchCatalog(exerciseCatalog, exerciseQuery)));
    }, 180);
    return () => clearTimeout(timer);
  }, [exerciseQuery]);

  async function authenticated(profile) {
    setUser(profile);
    setLoading(true);
    try {
      await refreshDashboard();
    } finally {
      setLoading(false);
    }
  }

  async function saveLog(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const payload = createLogFromForm(form);
      await api(editingId ? `/logs/${editingId}` : "/logs", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(payload)
      });
      await refreshDashboard();
      setForm({ ...emptyLog, date: new Date().toISOString().slice(0, 10) });
      setEditingId(null);
      setNotice("Daily log saved.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSaving(false);
    }
  }

  function editLog(log?: DailyLog) {
    if (!log?.id) return;
    setEditingId(log.id);
    setForm({ ...log });
    document.getElementById("log")?.scrollIntoView({ behavior: "smooth" });
  }

  async function deleteLog(id) {
    if (!window.confirm("Delete this daily log?")) return;
    try {
      await api(`/logs/${id}`, { method: "DELETE" });
      await refreshDashboard();
      setNotice("Daily log deleted.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function logout() {
    try { await api("/auth/logout", { method: "POST" }); } catch {}
    setUser(null);
    setLogs(sampleLogs);
    setInsights(buildInsights(sampleLogs));
  }

  if (loading) return <div className="loading-screen">Loading VitaForge...</div>;

  const latest = insights.latest;
  const metrics = [
    ["Mood", insights.averages.mood, "/10"],
    ["Energy", insights.averages.energy, "/10"],
    ["Productivity", insights.averages.productivity, "/10"],
    ["Sleep", insights.averages.sleep, "hrs"],
    ["Protein", insights.averages.protein, "g"],
    ["Streak", insights.streak, "days"]
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand"><div className="mark">VF</div><div><h1>VitaForge</h1><p>Real-life gains dashboard</p></div></div>
          <nav>
            <Link href="/dashboard">Dashboard</Link><Link href="/dashboard#log">Daily Log</Link><Link href="/dashboard#insights">Insights</Link><Link href="/dashboard#api">API Search</Link>
          </nav>
        </div>
        {user ? <button className="ghost-button" type="button" onClick={logout}>Sign Out</button> : <span className="sidebar-note">Preview mode</span>}
      </aside>

      <main>
        <section id="dashboard" className="hero">
          <div>
            <p className="eyebrow">Springboard full-stack capstone</p>
            <h2>Turn daily habits into clearer decisions about your energy and performance.</h2>
            <p>Track movement, nutrition, sleep, hydration, mood, and productivity in one private wellness journal.</p>
            {user && <p className="welcome">Welcome back, {user.name}.</p>}
          </div>
          {user && latest ? (
            <article className="panel">
              <div className="card-top"><h3>{friendlyDate(latest.date)}</h3><span className="pill">{insights.averages.wellness}/10 avg wellness</span></div>
              <p>{latest.notes}</p>
              <div className="tag-row"><span>{latest.workoutIntensity} training</span><span>{latest.sleepHours}h sleep</span><span>{latest.protein}g protein</span><span>{latest.waterCups} cups water</span></div>
            </article>
          ) : user ? <article className="panel"><h3>Your journal is ready</h3><p>Add your first real daily log below. Sample entries stay only in preview mode.</p></article> : <AuthCard onAuthenticated={authenticated} />}
        </section>

        {!user && <p className="preview-banner">The dashboard below uses sample data. Create an account to save private logs through the VitaForge API.</p>}
        {notice && <p className="notice" role="status">{notice}</p>}

        <section className="metrics" aria-label="Average health metrics">
          {metrics.map(([label, value, suffix]) => <article className="metric" key={label}><span>{label}</span><strong>{value}{suffix}</strong></article>)}
        </section>

        <section className="grid">
          <article className="panel large">
            <div className="section-head"><div><p className="eyebrow">Recent pattern</p><h3>Mood, energy, productivity, and wellness</h3></div><div className="legend"><span><i className="mood" />Mood</span><span><i className="energy" />Energy</span><span><i className="productivity" />Productivity</span></div></div>
            <div className="timeline">
              {insights.timeline.map((day) => (
                <article className="day-row" key={day.date}>
                  <div><strong>{friendlyDate(day.date)}</strong><span>{day.workoutMinutes} min movement</span></div>
                  <div className="stacked-bars"><span style={{ width: `${percent(day.mood)}%`, background: scoreColor(day.mood) }} /><span style={{ width: `${percent(day.energy)}%`, background: "#5fb3ff" }} /><span style={{ width: `${percent(day.productivity)}%`, background: "#c59cff" }} /></div>
                  <b>{day.wellness}/10</b>
                  {user && day.id && <div className="row-actions"><button type="button" onClick={() => editLog(logs.find((log) => log.id === day.id))}>Edit</button><button type="button" onClick={() => deleteLog(day.id)}>Delete</button></div>}
                </article>
              ))}
            </div>
          </article>
          {user ? (
            <LogForm value={form} editingId={editingId} onChange={setForm} onSave={saveLog} onCancel={() => { setEditingId(null); setForm(emptyLog); }} busy={saving} />
          ) : (
            <article className="panel preview-card">
              <p className="eyebrow">What your account unlocks</p>
              <h3>Your private history, editable from any session</h3>
              <p>Register above to save daily entries, update past days, delete records, and receive insights calculated only from your own data.</p>
              <div className="tag-row"><span>Protected logs</span><span>Full CRUD</span><span>Personal insights</span></div>
            </article>
          )}
        </section>

        <section id="insights" className="panel">
          <div className="section-head"><div><p className="eyebrow">Correlation engine</p><h3>What seems to move the needle?</h3></div></div>
          <div className="correlations">
            {insights.correlations.map((item) => <article className="correlation" key={item.key}><div className="card-top"><h3>{item.label}</h3><span className="pill">{item.value >= 0 ? "Positive" : "Negative"} {item.value}</span></div><div className="track"><span style={{ width: `${Math.round(Math.abs(item.value) * 100)}%` }} /></div><p>{item.recommendation}</p></article>)}
          </div>
        </section>

        <section id="api" className="api-grid">
          <article className="panel"><div className="section-head"><div><p className="eyebrow">Nutrition API adapter</p><h3>Food lookup</h3></div></div><input value={foodQuery} onChange={(e) => setFoodQuery(e.target.value)} placeholder="Search foods, e.g. chicken" /><div className="catalog">{foods.map((food) => <button className="catalog-item" key={food.name} type="button" onClick={() => setForm({ ...form, calories: food.calories, protein: food.protein })}><strong>{food.name}</strong><span>{food.calories} cal · {food.protein}g protein</span></button>)}</div></article>
          <article className="panel"><div className="section-head"><div><p className="eyebrow">Exercise API adapter</p><h3>Movement lookup</h3></div></div><input value={exerciseQuery} onChange={(e) => setExerciseQuery(e.target.value)} placeholder="Search exercises, e.g. run" /><div className="catalog">{exercises.map((exercise) => <button className="catalog-item" key={exercise.name} type="button" onClick={() => setForm({ ...form, workoutMinutes: exercise.minutes, workoutIntensity: exercise.intensity })}><strong>{exercise.name}</strong><span>{exercise.type} · {exercise.minutes} min · {exercise.intensity}</span></button>)}</div></article>
        </section>
      </main>
    </div>
  );
}

export default App;
