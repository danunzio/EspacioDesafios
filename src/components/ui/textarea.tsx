import { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({
  label,
  error,
  className = '',
  rows = 4,
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={props.id || props.name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={cn(
          'w-full px-4 py-2',
          'rounded-xl border-2',
          'border-gray-300',
          'focus:border-[#A38EC3] focus:ring-0 focus:outline-none',
          'placeholder:text-gray-400',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          'transition-colors duration-200',
          'resize-y min-h-[100px]',
          error ? 'border-red-500 focus:border-red-500' : '',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
