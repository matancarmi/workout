import Anthropic from '@anthropic-ai/sdk'
import { getExercise } from '../data/exerciseLibrary'
import { makeId } from './id'
import type { Equipment, Routine } from '../types'

export const COACH_TOOLS: Anthropic.Tool[] = [
  {
    name: 'swap_exercise',
    description:
      'Replace one exercise already in the routine with a different exercise from EXERCISE_LIBRARY. Keeps the same sets/rep range unless update_sets_reps is also called.',
    input_schema: {
      type: 'object',
      properties: {
        routine_exercise_id: {
          type: 'string',
          description: 'id of the routine exercise entry to replace, from CURRENT_ROUTINE.',
        },
        new_exercise_id: {
          type: 'string',
          description: 'id of the replacement exercise, from EXERCISE_LIBRARY.',
        },
      },
      required: ['routine_exercise_id', 'new_exercise_id'],
    },
  },
  {
    name: 'update_sets_reps',
    description: 'Change the target sets and/or rep range for an exercise already in the routine.',
    input_schema: {
      type: 'object',
      properties: {
        routine_exercise_id: { type: 'string', description: 'id from CURRENT_ROUTINE.' },
        sets: { type: 'integer', minimum: 1, maximum: 8 },
        rep_range: { type: 'string', description: 'e.g. "8-12" or "30-60 שניות"' },
      },
      required: ['routine_exercise_id'],
    },
  },
  {
    name: 'add_exercise',
    description: 'Add a new exercise from EXERCISE_LIBRARY to a specific workout day.',
    input_schema: {
      type: 'object',
      properties: {
        day_id: { type: 'string', description: 'id of the workout day, from CURRENT_ROUTINE.' },
        exercise_id: { type: 'string', description: 'id of the exercise to add, from EXERCISE_LIBRARY.' },
        sets: { type: 'integer', minimum: 1, maximum: 8 },
        rep_range: { type: 'string' },
      },
      required: ['day_id', 'exercise_id'],
    },
  },
  {
    name: 'remove_exercise',
    description: 'Remove an exercise from the routine entirely.',
    input_schema: {
      type: 'object',
      properties: {
        routine_exercise_id: { type: 'string', description: 'id from CURRENT_ROUTINE.' },
      },
      required: ['routine_exercise_id'],
    },
  },
]

interface ToolSuccess {
  ok: true
  routine: Routine
  message: string
}

interface ToolFailure {
  ok: false
  message: string
}

function findExerciseLocation(routine: Routine, routineExerciseId: string) {
  for (const day of routine.workoutDays) {
    const index = day.exercises.findIndex((rex) => rex.id === routineExerciseId)
    if (index !== -1) return { day, index }
  }
  return null
}

function validateLibraryExercise(exerciseId: string, equipment: Equipment): ToolFailure | null {
  const exercise = getExercise(exerciseId)
  if (!exercise) {
    return { ok: false, message: `Unknown exercise_id "${exerciseId}". It must be one of the ids listed in EXERCISE_LIBRARY.` }
  }
  if (!exercise.equipment.includes(equipment)) {
    return {
      ok: false,
      message: `Exercise "${exerciseId}" is not compatible with the user's equipment (${equipment}). Choose one from EXERCISE_LIBRARY.`,
    }
  }
  return null
}

export function applyToolCall(
  routine: Routine,
  equipment: Equipment,
  toolName: string,
  input: unknown,
): ToolSuccess | ToolFailure {
  const args = (input ?? {}) as Record<string, unknown>

  switch (toolName) {
    case 'swap_exercise': {
      const routineExerciseId = String(args.routine_exercise_id ?? '')
      const newExerciseId = String(args.new_exercise_id ?? '')
      const location = findExerciseLocation(routine, routineExerciseId)
      if (!location) {
        return { ok: false, message: `Unknown routine_exercise_id "${routineExerciseId}".` }
      }
      const invalid = validateLibraryExercise(newExerciseId, equipment)
      if (invalid) return invalid
      const newExercise = getExercise(newExerciseId)!

      const updatedRoutine: Routine = {
        ...routine,
        workoutDays: routine.workoutDays.map((day) =>
          day.id !== location.day.id
            ? day
            : {
                ...day,
                exercises: day.exercises.map((rex) =>
                  rex.id !== routineExerciseId ? rex : { ...rex, exerciseId: newExerciseId },
                ),
              },
        ),
      }
      return { ok: true, routine: updatedRoutine, message: `הוחלף לתרגיל "${newExercise.name}".` }
    }

    case 'update_sets_reps': {
      const routineExerciseId = String(args.routine_exercise_id ?? '')
      const location = findExerciseLocation(routine, routineExerciseId)
      if (!location) {
        return { ok: false, message: `Unknown routine_exercise_id "${routineExerciseId}".` }
      }
      const sets = typeof args.sets === 'number' ? Math.round(args.sets) : undefined
      const repRange = typeof args.rep_range === 'string' ? args.rep_range : undefined
      if (sets == null && repRange == null) {
        return { ok: false, message: 'Provide at least one of sets or rep_range.' }
      }
      if (sets != null && (sets < 1 || sets > 8)) {
        return { ok: false, message: 'sets must be between 1 and 8.' }
      }

      const updatedRoutine: Routine = {
        ...routine,
        workoutDays: routine.workoutDays.map((day) =>
          day.id !== location.day.id
            ? day
            : {
                ...day,
                exercises: day.exercises.map((rex) =>
                  rex.id !== routineExerciseId
                    ? rex
                    : { ...rex, sets: sets ?? rex.sets, repRange: repRange ?? rex.repRange },
                ),
              },
        ),
      }
      return { ok: true, routine: updatedRoutine, message: 'עודכנו הסטים/חזרות היעד.' }
    }

    case 'add_exercise': {
      const dayId = String(args.day_id ?? '')
      const exerciseId = String(args.exercise_id ?? '')
      const day = routine.workoutDays.find((d) => d.id === dayId)
      if (!day) {
        return { ok: false, message: `Unknown day_id "${dayId}".` }
      }
      const invalid = validateLibraryExercise(exerciseId, equipment)
      if (invalid) return invalid
      const exercise = getExercise(exerciseId)!
      const sets = typeof args.sets === 'number' ? Math.round(args.sets) : exercise.defaultSets
      const repRange = typeof args.rep_range === 'string' ? args.rep_range : exercise.defaultReps

      const updatedRoutine: Routine = {
        ...routine,
        workoutDays: routine.workoutDays.map((d) =>
          d.id !== dayId
            ? d
            : { ...d, exercises: [...d.exercises, { id: makeId('rex'), exerciseId, sets, repRange }] },
        ),
      }
      return { ok: true, routine: updatedRoutine, message: `נוסף התרגיל "${exercise.name}" ל${day.name}.` }
    }

    case 'remove_exercise': {
      const routineExerciseId = String(args.routine_exercise_id ?? '')
      const location = findExerciseLocation(routine, routineExerciseId)
      if (!location) {
        return { ok: false, message: `Unknown routine_exercise_id "${routineExerciseId}".` }
      }
      const removedExercise = getExercise(location.day.exercises[location.index].exerciseId)

      const updatedRoutine: Routine = {
        ...routine,
        workoutDays: routine.workoutDays.map((day) =>
          day.id !== location.day.id
            ? day
            : { ...day, exercises: day.exercises.filter((rex) => rex.id !== routineExerciseId) },
        ),
      }
      return { ok: true, routine: updatedRoutine, message: `הוסר התרגיל "${removedExercise?.name ?? routineExerciseId}".` }
    }

    default:
      return { ok: false, message: `Unknown tool "${toolName}".` }
  }
}
