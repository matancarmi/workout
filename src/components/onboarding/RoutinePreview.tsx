import { useState } from 'react'
import { ArrowLeftRight, Check } from 'lucide-react'
import { getExercise } from '../../data/exerciseLibrary'
import type { Equipment, Routine } from '../../types'
import { Button } from '../shared/Button'
import { ExerciseImage } from '../shared/ExerciseImage'
import { ExerciseSwapModal } from './ExerciseSwapModal'

interface RoutinePreviewProps {
  routine: Routine
  equipment: Equipment
  onSwapExercise: (dayId: string, routineExerciseId: string, newExerciseId: string) => void
  onApprove: () => void
  onBack: () => void
}

export function RoutinePreview({ routine, equipment, onSwapExercise, onApprove, onBack }: RoutinePreviewProps) {
  const [swapTarget, setSwapTarget] = useState<{ dayId: string; routineExerciseId: string; exerciseId: string } | null>(
    null,
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Your Routine</h1>
        <p className="mt-1 text-sm text-white/50">
          Review your {routine.workoutDays.length}-day plan. Tap any exercise to swap it for an alternative.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {routine.workoutDays.map((day) => (
          <div key={day.id} className="rounded-3xl border border-border bg-surface-card p-4">
            <h3 className="mb-3 text-lg font-bold text-white">{day.name}</h3>
            <div className="flex flex-col gap-2">
              {day.exercises.map((rex) => {
                const exercise = getExercise(rex.exerciseId)
                if (!exercise) return null
                return (
                  <button
                    key={rex.id}
                    onClick={() => setSwapTarget({ dayId: day.id, routineExerciseId: rex.id, exerciseId: rex.exerciseId })}
                    className="flex items-center gap-3 rounded-2xl bg-surface-raised p-3 text-left active:bg-white/5"
                  >
                    <ExerciseImage icon={exercise.icon} muscleGroup={exercise.muscleGroup} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{exercise.name}</p>
                      <p className="text-xs text-white/50">
                        {rex.sets} sets × {rex.repRange}
                      </p>
                    </div>
                    <ArrowLeftRight size={16} className="shrink-0 text-white/30" />
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-border bg-surface/95 px-4 pb-4 pt-3 backdrop-blur">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button variant="primary" onClick={onApprove} className="flex-[2]" icon={<Check size={20} />}>
          Approve Routine
        </Button>
      </div>

      {swapTarget && (
        <ExerciseSwapModal
          open={!!swapTarget}
          onClose={() => setSwapTarget(null)}
          exerciseId={swapTarget.exerciseId}
          equipment={equipment}
          onSelect={(newExerciseId) => onSwapExercise(swapTarget.dayId, swapTarget.routineExerciseId, newExerciseId)}
        />
      )}
    </div>
  )
}
