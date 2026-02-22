'use client'

import { ReactNode } from 'react'
import { ConfirmProvider } from '@/components/ui/confirm-modal'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfirmProvider>
      {children}
    </ConfirmProvider>
  )
}
