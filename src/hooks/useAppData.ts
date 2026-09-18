import { useCallback, useEffect, useState } from 'react'
import { loadData, saveData } from '../lib/storage'
import type { AppData, Routine, WorkoutSession } from '../types'

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadData())

  useEffect(() => {
    saveData(data)
  }, [data])

  const setRoutine = useCallback((routine: Routine | null) => {
    setData((prev) => ({ ...prev, routine }))
  }, [])

  const upsertSession = useCallback((session: WorkoutSession) => {
    setData((prev) => {
      const exists = prev.sessions.some((s) => s.id === session.id)
      const sessions = exists
        ? prev.sessions.map((s) => (s.id === session.id ? session : s))
        : [...prev.sessions, session]
      return { ...prev, sessions }
    })
  }, [])

  const replaceAll = useCallback((next: AppData) => {
    setData(next)
  }, [])

  const lastSessionForDay = useCallback(
    (workoutDayId: string): WorkoutSession | null => {
      const matches = data.sessions
        .filter((s) => s.workoutDayId === workoutDayId && s.finishedAt)
        .sort((a, b) => new Date(b.finishedAt!).getTime() - new Date(a.finishedAt!).getTime())
      return matches[0] ?? null
    },
    [data.sessions],
  )

  return { data, setRoutine, upsertSession, replaceAll, lastSessionForDay }
}
