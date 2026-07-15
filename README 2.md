# VitaForge

VitaForge is a Springboard capstone MVP for a holistic lifestyle dashboard. It helps users track how workouts, nutrition, sleep, hydration, mood, energy, and productivity move together over time.

The original proposal described a full-stack MERV/MVC application with authentication, daily logs, external nutrition/exercise APIs, and long-term progress charts. This MVP builds the core user experience and insight engine first so the product is demoable before backend integration.

## MVP Features

- Daily log form for mood, energy, productivity, sleep, water, workout minutes, calories, protein, and notes.
- Local persistence with `localStorage`, so logs survive refreshes during the demo.
- Dashboard metrics for averages and current streak.
- Timeline visualization for mood, energy, productivity, workout minutes, and wellness score.
- Correlation engine for:
  - workout minutes to mood
  - sleep to energy
  - protein to productivity
- Recommendation cards based on correlation direction and strength.
- Mock nutrition and exercise search adapters that mirror the planned Edamam / ExerciseDB integration.
- Tests for the core health calculations and data normalization.

## Technical Structure

- `src/health.js`: domain logic, sample data, mock API catalogs, scoring, correlations, streaks, and insight generation.
- `src/app.js`: UI rendering, local storage, form handling, and catalog selection.
- `src/styles.css`: responsive dashboard styling.
- `tests/health.test.js`: tests for averages, correlations, wellness scoring, streaks, form normalization, and search.

## Capstone Roadmap

The next production step is to move the same data model into a real MVC backend:

- `User`: username, password hash, goals, baseline metrics.
- `Log`: user id, date, mood, energy, productivity, sleep, hydration, notes.
- `Workout`: user id, log id, type, duration, intensity, calories.
- `Meal`: user id, log id, food name, calories, macros, timestamp.

Backend route plan:

- `POST /auth/register`
- `POST /auth/login`
- `GET /logs`
- `POST /logs`
- `PATCH /logs/:id`
- `DELETE /logs/:id`
- `GET /foods/search`
- `GET /exercises/search`
- `GET /insights`

External API plan:

- Edamam or USDA FoodData Central for nutrition lookup.
- ExerciseDB or API Ninjas Exercises for movement search.
- Server-side adapter layer to normalize external API responses before the frontend sees them.
- Simple caching for common food and exercise searches to reduce rate-limit pressure.

## Running Locally

```bash
npm test
npm start
```

Then open:

```text
http://localhost:5176
```

## Strong Interview / Capstone Explanation

"VitaForge started as a wellness dashboard capstone idea. I scoped the MVP around the most important product question: can a user see how daily habits affect mood, energy, and productivity? I separated the insight logic into testable functions, built a responsive dashboard, added local persistence for a working demo, and mocked the external nutrition/exercise adapters so the app is ready to evolve into a Node/Express/Mongo MVC backend."
