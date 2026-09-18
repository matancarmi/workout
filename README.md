# יומן הברזל — Iron Log Workout Tracker

A mobile-first, dark-themed gym workout tracker with a fully Hebrew, RTL
interface. Set up a routine once, then log every session on the gym floor
with large, thumb-friendly controls.

## Stack

- **React 19 + TypeScript** — component logic and types
- **Vite** — dev server and build
- **Tailwind CSS v4** — styling (via `@tailwindcss/vite`)
- **lucide-react** — icons
- Exercise demo photos are pulled at runtime from the open
  [free-exercise-db](https://github.com/yuhonas/free-exercise-db) dataset
  (`src/lib/exerciseImages.ts`); an exercise without a mapped photo falls
  back to its icon tile.
- **AI Coach** (routine preview step only): an optional chat with Claude
  (`claude-opus-5` via `@anthropic-ai/sdk`, called directly from the browser)
  that can discuss the draft routine and apply changes — swap/add/remove an
  exercise, adjust sets/reps — through tool use before you approve it. Needs
  your own Anthropic API key, entered once and stored only in that browser's
  `localStorage`; usage is billed to your Anthropic account.

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
   During preview, an optional "AI Coach" chat can discuss and directly edit
   the draft routine before you approve it.
3. **Active Workout** — a set-by-set log for each exercise with the previous
   session's weight × reps shown alongside the input fields (progressive
   overload). Marking a set complete starts a 45s rest timer with ±15s
   on-the-fly adjustment.

## Project structure

```
src/
  types.ts                 domain model (routine, sessions, sets, ...)
  data/exerciseLibrary.ts  built-in exercise library
  lib/                     routine generator, storage/export-import, ids,
                           exercise image URLs, AI coach tools + agent loop
  hooks/                   app data (localStorage), rest timer, API key
  components/
    onboarding/            preference wizard, routine preview, exercise swap
    home/                  workout day list, backup panel
    workout/               active workout screen, set rows, rest timer
    coach/                 AI coach chat (routine preview step)
    shared/                buttons, modal, exercise icon tile
```
