'use client'

import { useState, useEffect, useCallback } from 'react'
import { Share, Plus, X, Download } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type DeviceType = 'android' | 'ios' | 'desktop' | 'unknown'

function detectDevice(): DeviceType {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent.toLowerCase()
  const isIOS = /ipad|iphone|ipod/.test(ua)
  const isAndroid = /android/.test(ua)
  
  if (isIOS) return 'ios'
  if (isAndroid) return 'android'
  if (window.innerWidth >= 1024) return 'desktop'
  return 'unknown'
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

interface InstallPromptProps {
  className?: string
}

export function InstallPrompt({ className }: InstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [deviceType, setDeviceType] = useState<DeviceType>('unknown')
  const [isIOSInstructions, setIsIOSInstructions] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const device = detectDevice()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeviceType(device)
    
    if (isStandalone()) return
    
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
    
    if (daysSinceDismissed < 7) return
    
    if (device === 'ios') {
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      
      if (daysSinceDismissed >= 7) {
        setTimeout(() => {
          setShowPrompt(true)
        }, 2000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = useCallback(async () => {
    if (deviceType === 'ios') {
      setIsIOSInstructions(true)
      return
    }
    
    if (!deferredPrompt) return
    
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Install prompt error:', error)
    }
  }, [deferredPrompt, deviceType])

  const handleDismiss = useCallback(() => {
    setShowPrompt(false)
    setIsIOSInstructions(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }, [])

  const handleLater = useCallback(() => {
    setShowPrompt(false)
    setIsIOSInstructions(false)
  }, [])

  if (!showPrompt) return null

  return (
    <div className={cn('fixed inset-0 z-modal flex items-end justify-center', className)}>
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm z-modal-backdrop"
        onClick={handleLater}
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8 z-modal animate-slide-up shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Cerrar"
        >
          <X size={20} className="text-gray-400" />
        </button>

        {!isIOSInstructions ? (
          <>
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl shadow-lg overflow-hidden">
                <img
                  src="/logo.jpg"
                  alt="Espacio Desafíos"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-center text-[#2D2A32] mb-2">
              ¡Instala Espacio Desafíos!
            </h2>
            
            <p className="text-center text-[#6B6570] mb-6 text-sm">
              Accede rápidamente desde tu pantalla de inicio. Funciona sin conexión y recibe notificaciones.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleInstallClick}
                className="w-full"
                size="lg"
                leftIcon={<Download size={20} />}
              >
                {deviceType === 'ios' ? 'Ver instrucciones' : 'Instalar aplicación'}
              </Button>
              
              <Button
                onClick={handleLater}
                variant="ghost"
                className="w-full"
              >
                Ahora no
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-center text-[#2D2A32] mb-4">
              Instalación en iOS
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#A38EC3] text-white flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <p className="text-[#2D2A32] font-medium">Toca el botón Compartir</p>
                  <p className="text-sm text-[#6B6570]">
                    Busca el ícono de compartir en la barra inferior de Safari
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[#A38EC3]">
                    <Share size={24} />
                    <span className="text-sm">Es este ícono</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#A38EC3] text-white flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <p className="text-[#2D2A32] font-medium">Selecciona &quot;Agregar a pantalla de inicio&quot;</p>
                  <p className="text-sm text-[#6B6570]">
                    Desplázate hacia abajo y busca esta opción
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[#A38EC3]">
                    <Plus size={24} />
                    <span className="text-sm">Agregar a pantalla de inicio</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#A38EC3] text-white flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <p className="text-[#2D2A32] font-medium">Toca &quot;Agregar&quot;</p>
                  <p className="text-sm text-[#6B6570]">
                    El ícono aparecerá en tu pantalla de inicio
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDismiss}
              className="w-full"
            >
              ¡Entendido!
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
