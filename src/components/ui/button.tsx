import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles = {
  primary: 'bg-[#A38EC3] text-white hover:bg-[#8B73B3] active:bg-[#735BA0]',
  secondary:
    'bg-white border-2 border-[#A38EC3] text-[#A38EC3] hover:bg-[#F5F0FA] active:bg-[#EBE3F5]',
  outline:
    'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        font-medium transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[#A38EC3] focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        rounded-[16px]
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
