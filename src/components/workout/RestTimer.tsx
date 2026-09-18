import { Minus, Plus, TimerOff } from 'lucide-react'

interface RestTimerProps {
  remaining: number
  isRunning: boolean
  onAdjust: (delta: number) => void
  onSkip: () => void
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function RestTimer({ remaining, isRunning, onAdjust, onSkip }: RestTimerProps) {
  if (!isRunning) return null

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-raised/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
        <button
          onClick={() => onAdjust(-15)}
          aria-label="Subtract 15 seconds"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white active:bg-white/10"
        >
          <Minus size={20} />
        </button>

        <div className="flex flex-1 flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/40">Rest</span>
          <span className="font-mono text-2xl font-extrabold tabular-nums text-primary">{formatTime(remaining)}</span>
        </div>

        <button
          onClick={() => onAdjust(15)}
          aria-label="Add 15 seconds"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white active:bg-white/10"
        >
          <Plus size={20} />
        </button>

        <button
          onClick={onSkip}
          aria-label="Skip rest"
          className="flex h-12 items-center gap-1.5 rounded-2xl bg-primary/15 px-4 text-sm font-bold text-primary active:bg-primary/25"
        >
          <TimerOff size={16} />
          Skip
        </button>
      </div>
    </div>
  )
}
