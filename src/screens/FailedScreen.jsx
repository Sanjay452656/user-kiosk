'use client'
import { useEffect, useState } from 'react'
import { useKioskStore }       from '../store/kioskStore'

export default function FailedScreen() {
  const { orderStatus, resetToIdle, goTo } = useKioskStore()
  const [countdown, setCountdown] = useState(15)
  const isTimeout = orderStatus === 'CANCELLED'

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); resetToIdle(); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="failed-screen">
      {/* Icon */}
      <div className="failed-icon">
        <span className="material-symbols-outlined"
          style={{ fontSize: 64, color: 'var(--error)', fontVariationSettings: "'FILL' 1" }}>
          {isTimeout ? 'timer_off' : 'cancel'}
        </span>
      </div>

      <h1 className="failed-title">
        {isTimeout ? 'Session Timed Out' : 'Payment Failed'}
      </h1>
      <p className="failed-subtitle">
        Please try again or contact staff for assistance.
      </p>

      <div className="failed-actions">
        <button id="btn-retry" className="btn-retry" onClick={() => goTo('cart')}>
          <span className="material-symbols-outlined">refresh</span>
          Try Again
        </button>
        <button className="btn-home" onClick={() => goTo('catalog')}>
          <span className="material-symbols-outlined">restart_alt</span>
          Back to Start
        </button>
      </div>

      <p className="auto-return">Auto-returning in {countdown}s...</p>
    </div>
  )
}
