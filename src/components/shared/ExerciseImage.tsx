import {
  Anchor,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bike,
  Bone,
  Cable,
  ChevronsUp,
  Dumbbell,
  Flame,
  Footprints,
  HandMetal,
  Mountain,
  Move,
  PersonStanding,
  Rows3,
  Shield,
  Weight,
  Zap,
  RotateCw,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import type { MuscleGroup } from '../../types'

const ICONS: Record<string, LucideIcon> = {
  Anchor,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bike,
  Bone,
  Cable,
  ChevronsUp,
  Dumbbell,
  Flame,
  Footprints,
  HandMetal,
  Mountain,
  Move,
  PersonStanding,
  Rows3,
  Shield,
  Weight,
  Zap,
  RotateCw,
  TrendingUp,
}

const GROUP_GRADIENT: Record<MuscleGroup, string> = {
  chest: 'from-orange-500/30 to-rose-500/10',
  back: 'from-sky-500/30 to-indigo-500/10',
  legs: 'from-emerald-500/30 to-teal-500/10',
  glutes: 'from-fuchsia-500/30 to-purple-500/10',
  shoulders: 'from-amber-500/30 to-yellow-500/10',
  biceps: 'from-red-500/30 to-orange-500/10',
  triceps: 'from-violet-500/30 to-blue-500/10',
  core: 'from-lime-500/30 to-green-500/10',
  cardio: 'from-pink-500/30 to-red-500/10',
}

interface ExerciseImageProps {
  icon: string
  muscleGroup: MuscleGroup
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: { box: 'h-12 w-12', icon: 20 },
  md: { box: 'h-16 w-16', icon: 28 },
  lg: { box: 'h-24 w-24', icon: 40 },
}

export function ExerciseImage({ icon, muscleGroup, size = 'md', className = '' }: ExerciseImageProps) {
  const Icon = ICONS[icon] ?? Dumbbell
  const dims = SIZE_MAP[size]
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${GROUP_GRADIENT[muscleGroup]} border border-white/5 ${dims.box} ${className}`}
    >
      <Icon size={dims.icon} strokeWidth={1.75} className="text-white/90" />
    </div>
  )
}
