import { useMemo, useState } from 'react'
import { ChevronLeft, Dumbbell } from 'lucide-react'
import { EQUIPMENT_OPTIONS, FOCUS_OPTIONS, generateRoutine, SPLIT_OPTIONS } from '../../lib/routineGenerator'
import type { Equipment, FocusArea, OnboardingPreferences, Routine, SplitType } from '../../types'
import { Button } from '../shared/Button'
import { PreferenceStep } from './PreferenceStep'
import { RoutinePreview } from './RoutinePreview'

interface OnboardingFlowProps {
  onComplete: (routine: Routine) => void
  onCancel?: () => void
}

type Step = 'split' | 'days' | 'focus' | 'equipment' | 'preview'

const STEP_ORDER: Step[] = ['split', 'days', 'focus', 'equipment', 'preview']

export function OnboardingFlow({ onComplete, onCancel }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('split')
  const [splitType, setSplitType] = useState<SplitType | null>(null)
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null)
  const [focus, setFocus] = useState<FocusArea | null>(null)
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [routine, setRoutine] = useState<Routine | null>(null)

  const dayOptions = useMemo(() => {
    const split = SPLIT_OPTIONS.find((s) => s.value === splitType)
    return split?.dayOptions ?? []
  }, [splitType])

  function goTo(target: Step) {
    setStep(target)
  }

  function goBack() {
    const idx = STEP_ORDER.indexOf(step)
    if (idx > 0) {
      setStep(STEP_ORDER[idx - 1])
    } else {
      onCancel?.()
    }
  }

  function handleGenerateAndPreview() {
    if (!splitType || !daysPerWeek || !focus || !equipment) return
    const preferences: OnboardingPreferences = { splitType, daysPerWeek, focus, equipment }
    setRoutine(generateRoutine(preferences))
    goTo('preview')
  }

  function handleSwap(dayId: string, routineExerciseId: string, newExerciseId: string) {
    if (!routine) return
    setRoutine({
      ...routine,
      workoutDays: routine.workoutDays.map((day) =>
        day.id !== dayId
          ? day
          : {
              ...day,
              exercises: day.exercises.map((rex) =>
                rex.id !== routineExerciseId ? rex : { ...rex, exerciseId: newExerciseId },
              ),
            },
      ),
    })
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-8">
      <header className="safe-top sticky top-0 z-10 -mx-4 flex items-center gap-2 bg-surface/95 px-4 py-4 backdrop-blur">
        <button
          onClick={goBack}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-white/70 active:bg-white/10"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex flex-1 gap-1.5">
          {STEP_ORDER.map((s, idx) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                STEP_ORDER.indexOf(step) >= idx ? 'bg-primary' : 'bg-surface-card'
              }`}
            />
          ))}
        </div>
      </header>

      {step === 'split' && (
        <PreferenceStep
          title="Choose your split"
          subtitle="How do you want to organize your training week?"
          options={SPLIT_OPTIONS}
          selected={splitType}
          onSelect={(value) => {
            setSplitType(value)
            setDaysPerWeek(null)
            goTo('days')
          }}
        />
      )}

      {step === 'days' && (
        <PreferenceStep
          title="Days per week"
          subtitle="How many days can you train?"
          options={dayOptions.map((d) => ({
            value: String(d),
            label: `${d} days / week`,
            description: d <= 3 ? 'Efficient and sustainable.' : 'Higher frequency for faster progress.',
          }))}
          selected={daysPerWeek ? String(daysPerWeek) : null}
          onSelect={(value) => {
            setDaysPerWeek(Number(value))
            goTo('focus')
          }}
        />
      )}

      {step === 'focus' && (
        <PreferenceStep
          title="Pick a focus"
          subtitle="We'll add extra volume to your priority area."
          options={FOCUS_OPTIONS}
          selected={focus}
          onSelect={(value) => {
            setFocus(value)
            goTo('equipment')
          }}
        />
      )}

      {step === 'equipment' && (
        <div className="flex flex-col gap-6">
          <PreferenceStep
            title="Available equipment"
            subtitle="We'll only suggest exercises you can actually do."
            options={EQUIPMENT_OPTIONS}
            selected={equipment}
            onSelect={(value) => setEquipment(value)}
          />
          <Button
            fullWidth
            size="xl"
            disabled={!equipment}
            onClick={handleGenerateAndPreview}
            icon={<Dumbbell size={22} />}
          >
            Generate My Routine
          </Button>
        </div>
      )}

      {step === 'preview' && routine && equipment && (
        <RoutinePreview
          routine={routine}
          equipment={equipment}
          onSwapExercise={handleSwap}
          onApprove={() => onComplete(routine)}
          onBack={() => goTo('equipment')}
        />
      )}
    </div>
  )
}
