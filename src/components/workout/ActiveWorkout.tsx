import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { getExercise } from '../../data/exerciseLibrary'
import { makeId } from '../../lib/id'
import type { ExerciseLog, WorkoutDay, WorkoutSession } from '../../types'
import { useRestTimer } from '../../hooks/useRestTimer'
import { Button } from '../shared/Button'
import { ExerciseCard } from './ExerciseCard'
import { RestTimer } from './RestTimer'

interface ActiveWorkoutProps {
  day: WorkoutDay
  sessions: WorkoutSession[]
  onSaveProgress: (session: WorkoutSession) => void
  onFinish: (session: WorkoutSession) => void
  onExit: () => void
}

function buildInitialLogs(day: WorkoutDay): ExerciseLog[] {
  return day.exercises.map((rex) => ({
    routineExerciseId: rex.id,
    exerciseId: rex.exerciseId,
    sets: Array.from({ length: rex.sets }, (_, i) => ({
      setNumber: i + 1,
      weight: null,
      reps: null,
      completed: false,
    })),
  }))
}

export function ActiveWorkout({ day, sessions, onSaveProgress, onFinish, onExit }: ActiveWorkoutProps) {
  const [sessionId] = useState(() => makeId('session'))
  const [startedAt] = useState(() => new Date().toISOString())
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() => buildInitialLogs(day))
  const restTimer = useRestTimer()

  const previousLogs = useMemo(() => {
    const map = new Map<string, ExerciseLog>()
    const finished = sessions
      .filter((s) => s.finishedAt)
      .sort((a, b) => new Date(b.finishedAt!).getTime() - new Date(a.finishedAt!).getTime())
    for (const exLog of exerciseLogs) {
      for (const session of finished) {
        const match = session.exerciseLogs.find((l) => l.exerciseId === exLog.exerciseId)
        if (match) {
          map.set(exLog.exerciseId, match)
          break
        }
      }
    }
    return map
  }, [exerciseLogs, sessions])

  useEffect(() => {
    onSaveProgress({
      id: sessionId,
      workoutDayId: day.id,
      workoutDayName: day.name,
      startedAt,
      finishedAt: null,
      exerciseLogs,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseLogs])

  const totalSets = exerciseLogs.reduce((sum, log) => sum + log.sets.length, 0)
  const completedSets = exerciseLogs.reduce((sum, log) => sum + log.sets.filter((s) => s.completed).length, 0)

  function updateSet(exerciseIndex: number, setIndex: number, patch: { weight?: number | null; reps?: number | null }) {
    setExerciseLogs((prev) =>
      prev.map((log, i) =>
        i !== exerciseIndex
          ? log
          : {
              ...log,
              sets: log.sets.map((s, j) => (j !== setIndex ? s : { ...s, ...patch })),
            },
      ),
    )
  }

  function toggleComplete(exerciseIndex: number, setIndex: number) {
    let willBeCompleted = false
    setExerciseLogs((prev) =>
      prev.map((log, i) =>
        i !== exerciseIndex
          ? log
          : {
              ...log,
              sets: log.sets.map((s, j) => {
                if (j !== setIndex) return s
                willBeCompleted = !s.completed
                return { ...s, completed: willBeCompleted }
              }),
            },
      ),
    )
    if (willBeCompleted) restTimer.start()
  }

  function handleFinish() {
    onFinish({
      id: sessionId,
      workoutDayId: day.id,
      workoutDayName: day.name,
      startedAt,
      finishedAt: new Date().toISOString(),
      exerciseLogs,
    })
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-32">
      <header className="safe-top sticky top-0 z-10 -mx-4 flex items-center gap-3 bg-surface/95 px-4 py-4 backdrop-blur">
        <button
          onClick={onExit}
          aria-label="יציאה מהאימון"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-white/70 active:bg-white/10"
        >
          <ChevronRight size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold text-white">{day.name}</p>
          <p className="text-xs text-white/40">
            {completedSets}/{totalSets} סטים הושלמו
          </p>
        </div>
      </header>

      <main className="flex flex-col gap-4">
        {day.exercises.map((rex, exerciseIndex) => {
          const exercise = getExercise(rex.exerciseId)
          const log = exerciseLogs[exerciseIndex]
          if (!exercise || !log) return null
          return (
            <ExerciseCard
              key={rex.id}
              exercise={exercise}
              routineExercise={rex}
              log={log}
              previousLog={previousLogs.get(rex.exerciseId) ?? null}
              onUpdateSet={(setIndex, patch) => updateSet(exerciseIndex, setIndex, patch)}
              onToggleComplete={(setIndex) => toggleComplete(exerciseIndex, setIndex)}
            />
          )
        })}

        <Button size="xl" fullWidth icon={<Check size={22} />} onClick={handleFinish}>
          סיום האימון
        </Button>
      </main>

      <RestTimer
        remaining={restTimer.remaining}
        isRunning={restTimer.isRunning}
        onAdjust={restTimer.adjust}
        onSkip={restTimer.skip}
      />
    </div>
  )
}
