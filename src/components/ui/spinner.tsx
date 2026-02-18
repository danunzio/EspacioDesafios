import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('spinner text-[#A38EC3]', sizeClasses[size], className)}
    />
  )
}

interface LoadingOverlayProps {
  message?: string
  className?: string
}

export function LoadingOverlay({ message = 'Cargando...', className }: LoadingOverlayProps) {
  return (
    <div className={cn(
      'absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-modal',
      className
    )}>
      <Spinner size="lg" />
      <p className="text-sm text-[#6B6570]">{message}</p>
    </div>
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = 'Cargando...', className }: LoadingStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 gap-3',
      className
    )}>
      <Spinner size="lg" />
      <p className="text-sm text-[#6B6570]">{message}</p>
    </div>
  )
}
