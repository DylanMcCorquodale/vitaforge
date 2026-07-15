# Capstone Step 1 - Initial Project Ideas

## Preferred idea: VitaForge

VitaForge is a private wellness journal that helps people understand how workouts, nutrition, sleep, hydration, mood, energy, and productivity relate over time. Users record one daily entry and receive a timeline, wellness score, correlations, and explainable recommendations. The application uses its own API for accounts and logs and an adapter layer for nutrition and exercise searches.

The problem is that fitness, nutrition, sleep, and productivity are often tracked in separate applications. VitaForge brings them together without claiming to diagnose health conditions. Its main question is: which repeatable habits appear to support this user's best days?

## Idea 2: CivicMatch

CivicMatch would let users answer questions about community issues and compare their preferences with public candidates or organizations. A public civic-information API would supply representative data, while the application's API would store profiles, preferences, saved matches, and reminders. Every match would include a transparent explanation.

## Idea 3: WakeGlow

WakeGlow would provide gradual-light alarms and reusable sleep routines. Users could schedule light and nature-sound alarms, review routine completion, and optionally adjust alarms using local sunrise data. Its API would store accounts, schedules, preferences, and completion history.

## Selection rationale

VitaForge was selected because it supports a clear, personally useful workflow and demonstrates the complete course scope: Next.js and React UI, MongoDB persistence, authentication, protected CRUD APIs, external-API adapters, analytics, automated tests, responsive design, and deployment.
