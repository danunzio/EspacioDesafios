import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, rows = 4, id, name, ...props }, ref) => {
    const textareaId = id || name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[#2D2A32] mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          rows={rows}
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
            'resize-y min-h-[100px]',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
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

Textarea.displayName = 'Textarea'
