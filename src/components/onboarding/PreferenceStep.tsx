import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

interface Option<T extends string> {
  value: T
  label: string
  description: string
}

interface PreferenceStepProps<T extends string> {
  title: string
  subtitle?: string
  options: Option<T>[]
  selected: T | null
  onSelect: (value: T) => void
  footer?: ReactNode
}

export function PreferenceStep<T extends string>({
  title,
  subtitle,
  options,
  selected,
  onSelect,
}: PreferenceStepProps<T>) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
      </div>
      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const isSelected = selected === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface-card active:bg-white/5'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-white">{opt.label}</p>
                <p className="mt-0.5 text-sm text-white/50">{opt.description}</p>
              </div>
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected ? 'border-primary bg-primary' : 'border-white/20'
                }`}
              >
                {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
