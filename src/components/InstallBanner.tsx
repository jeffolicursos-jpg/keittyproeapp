'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice?: Promise<{ outcome: 'accepted'|'dismissed' }> }

export default function InstallBanner() {
  const [visible, setVisible] = useState(false)
  const bipRef = useRef<BIPEvent | null>(null)

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const ua = navigator.userAgent || ''
      const isMobile = /Android|iPhone|iPad|iPod/i.test(ua)
      const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator as any)?.standalone
      const installed = localStorage.getItem('proeInstalled') === 'true'
      const dismissed = localStorage.getItem('proeDismissed') === 'true'
      if (!isMobile || isStandalone || installed || dismissed) return
      const onBIP = (e: Event) => {
        e.preventDefault()
        bipRef.current = e as BIPEvent
        setVisible(true)
      }
      window.addEventListener('beforeinstallprompt', onBIP as any)
      return () => window.removeEventListener('beforeinstallprompt', onBIP as any)
    } catch {}
  }, [])

  if (!visible) return null

  const install = async () => {
    try {
      const ev = bipRef.current
      if (!ev) return
      await ev.prompt()
      try {
        if (ev.userChoice) {
          const res = await ev.userChoice
          if (res?.outcome === 'accepted') localStorage.setItem('proeInstalled', 'true')
        } else {
          localStorage.setItem('proeInstalled', 'true')
        }
      } catch {}
    } finally {
      setVisible(false)
    }
  }

  const dismiss = () => {
    try { localStorage.setItem('proeDismissed', 'true') } catch {}
    setVisible(false)
  }

  return (
    <div className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-3">
        <div className="mt-2 rounded border bg-primary/20 border-primary/40 text-primary-foreground backdrop-blur px-3 py-2 flex items-center justify-between">
          <div className="text-xs sm:text-sm">📱 Instalar App ProE Grátis? (1x)</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="border-primary text-primary" onClick={install}>Instalar</Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>X</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

