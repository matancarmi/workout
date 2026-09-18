import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  icon?: ReactNode
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-primary text-white active:bg-primary-dark shadow-lg shadow-primary/20',
  secondary: 'bg-surface-card text-white border border-border active:bg-surface-raised',
  ghost: 'bg-transparent text-white/80 active:bg-white/5',
  danger: 'bg-red-600/90 text-white active:bg-red-700',
}

const SIZE_CLASSES: Record<Size, string> = {
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'h-14 px-5 text-base rounded-2xl gap-2.5',
  xl: 'h-16 px-6 text-lg rounded-2xl gap-3',
}

export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  icon,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex select-none items-center justify-center font-semibold transition-transform active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
