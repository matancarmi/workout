import { useState } from 'react'
import { ArrowLeftRight, Check, Sparkles } from 'lucide-react'
import { getExercise } from '../../data/exerciseLibrary'
import type { Equipment, Routine } from '../../types'
import { CoachChat } from '../coach/CoachChat'
import { Button } from '../shared/Button'
import { ExerciseImage } from '../shared/ExerciseImage'
import { ExerciseSwapModal } from './ExerciseSwapModal'

interface RoutinePreviewProps {
  routine: Routine
  equipment: Equipment
  onSwapExercise: (dayId: string, routineExerciseId: string, newExerciseId: string) => void
  onRoutineChange: (routine: Routine) => void
  onApprove: () => void
  onBack: () => void
}

export function RoutinePreview({
  routine,
  equipment,
  onSwapExercise,
  onRoutineChange,
  onApprove,
  onBack,
}: RoutinePreviewProps) {
  const [swapTarget, setSwapTarget] = useState<{ dayId: string; routineExerciseId: string; exerciseId: string } | null>(
    null,
  )
  const [coachOpen, setCoachOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">התוכנית שלך</h1>
        <p className="mt-1 text-sm text-white/50">
          סקירת התוכנית בת {routine.workoutDays.length} הימים. הקש/י על כל תרגיל כדי להחליף אותו בתרגיל חלופי.
        </p>
      </div>

      <Button variant="secondary" size="lg" fullWidth icon={<Sparkles size={20} />} onClick={() => setCoachOpen(true)}>
        התייעצות עם מאמן AI
      </Button>

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
                    className="flex items-center gap-3 rounded-2xl bg-surface-raised p-3 text-start active:bg-white/5"
                  >
                    <ExerciseImage icon={exercise.icon} muscleGroup={exercise.muscleGroup} imageId={exercise.imageId} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{exercise.name}</p>
                      <p className="text-xs text-white/50">
                        {rex.sets} סטים × {rex.repRange}
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
          חזרה
        </Button>
        <Button variant="primary" onClick={onApprove} className="flex-[2]" icon={<Check size={20} />}>
          אישור התוכנית
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

      {coachOpen && (
        <CoachChat
          routine={routine}
          equipment={equipment}
          onClose={() => setCoachOpen(false)}
          onRoutineChange={onRoutineChange}
        />
      )}
    </div>
  )
}
