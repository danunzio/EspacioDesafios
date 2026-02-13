import { ReactNode } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility function to merge Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'soft'
}

const variantStyles = {
  default: 'bg-white shadow-lg',
  soft: 'bg-white shadow-md',
}

export function Card({
  children,
  className = '',
  variant = 'default',
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl p-6',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-100', className)}>
      {children}
    </div>
  )
}
