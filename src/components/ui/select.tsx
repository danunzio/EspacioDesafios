import { SelectHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export function Select({
  label,
  error,
  options,
  placeholder = 'Seleccione una opción',
  className = '',
  disabled = false,
  ...props
}: SelectProps) {
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
      <select
        className={cn(
          'w-full px-4 py-2',
          'rounded-xl border-2',
          'border-gray-300',
          'focus:border-[#A38EC3] focus:ring-0 focus:outline-none',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          'transition-colors duration-200',
          'appearance-none bg-white',
          error ? 'border-red-500 focus:border-red-500' : '',
          className
        )}
        disabled={disabled}
        {...props}
      >
        <option value="" disabled={props.required}>
          {placeholder}
        </option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

// Custom select with icon support
interface SelectWithIconProps extends SelectProps {
  icon?: ReactNode
}

export function SelectWithIcon({
  icon,
  className = '',
  ...props
}: SelectWithIconProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-[31px] pointer-events-none text-gray-400">
          {icon}
        </div>
      )}
      <Select
        {...props}
        className={cn(icon ? 'pl-10' : '', className)}
      />
    </div>
  )
}
