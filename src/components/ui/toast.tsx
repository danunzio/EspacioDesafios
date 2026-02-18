'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const styles = {
    success: 'bg-[#A8E6CF] text-green-800 border-green-200',
    error: 'bg-[#F4C2C2] text-red-800 border-red-200',
    warning: 'bg-[#F9E79F] text-yellow-800 border-yellow-200',
    info: 'bg-[#E8E5F0] text-[#2D2A32] border-[#D4CCE0]',
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-toast pointer-events-none">
        <div className="flex flex-col gap-2">
          {toasts.map((toast) => {
            const Icon = icons[toast.type]
            return (
              <div
                key={toast.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border-2 shadow-lg',
                  'animate-fade-in pointer-events-auto',
                  styles[toast.type]
                )}
                role="alert"
              >
                <Icon size={20} className="flex-shrink-0" />
                <p className="flex-1 text-sm font-medium">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-black/10 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </ToastContext.Provider>
  )
}
