'use client'

import { useState, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionSectionProps {
  title: string
  icon?: ReactNode
  defaultOpen?: boolean
  completed?: boolean
  required?: boolean
  children: ReactNode
  className?: string
}

export function AccordionSection({
  title,
  icon,
  defaultOpen = true,
  completed = false,
  required = false,
  children,
  className,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn('border border-gray-200 rounded-xl overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
          isOpen ? 'bg-[#A38EC3]/5' : 'bg-white hover:bg-gray-50'
        )}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs',
              completed ? 'bg-[#A8E6CF] text-green-700' : 'bg-[#A38EC3]/20 text-[#A38EC3]'
            )}>
              {completed ? '✓' : icon}
            </span>
          )}
          <span className={cn(
            'font-medium text-sm',
            completed ? 'text-[#2D2A32]' : 'text-[#6B6570]'
          )}>
            {title}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={cn(
            'text-[#6B6570] transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  )
}
