import { Check } from 'lucide-react'
import type { SetLog } from '../../types'

interface SetRowProps {
  set: SetLog
  previous: SetLog | null
  onChangeWeight: (value: number | null) => void
  onChangeReps: (value: number | null) => void
  onToggleComplete: () => void
}

function parseNumberInput(raw: string): number | null {
  if (raw.trim() === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function SetRow({ set, previous, onChangeWeight, onChangeReps, onToggleComplete }: SetRowProps) {
  const previousLabel = previous && previous.weight != null && previous.reps != null ? `${previous.weight} × ${previous.reps}` : '—'

  return (
    <div className={`flex items-center gap-2 rounded-2xl p-2.5 ${set.completed ? 'bg-accent/10' : 'bg-surface-raised'}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm font-bold text-white/70">
        {set.setNumber}
      </div>

      <div className="flex w-16 shrink-0 flex-col items-center justify-center">
        <span className="text-[10px] uppercase tracking-wide text-white/30">Prev</span>
        <span className="text-xs font-medium text-white/50">{previousLabel}</span>
      </div>

      <input
        type="number"
        inputMode="decimal"
        placeholder={previous?.weight != null ? String(previous.weight) : 'kg'}
        value={set.weight ?? ''}
        onChange={(e) => onChangeWeight(parseNumberInput(e.target.value))}
        className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-surface px-2 text-center text-base font-semibold text-white placeholder:text-white/25 focus:border-primary focus:outline-none"
      />

      <input
        type="number"
        inputMode="numeric"
        placeholder={previous?.reps != null ? String(previous.reps) : 'reps'}
        value={set.reps ?? ''}
        onChange={(e) => onChangeReps(parseNumberInput(e.target.value))}
        className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-surface px-2 text-center text-base font-semibold text-white placeholder:text-white/25 focus:border-primary focus:outline-none"
      />

      <button
        onClick={onToggleComplete}
        aria-label={set.completed ? 'Mark set incomplete' : 'Mark set complete'}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-colors ${
          set.completed ? 'border-accent bg-accent text-surface' : 'border-white/15 text-white/30 active:bg-white/5'
        }`}
      >
        <Check size={20} strokeWidth={3} />
      </button>
    </div>
  )
}
