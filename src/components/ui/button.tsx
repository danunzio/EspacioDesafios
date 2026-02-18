import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantStyles = {
  primary: `
    bg-[#A38EC3] text-white 
    hover:bg-[#8B73B3] 
    active:bg-[#735BA0]
    focus-visible:ring-2 focus-visible:ring-[#A38EC3] focus-visible:ring-offset-2
    disabled:bg-[#C9BDD9]
  `,
  secondary: `
    bg-white border-2 border-[#A38EC3] text-[#A38EC3] 
    hover:bg-[#F5F0FA] hover:border-[#8B73B3]
    active:bg-[#EBE3F5]
    focus-visible:ring-2 focus-visible:ring-[#A38EC3] focus-visible:ring-offset-2
    disabled:border-[#D4CCE0] disabled:text-[#B8A5D3]
  `,
  outline: `
    bg-white border-2 border-gray-300 text-gray-700 
    hover:border-gray-400 hover:bg-gray-50 
    active:bg-gray-100
    focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2
    disabled:border-gray-200 disabled:text-gray-400
  `,
  ghost: `
    bg-transparent text-[#A38EC3]
    hover:bg-[#F5F0FA]
    active:bg-[#EBE3F5]
    focus-visible:ring-2 focus-visible:ring-[#A38EC3] focus-visible:ring-offset-2
    disabled:text-[#C9BDD9]
  `,
  destructive: `
    bg-red-500 text-white
    hover:bg-red-600
    active:bg-red-700
    focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
    disabled:bg-red-300
  `,
}

const sizeStyles = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-sm min-h-[44px]',
  lg: 'px-6 py-3 text-base min-h-[52px]',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'font-medium transition-all duration-200 ease-in-out',
        'focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'whitespace-nowrap',
        'touch-manipulation',
        'rounded-xl sm:rounded-2xl',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" className="text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  )
}
