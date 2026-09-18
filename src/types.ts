export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'glutes'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'cardio'

export type Equipment = 'full_gym' | 'dumbbells_only' | 'bodyweight'

export type SplitType = 'full_body' | 'upper_lower' | 'push_pull_legs'

export type FocusArea = 'balanced' | 'legs' | 'upper_body' | 'core'

export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  secondaryMuscles?: MuscleGroup[]
  equipment: Equipment[]
  description: string
  icon: string
  /** Folder name in the free-exercise-db dataset (github.com/yuhonas/free-exercise-db), used to build demo photo URLs. */
  imageId?: string
  defaultSets: number
  defaultReps: string
}

export interface RoutineExercise {
  id: string
  exerciseId: string
  sets: number
  repRange: string
}

export interface WorkoutDay {
  id: string
  name: string
  focusLabel: string
  exercises: RoutineExercise[]
}

export interface OnboardingPreferences {
  splitType: SplitType
  daysPerWeek: number
  focus: FocusArea
  equipment: Equipment
}

export interface Routine {
  id: string
  createdAt: string
  preferences: OnboardingPreferences
  workoutDays: WorkoutDay[]
}

export interface SetLog {
  setNumber: number
  weight: number | null
  reps: number | null
  completed: boolean
}

export interface ExerciseLog {
  routineExerciseId: string
  exerciseId: string
  sets: SetLog[]
}

export interface WorkoutSession {
  id: string
  workoutDayId: string
  workoutDayName: string
  startedAt: string
  finishedAt: string | null
  exerciseLogs: ExerciseLog[]
}

export interface AppData {
  version: number
  routine: Routine | null
  sessions: WorkoutSession[]
}
