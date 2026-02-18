'use client'

import { ReactNode, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md sm:max-w-sm',
  lg: 'max-w-lg sm:max-w-md',
  xl: 'max-w-xl sm:max-w-lg',
  full: 'max-w-full mx-2',
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleEscape])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in z-modal"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm z-modal-backdrop"
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        className={cn(
          'relative w-full bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-all duration-200 ease-out animate-slide-up sm:animate-scale-in',
          maxWidthClasses[maxWidth],
          'max-h-[85vh] sm:max-h-[90vh] flex flex-col',
          'mx-0 sm:mx-auto'
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
            {title && (
              <h2 className="text-base sm:text-xl font-bold text-[#2D2A32] pr-8 truncate">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'p-2 rounded-xl transition-colors duration-200',
                  'hover:bg-gray-100 active:bg-gray-200',
                  'focus:outline-none focus:ring-2 focus:ring-[#A38EC3]',
                  !title && 'ml-auto'
                )}
                aria-label="Cerrar modal"
              >
                <X size={20} className="text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// Add animation styles
const style = `
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }

  .animate-scale-in {
    animation: scale-in 0.2s ease-out;
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }

  /* Safe area for bottom nav */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
`

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = style
  document.head.appendChild(styleElement)
}
