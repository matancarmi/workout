import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_REST_SECONDS = 45

export function useRestTimer() {
  const [duration, setDuration] = useState(DEFAULT_REST_SECONDS)
  const [remaining, setRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const start = useCallback(() => {
    setRemaining(duration)
    setIsRunning(true)
  }, [duration])

  const adjust = useCallback((delta: number) => {
    setDuration((prev) => Math.max(5, prev + delta))
    setRemaining((prev) => (prev > 0 ? Math.max(0, prev + delta) : prev))
  }, [])

  const skip = useCallback(() => {
    setIsRunning(false)
    setRemaining(0)
  }, [])

  return { duration, remaining, isRunning, start, adjust, skip }
}
