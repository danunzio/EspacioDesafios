import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variants = {
  default: 'bg-[#F0EDF5] text-[#6B6570]',
  primary: 'bg-[#A38EC3] text-white',
  success: 'bg-[#A8E6CF] text-green-800',
  warning: 'bg-[#F9E79F] text-yellow-800',
  error: 'bg-[#F4C2C2] text-red-800',
  outline: 'bg-transparent border-2 border-[#A38EC3] text-[#A38EC3]',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'rounded-full font-medium',
        'transition-colors duration-200',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
