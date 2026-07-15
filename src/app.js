import {
  buildInsights,
  createLogFromForm,
  exerciseCatalog,
  foodCatalog,
  sampleLogs,
  searchCatalog
} from "./health.js";

const storageKey = "vitaforge.logs.v1";
const state = {
  logs: loadLogs(),
  foodQuery: "",
  exerciseQuery: ""
};

const $ = (selector) => document.querySelector(selector);

function loadLogs() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : sampleLogs;
  } catch {
    return sampleLogs;
  }
}

function saveLogs() {
  localStorage.setItem(storageKey, JSON.stringify(state.logs));
}

function scoreColor(score) {
  if (score >= 8) return "#3ac47d";
  if (score >= 6) return "#f0b84a";
  return "#ff6f61";
}

function percent(value, max = 10) {
  return Math.max(0, Math.min(100, (Number(value) / max) * 100));
}

function renderMetrics(insights) {
  const metrics = [
    ["Mood", insights.averages.mood, "/10"],
    ["Energy", insights.averages.energy, "/10"],
    ["Productivity", insights.averages.productivity, "/10"],
    ["Sleep", insights.averages.sleep, "hrs"],
    ["Protein", insights.averages.protein, "g"],
    ["Streak", insights.streak, "days"]
  ];

  $("#metrics").innerHTML = metrics
    .map(
      ([label, value, suffix]) => `
        <article class="metric">
          <span>${label}</span>
          <strong>${value}${suffix}</strong>
        </article>
      `
    )
    .join("");
}

function renderTimeline(insights) {
  $("#timeline").innerHTML = insights.timeline
    .map(
      (day) => `
        <article class="day-row">
          <div>
            <strong>${new Date(`${day.date}T12:00:00`).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</strong>
            <span>${day.workoutMinutes} min movement</span>
          </div>
          <div class="stacked-bars">
            <span style="width:${percent(day.mood)}%; background:${scoreColor(day.mood)}"></span>
            <span style="width:${percent(day.energy)}%; background:#5fb3ff"></span>
            <span style="width:${percent(day.productivity)}%; background:#c59cff"></span>
          </div>
          <b>${day.wellness}/10</b>
        </article>
      `
    )
    .join("");
}

function renderCorrelations(insights) {
  $("#correlations").innerHTML = insights.correlations
    .map((item) => {
      const width = Math.round(Math.abs(item.value) * 100);
      const direction = item.value >= 0 ? "Positive" : "Negative";
      return `
        <article class="correlation">
          <div class="card-top">
            <h3>${item.label}</h3>
            <span class="pill">${direction} ${item.value}</span>
          </div>
          <div class="track"><span style="width:${width}%;"></span></div>
          <p>${item.recommendation}</p>
        </article>
      `;
    })
    .join("");
}

function renderLatest(insights) {
  const latest = insights.latest;
  $("#latestLog").innerHTML = `
    <div class="card-top">
      <h3>${new Date(`${latest.date}T12:00:00`).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</h3>
      <span class="pill">${insights.averages.wellness}/10 avg wellness</span>
    </div>
    <p>${latest.notes}</p>
    <div class="tag-row">
      <span>${latest.workoutIntensity} training</span>
      <span>${latest.sleepHours}h sleep</span>
      <span>${latest.protein}g protein</span>
      <span>${latest.waterCups} cups water</span>
    </div>
  `;
}

function renderCatalog() {
  const foods = searchCatalog(foodCatalog, state.foodQuery);
  const exercises = searchCatalog(exerciseCatalog, state.exerciseQuery);

  $("#foodResults").innerHTML = foods
    .map(
      (food) => `
        <button class="catalog-item" data-food="${food.name}" type="button">
          <strong>${food.name}</strong>
          <span>${food.calories} cal · ${food.protein}g protein</span>
        </button>
      `
    )
    .join("");

  $("#exerciseResults").innerHTML = exercises
    .map(
      (exercise) => `
        <button class="catalog-item" data-exercise="${exercise.name}" type="button">
          <strong>${exercise.name}</strong>
          <span>${exercise.type} · ${exercise.minutes} min · ${exercise.intensity}</span>
        </button>
      `
    )
    .join("");

  document.querySelectorAll("[data-food]").forEach((button) => {
    button.addEventListener("click", () => {
      const food = foodCatalog.find((item) => item.name === button.dataset.food);
      $("#calories").value = food.calories;
      $("#protein").value = food.protein;
    });
  });

  document.querySelectorAll("[data-exercise]").forEach((button) => {
    button.addEventListener("click", () => {
      const exercise = exerciseCatalog.find((item) => item.name === button.dataset.exercise);
      $("#workoutMinutes").value = exercise.minutes;
      $("#workoutIntensity").value = exercise.intensity;
    });
  });
}

function render() {
  const insights = buildInsights(state.logs);
  renderMetrics(insights);
  renderTimeline(insights);
  renderCorrelations(insights);
  renderLatest(insights);
  renderCatalog();
}

function getFormValues() {
  return {
    date: $("#date").value,
    mood: $("#mood").value,
    energy: $("#energy").value,
    productivity: $("#productivity").value,
    sleepHours: $("#sleepHours").value,
    waterCups: $("#waterCups").value,
    workoutMinutes: $("#workoutMinutes").value,
    workoutIntensity: $("#workoutIntensity").value,
    calories: $("#calories").value,
    protein: $("#protein").value,
    notes: $("#notes").value
  };
}

$("#logForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const nextLog = createLogFromForm(getFormValues());
  state.logs = state.logs.filter((log) => log.date !== nextLog.date).concat(nextLog);
  saveLogs();
  render();
});

$("#foodSearch").addEventListener("input", (event) => {
  state.foodQuery = event.target.value;
  renderCatalog();
});

$("#exerciseSearch").addEventListener("input", (event) => {
  state.exerciseQuery = event.target.value;
  renderCatalog();
});

$("#resetData").addEventListener("click", () => {
  state.logs = sampleLogs;
  saveLogs();
  render();
});

$("#date").value = "2026-06-23";
render();
