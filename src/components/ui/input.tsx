import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={props.id || props.name}
          className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        className={`
          w-full px-3 sm:px-4 py-2 sm:py-2.5
          rounded-xl border-2
          border-gray-300
          text-sm sm:text-base
          focus:border-[#A38EC3] focus:ring-0 focus:outline-none
          placeholder:text-gray-400
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-colors duration-200
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
