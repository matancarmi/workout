import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Exercise, ExerciseLog, RoutineExercise } from '../../types'
import { ExerciseImage } from '../shared/ExerciseImage'
import { SetRow } from './SetRow'

interface ExerciseCardProps {
  exercise: Exercise
  routineExercise: RoutineExercise
  log: ExerciseLog
  previousLog: ExerciseLog | null
  onUpdateSet: (setIndex: number, patch: { weight?: number | null; reps?: number | null }) => void
  onToggleComplete: (setIndex: number) => void
}

export function ExerciseCard({ exercise, routineExercise, log, previousLog, onUpdateSet, onToggleComplete }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false)
  const completedCount = log.sets.filter((s) => s.completed).length

  return (
    <div className="rounded-3xl border border-border bg-surface-card p-4">
      <div className="flex items-start gap-3">
        <ExerciseImage icon={exercise.icon} muscleGroup={exercise.muscleGroup} imageId={exercise.imageId} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-white">{exercise.name}</h3>
          <p className="text-xs text-white/50">
            יעד: {routineExercise.sets} סטים × {routineExercise.repRange}
          </p>
          <p className="mt-1 text-xs font-semibold text-accent">
            {completedCount}/{log.sets.length} סטים הושלמו
          </p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'הסתרת תיאור' : 'הצגת תיאור'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/50"
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {expanded && <p className="mt-3 rounded-xl bg-surface-raised p-3 text-sm text-white/60">{exercise.description}</p>}

      <div className="mt-4 flex flex-col gap-2">
        {log.sets.map((set, idx) => (
          <SetRow
            key={set.setNumber}
            set={set}
            previous={previousLog?.sets[idx] ?? null}
            onChangeWeight={(value) => onUpdateSet(idx, { weight: value })}
            onChangeReps={(value) => onUpdateSet(idx, { reps: value })}
            onToggleComplete={() => onToggleComplete(idx)}
          />
        ))}
      </div>
    </div>
  )
}
