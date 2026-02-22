'use client'

import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, LogOut, X } from 'lucide-react'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: 'trash' | 'logout' | 'warning' | 'none'
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context.confirm
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts)
      setResolveRef(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    resolveRef?.(true)
    setOptions(null)
    setResolveRef(null)
  }, [resolveRef])

  const handleCancel = useCallback(() => {
    resolveRef?.(false)
    setOptions(null)
    setResolveRef(null)
  }, [resolveRef])

  const getIcon = () => {
    if (options?.icon === 'none') return null
    switch (options?.icon) {
      case 'trash':
        return <Trash2 size={32} className="text-[#E8A5A5]" />
      case 'logout':
        return <LogOut size={32} className="text-[#D4B850]" />
      case 'warning':
      default:
        return <AlertTriangle size={32} className="text-[#F4C2C2]" />
    }
  }

  const getVariantStyles = () => {
    switch (options?.variant) {
      case 'danger':
        return {
          iconBg: 'bg-[#F4C2C2]/30',
          confirmBtn: 'bg-[#E8A5A5] hover:bg-[#D48B8B] text-white',
        }
      case 'warning':
        return {
          iconBg: 'bg-[#D4B850]/30',
          confirmBtn: 'bg-[#D4B850] hover:bg-[#B8A040] text-white',
        }
      default:
        return {
          iconBg: 'bg-[#A38EC3]/20',
          confirmBtn: 'bg-[#A38EC3] hover:bg-[#8B7BB3] text-white',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {options && (
        <Modal
          isOpen={!!options}
          onClose={handleCancel}
          maxWidth="sm"
        >
          <div className="flex flex-col items-center text-center py-4">
            <div className={`w-16 h-16 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
              {getIcon()}
            </div>

            <h3 className="text-lg font-semibold text-[#2D2A32] mb-2">
              {options.title}
            </h3>

            <p className="text-sm text-[#6B6570] mb-6 px-4">
              {options.message}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full px-4">
              <Button
                variant="outline"
                className="flex-1 border-[#A38EC3]/30 text-[#A38EC3] hover:bg-[#A38EC3]/10"
                onClick={handleCancel}
              >
                {options.cancelText || 'Cancelar'}
              </Button>
              <Button
                className={`flex-1 ${styles.confirmBtn}`}
                onClick={handleConfirm}
              >
                {options.confirmText || 'Confirmar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}
