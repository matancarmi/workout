import type { AppData } from '../types'

const STORAGE_KEY = 'iron-log:data:v1'
const DATA_VERSION = 1

function emptyData(): AppData {
  return { version: DATA_VERSION, routine: null, sessions: [] }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as AppData
    if (!parsed || typeof parsed !== 'object') return emptyData()
    return {
      version: DATA_VERSION,
      routine: parsed.routine ?? null,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    }
  } catch {
    return emptyData()
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save workout data to local storage', err)
  }
}

export function exportDataToFile(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `iron-log-backup-${stamp}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function parseImportedData(raw: string): AppData {
  const parsed = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('This file does not contain valid backup data.')
  }
  if (!('sessions' in parsed) || !Array.isArray((parsed as AppData).sessions)) {
    throw new Error('This file does not look like an Iron Log backup.')
  }
  return {
    version: DATA_VERSION,
    routine: (parsed as AppData).routine ?? null,
    sessions: (parsed as AppData).sessions ?? [],
  }
}
