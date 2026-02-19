import { ReactNode, type MouseEventHandler } from 'react'
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
  onClick?: MouseEventHandler<HTMLDivElement>
}

const variantStyles = {
  default: 'bg-white shadow-md sm:shadow-lg',
  soft: 'bg-white shadow-sm sm:shadow-md',
}

export function Card({
  children,
  className = '',
  variant = 'default',
  onClick,
}: CardProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick(e)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick(e as unknown as React.MouseEvent<HTMLDivElement>)
    }
  }

  return (
    <div
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={cn(
        'rounded-2xl sm:rounded-3xl p-4 sm:p-6',
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
    <div className={cn('mb-3 sm:mb-4', className)}>
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
    <div className={cn('mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100', className)}>
      {children}
    </div>
  )
}
