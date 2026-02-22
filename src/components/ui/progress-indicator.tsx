'use client'

import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  steps: { id: string; label: string; completed: boolean }[]
  currentStep?: string
  className?: string
}

export function ProgressIndicator({ steps, currentStep, className }: ProgressIndicatorProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)
  
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex items-center gap-1.5 flex-1">
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                step.completed
                  ? 'bg-[#A8E6CF] text-green-700'
                  : index === currentIndex
                    ? 'bg-[#A38EC3] text-white'
                    : 'bg-gray-200 text-gray-500'
              )}
            >
              {step.completed ? '✓' : index + 1}
            </div>
            <span
              className={cn(
                'text-xs font-medium hidden sm:block truncate',
                step.completed
                  ? 'text-green-600'
                  : index === currentIndex
                    ? 'text-[#A38EC3]'
                    : 'text-gray-400'
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-2 rounded-full transition-colors',
                step.completed ? 'bg-[#A8E6CF]' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
