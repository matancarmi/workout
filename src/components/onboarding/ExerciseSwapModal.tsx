import { Check } from 'lucide-react'
import { alternativesFor, getExercise } from '../../data/exerciseLibrary'
import type { Equipment } from '../../types'
import { ExerciseImage } from '../shared/ExerciseImage'
import { Modal } from '../shared/Modal'

interface ExerciseSwapModalProps {
  open: boolean
  onClose: () => void
  exerciseId: string
  equipment: Equipment
  onSelect: (newExerciseId: string) => void
}

export function ExerciseSwapModal({ open, onClose, exerciseId, equipment, onSelect }: ExerciseSwapModalProps) {
  const current = getExercise(exerciseId)
  const alternatives = alternativesFor(exerciseId, equipment)

  if (!current) return null

  return (
    <Modal open={open} onClose={onClose} title={`Swap ${current.name}`}>
      <p className="mb-3 text-sm text-white/50">
        Same muscle group ({current.muscleGroup}), pick a replacement exercise.
      </p>
      <div className="flex flex-col gap-2">
        {alternatives.length === 0 && (
          <p className="rounded-xl bg-surface-card p-4 text-sm text-white/50">
            No alternatives available for your equipment selection.
          </p>
        )}
        {alternatives.map((ex) => (
          <button
            key={ex.id}
            onClick={() => {
              onSelect(ex.id)
              onClose()
            }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface-card p-3 text-left active:bg-white/5"
          >
            <ExerciseImage icon={ex.icon} muscleGroup={ex.muscleGroup} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{ex.name}</p>
              <p className="truncate text-xs text-white/50">{ex.description}</p>
            </div>
          </button>
        ))}
        <div className="mt-1 flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-3">
          <ExerciseImage icon={current.icon} muscleGroup={current.muscleGroup} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white">{current.name}</p>
            <p className="text-xs text-primary">Currently selected</p>
          </div>
          <Check size={18} className="shrink-0 text-primary" />
        </div>
      </div>
    </Modal>
  )
}
