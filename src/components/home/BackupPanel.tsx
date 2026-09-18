import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { exportDataToFile, parseImportedData } from '../../lib/storage'
import type { AppData } from '../../types'
import { Button } from '../shared/Button'

interface BackupPanelProps {
  data: AppData
  onImport: (data: AppData) => void
}

export function BackupPanel({ data, onImport }: BackupPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [importedAt, setImportedAt] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = parseImportedData(String(reader.result))
        onImport(imported)
        setImportedAt(new Date().toLocaleTimeString())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import backup file.')
      }
    }
    reader.onerror = () => setError('Could not read that file.')
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="rounded-3xl border border-border bg-surface-card p-5">
      <h3 className="text-base font-bold text-white">Data Backup</h3>
      <p className="mt-1 text-sm text-white/50">
        Your data lives only on this device. Export a backup regularly so you never lose your history.
      </p>
      <div className="mt-4 flex gap-3">
        <Button variant="secondary" size="md" className="flex-1" icon={<Download size={18} />} onClick={() => exportDataToFile(data)}>
          Export
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          icon={<Upload size={18} />}
          onClick={() => fileInputRef.current?.click()}
        >
          Import
        </Button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {importedAt && !error && <p className="mt-3 text-sm text-accent">Backup imported at {importedAt}.</p>}
    </div>
  )
}
