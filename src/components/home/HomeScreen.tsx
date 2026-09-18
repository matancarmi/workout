import { useState } from 'react'
import { Dumbbell, RotateCcw } from 'lucide-react'
import type { AppData, Routine, WorkoutDay, WorkoutSession } from '../../types'
import { Button } from '../shared/Button'
import { Modal } from '../shared/Modal'
import { BackupPanel } from './BackupPanel'
import { WorkoutCard } from './WorkoutCard'

interface HomeScreenProps {
  routine: Routine
  data: AppData
  lastSessionForDay: (workoutDayId: string) => WorkoutSession | null
  onStartWorkout: (day: WorkoutDay) => void
  onResetRoutine: () => void
  onImportData: (data: AppData) => void
}

export function HomeScreen({
  routine,
  data,
  lastSessionForDay,
  onStartWorkout,
  onResetRoutine,
  onImportData,
}: HomeScreenProps) {
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-10">
      <header className="safe-top sticky top-0 z-10 -mx-4 flex items-center justify-between bg-surface/95 px-4 py-5 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Dumbbell size={22} />
          </div>
          <div>
            <p className="text-lg font-extrabold leading-tight text-white">יומן הברזל</p>
            <p className="text-xs text-white/40">תוכנית של {routine.workoutDays.length} ימים</p>
          </div>
        </div>
        <button
          onClick={() => setConfirmReset(true)}
          aria-label="איפוס תוכנית"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-white/60 active:bg-white/10"
        >
          <RotateCcw size={18} />
        </button>
      </header>

      <main className="flex flex-col gap-4">
        {routine.workoutDays.map((day) => (
          <WorkoutCard key={day.id} day={day} lastSession={lastSessionForDay(day.id)} onStart={() => onStartWorkout(day)} />
        ))}

        <Button variant="secondary" size="lg" fullWidth icon={<RotateCcw size={18} />} onClick={() => setConfirmReset(true)}>
          איפוס תוכנית
        </Button>

        <BackupPanel data={data} onImport={onImportData} />
      </main>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="לאפס את התוכנית?">
        <p className="text-sm text-white/60">
          הפעולה תחליף את התוכנית הנוכחית בתוכנית חדשה. היסטוריית האימונים שלך תישאר בטוחה.
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmReset(false)}>
            ביטול
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              setConfirmReset(false)
              onResetRoutine()
            }}
          >
            איפוס
          </Button>
        </div>
      </Modal>
    </div>
  )
}
