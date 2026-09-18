import { exercisesForMuscleGroup } from '../data/exerciseLibrary'
import { makeId } from './id'
import type {
  Equipment,
  Exercise,
  FocusArea,
  MuscleGroup,
  OnboardingPreferences,
  Routine,
  RoutineExercise,
  SplitType,
  WorkoutDay,
} from '../types'

interface Slot {
  group: MuscleGroup
  count: number
}

const FULL_BODY_TEMPLATE: Slot[] = [
  { group: 'legs', count: 2 },
  { group: 'chest', count: 1 },
  { group: 'back', count: 1 },
  { group: 'shoulders', count: 1 },
  { group: 'core', count: 1 },
]

const UPPER_TEMPLATE: Slot[] = [
  { group: 'chest', count: 2 },
  { group: 'back', count: 2 },
  { group: 'shoulders', count: 1 },
  { group: 'biceps', count: 1 },
  { group: 'triceps', count: 1 },
]

const LOWER_TEMPLATE: Slot[] = [
  { group: 'legs', count: 2 },
  { group: 'glutes', count: 1 },
  { group: 'legs', count: 1 },
  { group: 'core', count: 1 },
]

const PUSH_TEMPLATE: Slot[] = [
  { group: 'chest', count: 2 },
  { group: 'shoulders', count: 2 },
  { group: 'triceps', count: 1 },
]

const PULL_TEMPLATE: Slot[] = [
  { group: 'back', count: 3 },
  { group: 'biceps', count: 2 },
]

const LEGS_TEMPLATE: Slot[] = [
  { group: 'legs', count: 2 },
  { group: 'glutes', count: 2 },
  { group: 'core', count: 1 },
]

const SPLIT_LABELS: Record<SplitType, string> = {
  full_body: 'פול בודי',
  upper_lower: 'עליון / תחתון',
  push_pull_legs: 'דחיפה / משיכה / רגליים',
}

const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח']

function templatesForSplit(split: SplitType): { label: string; slots: Slot[] }[] {
  switch (split) {
    case 'full_body':
      return [{ label: 'פול בודי', slots: FULL_BODY_TEMPLATE }]
    case 'upper_lower':
      return [
        { label: 'גוף עליון', slots: UPPER_TEMPLATE },
        { label: 'גוף תחתון', slots: LOWER_TEMPLATE },
      ]
    case 'push_pull_legs':
      return [
        { label: 'דחיפה', slots: PUSH_TEMPLATE },
        { label: 'משיכה', slots: PULL_TEMPLATE },
        { label: 'רגליים', slots: LEGS_TEMPLATE },
      ]
  }
}

function applyFocusBoost(slots: Slot[], focus: FocusArea): Slot[] {
  if (focus === 'balanced') return slots
  const boostGroups: MuscleGroup[] =
    focus === 'legs' ? ['legs', 'glutes'] : focus === 'upper_body' ? ['chest', 'back', 'shoulders'] : ['core']

  const boosted = slots.map((slot) => ({ ...slot }))
  const primaryTarget = boosted.find((s) => boostGroups.includes(s.group))
  if (primaryTarget) {
    primaryTarget.count += 1
  } else {
    boosted.push({ group: boostGroups[0], count: 1 })
  }
  return boosted
}

function pickExercises(group: MuscleGroup, count: number, equipment: Equipment, offset: number): Exercise[] {
  const pool = exercisesForMuscleGroup(group, equipment)
  if (pool.length === 0) return []
  const picked: Exercise[] = []
  const seen = new Set<string>()
  for (let i = 0; i < count; i++) {
    const idx = (offset + i) % pool.length
    const candidate = pool[idx]
    if (!seen.has(candidate.id)) {
      seen.add(candidate.id)
      picked.push(candidate)
    }
  }
  // Backfill if duplicates were skipped and pool has more unique options
  let fallbackIdx = 0
  while (picked.length < count && fallbackIdx < pool.length) {
    const candidate = pool[fallbackIdx]
    if (!seen.has(candidate.id)) {
      seen.add(candidate.id)
      picked.push(candidate)
    }
    fallbackIdx++
  }
  return picked
}

function buildDay(dayIndex: number, label: string, slots: Slot[], equipment: Equipment): WorkoutDay {
  const letter = HEBREW_LETTERS[dayIndex] ?? String(dayIndex + 1)
  const routineExercises: RoutineExercise[] = []
  let groupOffsetSeed = dayIndex * 3

  for (const slot of slots) {
    const exercises = pickExercises(slot.group, slot.count, equipment, groupOffsetSeed)
    for (const exercise of exercises) {
      routineExercises.push({
        id: makeId('rex'),
        exerciseId: exercise.id,
        sets: exercise.defaultSets,
        repRange: exercise.defaultReps,
      })
    }
    groupOffsetSeed += slot.count
  }

  return {
    id: makeId('day'),
    name: `אימון ${letter} — ${label}`,
    focusLabel: label,
    exercises: routineExercises,
  }
}

export function generateRoutine(preferences: OnboardingPreferences): Routine {
  const { splitType, daysPerWeek, focus, equipment } = preferences
  const templates = templatesForSplit(splitType)

  const workoutDays: WorkoutDay[] = []
  for (let i = 0; i < daysPerWeek; i++) {
    const template = templates[i % templates.length]
    const slots = applyFocusBoost(template.slots, focus)
    workoutDays.push(buildDay(i, template.label, slots, equipment))
  }

  return {
    id: makeId('routine'),
    createdAt: new Date().toISOString(),
    preferences,
    workoutDays,
  }
}

export function splitLabel(split: SplitType): string {
  return SPLIT_LABELS[split]
}

export const SPLIT_OPTIONS: { value: SplitType; label: string; description: string; dayOptions: number[] }[] = [
  {
    value: 'full_body',
    label: 'פול בודי',
    description: 'אימון לכל הגוף בכל מפגש. מתאים ל-2-4 ימים בשבוע.',
    dayOptions: [2, 3, 4],
  },
  {
    value: 'upper_lower',
    label: 'עליון / תחתון',
    description: 'לסירוגין בין יום עליון ליום תחתון. מתאים ל-3-4 ימים בשבוע.',
    dayOptions: [3, 4],
  },
  {
    value: 'push_pull_legs',
    label: 'דחיפה / משיכה / רגליים',
    description: 'פיצול PPL קלאסי לתדירות אימון גבוהה יותר.',
    dayOptions: [3, 6],
  },
]

export const FOCUS_OPTIONS: { value: FocusArea; label: string; description: string }[] = [
  { value: 'balanced', label: 'מאוזן', description: 'תשומת לב שווה לכל קבוצות השרירים.' },
  { value: 'legs', label: 'רגליים וישבן', description: 'נפח נוסף לארבע-ראשי, המסטרינג וישבן.' },
  { value: 'upper_body', label: 'גוף עליון', description: 'נפח נוסף לחזה, גב וכתפיים.' },
  { value: 'core', label: 'ליבה', description: 'עבודת בטן וליבה נוספת בכל אימון.' },
]

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string; description: string }[] = [
  { value: 'full_gym', label: 'חדר כושר מלא', description: 'מוטות, מכשירים, כבלים ומשקולות.' },
  { value: 'dumbbells_only', label: 'משקולות בלבד', description: 'מתאים לאימון ביתי עם זוג משקולות.' },
  { value: 'bodyweight', label: 'משקל גוף', description: 'ללא צורך בציוד כלל.' },
]
