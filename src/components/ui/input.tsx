import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, name, ...props }, ref) => {
    const inputId = id || name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#2D2A32] mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A94A0] pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name}
            className={cn(
              'w-full px-4 py-3 rounded-xl',
              'border-2 border-[#E8E5F0]',
              'text-sm sm:text-base text-[#2D2A32]',
              'placeholder:text-[#9A94A0]',
              'bg-white',
              'transition-all duration-200',
              'focus:outline-none focus:border-[#A38EC3] focus:ring-2 focus:ring-[#A38EC3]/20',
              'hover:border-[#B8A5D3]',
              'disabled:bg-[#FAFAFF] disabled:text-[#9A94A0] disabled:cursor-not-allowed disabled:border-[#E8E5F0]',
              'min-h-[44px]',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A94A0]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-[#9A94A0]">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
