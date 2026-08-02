'use client'
import { useEffect, useRef } from 'react'
import { useKioskStore }     from '../store/kioskStore'

// These screens manage their own timeouts — don't interfere
const EXCLUDED = ['boot', 'provision', 'success', 'failed', 'error']

const IDLE_MS =
  parseInt(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS ?? '120000', 10)

export function useIdleTimeout() {
  const currentScreen = useKioskStore(s => s.currentScreen)
  const resetToIdle   = useKioskStore(s => s.resetToIdle)
  const timerRef = useRef(null)

  const resetTimer = () => {
    clearTimeout(timerRef.current)
    if (EXCLUDED.includes(currentScreen)) return
    timerRef.current = setTimeout(resetToIdle, IDLE_MS)
  }

  useEffect(() => {
    window.addEventListener('touchstart', resetTimer)
    window.addEventListener('click',      resetTimer)
    resetTimer()
    return () => {
      window.removeEventListener('touchstart', resetTimer)
      window.removeEventListener('click',      resetTimer)
      clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreen])
}
