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
import { useEffect, useState } from 'react'
import { exerciseImageFrames } from '../../lib/exerciseImages'
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
  imageId?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: { box: 'h-12 w-12', icon: 20 },
  md: { box: 'h-16 w-16', icon: 28 },
  lg: { box: 'h-24 w-24', icon: 40 },
}

const FRAME_INTERVAL_MS = 900

function IconTile({ icon, muscleGroup, size, className }: Required<Pick<ExerciseImageProps, 'icon' | 'muscleGroup'>> & {
  size: 'sm' | 'md' | 'lg'
  className: string
}) {
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

function ExercisePhoto({
  imageId,
  icon,
  muscleGroup,
  size,
  className,
}: Required<Pick<ExerciseImageProps, 'imageId' | 'icon' | 'muscleGroup'>> & {
  size: 'sm' | 'md' | 'lg'
  className: string
}) {
  const dims = SIZE_MAP[size]
  const [frameIndex, setFrameIndex] = useState(0)
  const [failed, setFailed] = useState(false)
  const frames = exerciseImageFrames(imageId)

  useEffect(() => {
    if (frames.length < 2 || failed) return
    const id = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length)
    }, FRAME_INTERVAL_MS)
    return () => clearInterval(id)
  }, [frames.length, failed])

  if (failed) {
    return <IconTile icon={icon} muscleGroup={muscleGroup} size={size} className={className} />
  }

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-surface-raised ${dims.box} ${className}`}
    >
      <img
        src={frames[frameIndex]}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

export function ExerciseImage({ icon, muscleGroup, imageId, size = 'md', className = '' }: ExerciseImageProps) {
  if (!imageId) {
    return <IconTile icon={icon} muscleGroup={muscleGroup} size={size} className={className} />
  }
  return (
    <ExercisePhoto key={imageId} imageId={imageId} icon={icon} muscleGroup={muscleGroup} size={size} className={className} />
  )
}
