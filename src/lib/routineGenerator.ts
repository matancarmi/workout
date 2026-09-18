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
  full_body: 'Full Body',
  upper_lower: 'Upper / Lower',
  push_pull_legs: 'Push / Pull / Legs',
}

function templatesForSplit(split: SplitType): { label: string; slots: Slot[] }[] {
  switch (split) {
    case 'full_body':
      return [{ label: 'Full Body', slots: FULL_BODY_TEMPLATE }]
    case 'upper_lower':
      return [
        { label: 'Upper Body', slots: UPPER_TEMPLATE },
        { label: 'Lower Body', slots: LOWER_TEMPLATE },
      ]
    case 'push_pull_legs':
      return [
        { label: 'Push', slots: PUSH_TEMPLATE },
        { label: 'Pull', slots: PULL_TEMPLATE },
        { label: 'Legs', slots: LEGS_TEMPLATE },
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
  const letter = String.fromCharCode(65 + dayIndex)
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
    name: `Workout ${letter} — ${label}`,
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
    label: 'Full Body',
    description: 'Train your whole body every session. Great for 2-4 days/week.',
    dayOptions: [2, 3, 4],
  },
  {
    value: 'upper_lower',
    label: 'Upper / Lower',
    description: 'Alternate upper and lower body days. Great for 3-4 days/week.',
    dayOptions: [3, 4],
  },
  {
    value: 'push_pull_legs',
    label: 'Push / Pull / Legs',
    description: 'Classic PPL split for higher training frequency.',
    dayOptions: [3, 6],
  },
]

export const FOCUS_OPTIONS: { value: FocusArea; label: string; description: string }[] = [
  { value: 'balanced', label: 'Balanced', description: 'Even attention across all muscle groups.' },
  { value: 'legs', label: 'Legs & Glutes', description: 'Extra volume for quads, hamstrings, and glutes.' },
  { value: 'upper_body', label: 'Upper Body', description: 'Extra volume for chest, back, and shoulders.' },
  { value: 'core', label: 'Core', description: 'Extra ab and core work every session.' },
]

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string; description: string }[] = [
  { value: 'full_gym', label: 'Full Gym', description: 'Barbells, machines, cables, and dumbbells.' },
  { value: 'dumbbells_only', label: 'Dumbbells Only', description: 'Home setup with just a pair of dumbbells.' },
  { value: 'bodyweight', label: 'Bodyweight', description: 'No equipment needed at all.' },
]
