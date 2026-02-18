import { SelectHTMLAttributes, ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder = 'Seleccione una opción', className, disabled, id, name, ...props }, ref) => {
    const selectId = id || name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[#2D2A32] mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            className={cn(
              'w-full px-4 py-3 pr-10 rounded-xl',
              'border-2 border-[#E8E5F0]',
              'text-sm sm:text-base text-[#2D2A32]',
              'bg-white',
              'appearance-none cursor-pointer',
              'transition-all duration-200',
              'focus:outline-none focus:border-[#A38EC3] focus:ring-2 focus:ring-[#A38EC3]/20',
              'hover:border-[#B8A5D3]',
              'disabled:bg-[#FAFAFF] disabled:text-[#9A94A0] disabled:cursor-not-allowed disabled:border-[#E8E5F0]',
              'min-h-[44px]',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
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
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9A94A0]">
            <ChevronDown size={18} />
          </div>
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

Select.displayName = 'Select'

interface SelectWithIconProps extends SelectProps {
  icon?: ReactNode
}

export function SelectWithIcon({
  icon,
  className,
  ...props
}: SelectWithIconProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-[34px] pointer-events-none text-[#9A94A0] z-dropdown">
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
