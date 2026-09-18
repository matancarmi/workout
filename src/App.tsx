import { useState } from 'react'
import { ActiveWorkout } from './components/workout/ActiveWorkout'
import { HomeScreen } from './components/home/HomeScreen'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { useAppData } from './hooks/useAppData'
import type { Routine, WorkoutDay, WorkoutSession } from './types'

type View = 'home' | 'onboarding' | 'workout'

function App() {
  const { data, setRoutine, upsertSession, replaceAll, lastSessionForDay } = useAppData()
  const [view, setView] = useState<View>('home')
  const [activeDay, setActiveDay] = useState<WorkoutDay | null>(null)

  const showOnboarding = !data.routine || view === 'onboarding'

  function handleOnboardingComplete(routine: Routine) {
    setRoutine(routine)
    setView('home')
  }

  function handleStartWorkout(day: WorkoutDay) {
    setActiveDay(day)
    setView('workout')
  }

  function handleFinishWorkout(session: WorkoutSession) {
    upsertSession(session)
    setActiveDay(null)
    setView('home')
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onCancel={data.routine ? () => setView('home') : undefined}
      />
    )
  }

  if (view === 'workout' && activeDay) {
    return (
      <ActiveWorkout
        day={activeDay}
        sessions={data.sessions}
        onSaveProgress={upsertSession}
        onFinish={handleFinishWorkout}
        onExit={() => {
          setActiveDay(null)
          setView('home')
        }}
      />
    )
  }

  return (
    <HomeScreen
      routine={data.routine!}
      data={data}
      lastSessionForDay={lastSessionForDay}
      onStartWorkout={handleStartWorkout}
      onResetRoutine={() => setView('onboarding')}
      onImportData={replaceAll}
    />
  )
}

export default App
