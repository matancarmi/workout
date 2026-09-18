# Iron Log — Workout Tracker

A mobile-first, dark-themed gym workout tracker. Set up a routine once, then log
every session on the gym floor with large, thumb-friendly controls.

## Stack

- **React 19 + TypeScript** — component logic and types
- **Vite** — dev server and build
- **Tailwind CSS v4** — styling (via `@tailwindcss/vite`)
- **lucide-react** — icons

All data (routine + workout history) is stored in the browser's `localStorage`.
No backend, no accounts. A JSON export/import panel on the Home screen doubles
as a manual backup.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check + production build
npm run preview   # preview the production build
npm run lint       # oxlint
```

## App flow

1. **Onboarding** (first load, or via "Reset Routine") — pick a split, training
   days/week, a focus area, and available equipment. A full routine is
   generated from a built-in exercise library; any exercise can be swapped
   for an alternative that targets the same muscle group before approving.
2. **Home** — one card per workout day in the routine, plus Reset Routine and
   JSON Export/Import.
3. **Active Workout** — a set-by-set log for each exercise with the previous
   session's weight × reps shown alongside the input fields (progressive
   overload). Marking a set complete starts a 45s rest timer with ±15s
   on-the-fly adjustment.

## Project structure

```
src/
  types.ts                 domain model (routine, sessions, sets, ...)
  data/exerciseLibrary.ts  built-in exercise library
  lib/                     routine generator, storage/export-import, ids
  hooks/                   app data (localStorage) + rest timer hooks
  components/
    onboarding/            preference wizard, routine preview, exercise swap
    home/                  workout day list, backup panel
    workout/               active workout screen, set rows, rest timer
    shared/                buttons, modal, exercise icon tile
```
