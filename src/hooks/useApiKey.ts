import { useCallback, useState } from 'react'

const STORAGE_KEY = 'iron-log:anthropic-api-key'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  })

  const setApiKey = useCallback((key: string | null) => {
    setApiKeyState(key)
    try {
      if (key) localStorage.setItem(STORAGE_KEY, key)
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore storage failures (e.g. private browsing)
    }
  }, [])

  return { apiKey, setApiKey }
}
