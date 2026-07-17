# Capstone Step 2 - Project Proposal

## Project title

VitaForge

## Goal

Build a database-driven wellness journal that helps users identify relationships between daily habits and their reported mood, energy, and productivity.

## Problem

Many wellness tools isolate one category, such as workouts, food, or sleep. That makes it difficult to see whether a short workout, consistent bedtime, hydration, or protein intake appears alongside better days. VitaForge gives the user one daily form and turns the combined history into transparent patterns.

## Target users

- Adults who want a lightweight daily wellness journal
- Fitness beginners comparing habits without needing an advanced training platform
- Knowledge workers interested in energy and productivity patterns

## Core user flows

1. A visitor can explore sample entries in preview mode, while a newly registered user begins with an empty private journal.
2. A returning user signs in and sees only their own logs.
3. The user creates, edits, or deletes a daily entry.
4. The user searches the food or exercise catalog and applies a result to the form.
5. The dashboard recalculates averages, streak, wellness scores, correlations, and recommendations.
6. The user signs out and the protected data becomes inaccessible.

## Data strategy

VitaForge provides its own account, session, and daily-log API through Next.js route handlers. MongoDB stores users, hashed sessions, and daily logs as separate documents. Unique indexes enforce email and user/date uniqueness, while atomic document operations prevent lost updates. Food and exercise search endpoints currently normalize curated demonstration catalogs; production adapters could call USDA FoodData Central and ExerciseDB or API Ninjas.

## Technology

- Next.js App Router and React frontend
- Next.js REST-style route handlers
- MongoDB and MongoDB Atlas
- Vercel deployment
- Salted `scrypt` password hashes and random bearer sessions
- Automated domain, validation, authentication, and MongoDB integration tests

## MVP features

- Registration, login, logout, and protected routes
- Daily-log CRUD
- Dashboard averages and streak
- Wellness scores and correlations
- Food and exercise searches
- Responsive layouts
- Persistent local and deployed data
- Automated tests and complete documentation

## Scope and safety boundaries

VitaForge records user-entered wellness observations. It does not diagnose conditions, prescribe treatment, or replace a clinician. The first deployed version is a portfolio demonstration. A public production release would require verified email, account recovery, abuse controls, privacy-policy review, encryption and retention decisions, data export/deletion, and security monitoring.

## Success criteria

- Users can register, authenticate, and access only their own records.
- All daily-log CRUD operations work through the API.
- Dashboard insights update after data changes.
- Automated health, authentication, validation, and MongoDB integration tests pass.
- The production build succeeds and the deployed health endpoint responds.
- The repository contains the required planning, model, API, README, and submission documents.
