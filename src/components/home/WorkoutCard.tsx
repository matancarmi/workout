import { ChevronLeft, History } from 'lucide-react'
import { getExercise } from '../../data/exerciseLibrary'
import type { WorkoutDay, WorkoutSession } from '../../types'
import { ExerciseImage } from '../shared/ExerciseImage'

interface WorkoutCardProps {
  day: WorkoutDay
  lastSession: WorkoutSession | null
  onStart: () => void
}

export function WorkoutCard({ day, lastSession, onStart }: WorkoutCardProps) {
  const previewExercises = day.exercises.slice(0, 4)
  const lastDate = lastSession?.finishedAt
    ? new Date(lastSession.finishedAt).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })
    : null

  return (
    <button
      onClick={onStart}
      className="flex w-full flex-col gap-4 rounded-3xl border border-border bg-surface-card p-5 text-start active:bg-white/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-extrabold text-white">{day.name}</h3>
          <p className="mt-1 text-sm text-white/50">{day.exercises.length} תרגילים</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <ChevronLeft size={22} />
        </div>
      </div>

      <div className="flex -space-x-2 rtl:space-x-reverse">
        {previewExercises.map((rex) => {
          const exercise = getExercise(rex.exerciseId)
          if (!exercise) return null
          return (
            <div key={rex.id} className="ring-2 ring-surface-card rounded-2xl">
              <ExerciseImage icon={exercise.icon} muscleGroup={exercise.muscleGroup} imageId={exercise.imageId} size="sm" />
            </div>
          )
        })}
        {day.exercises.length > previewExercises.length && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-raised text-xs font-bold text-white/60 ring-2 ring-surface-card">
            +{day.exercises.length - previewExercises.length}
          </div>
        )}
      </div>

      {lastDate && (
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <History size={14} />
          אומן לאחרונה ב-{lastDate}
        </div>
      )}
    </button>
  )
}
