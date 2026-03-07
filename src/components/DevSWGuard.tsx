'use client'
import { useEffect, useState } from 'react'

export default function DevSWGuard() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    try {
      if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const doUnregister = () =>
          navigator.serviceWorker.getRegistrations?.()
            .then((regs) => Promise.all(regs.map(r => r.unregister())))
            .catch(() => {})
        const isLocalhost = window.location.hostname === 'localhost'
        const isPort3000 = window.location.port === '3000'
        const isNot127 = window.location.hostname !== '127.0.0.1'
        const target = `http://127.0.0.1:3002${window.location.pathname}${window.location.search}`
        // Always try to clean SWs in dev
        doUnregister()
        // If on localhost:3000 and SW seems active, redirect automatically to 127.0.0.1:3002
        if (isLocalhost && isPort3000) {
          const checkAndRedirect = () => {
            if (navigator.serviceWorker.controller) {
              setShow(true)
              try { window.location.assign(target) } catch {}
            } else {
              navigator.serviceWorker.getRegistrations?.().then((regs) => {
                if (regs && regs.length > 0) {
                  setShow(true)
                  try { window.location.assign(target) } catch {}
                }
              }).catch(() => {})
            }
          }
          // Small delay to let unregister settle, then check
          setTimeout(checkAndRedirect, 200);
        } else if (isNot127 && window.location.port === '3002') {
          // On localhost:3002 but still weird cache? force cache-bust reload once
          const key = 'dev_cache_bust_once'
          const done = localStorage.getItem(key) === '1'
          if (!done) {
            localStorage.setItem(key, '1')
            try {
              const url = new URL(window.location.href)
              url.searchParams.set('cb', String(Date.now()))
              window.location.replace(url.toString())
            } catch {}
          }
        }
      }
    } catch {}
  }, [])
  if (!show) return null
  return (
    <div className="w-full text-center text-xs text-amber-300 bg-amber-500/20 py-1">
      Problema de cache detectado. Abra em{' '}
      <a className="underline" href="http://127.0.0.1:3002/" target="_blank" rel="noreferrer">http://127.0.0.1:3002/</a>{' '}
      para recarregar sem cache.
    </div>
  )
}
