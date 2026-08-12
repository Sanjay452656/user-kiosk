'use client'
import { useEffect } from 'react'
import { useKioskStore } from '../store/kioskStore'

export default function ErrorScreen() {
  const { goTo } = useKioskStore()

  useEffect(() => {
    // Auto re-attempt boot after 10 seconds
    const t = setTimeout(() => goTo('boot'), 10000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="error-screen">
      {/* Error icon */}
      <div className="error-icon">
        <span className="material-symbols-outlined"
          style={{ fontSize: 64, color: 'var(--error)', fontVariationSettings: "'FILL' 1" }}>
          wifi_off
        </span>
      </div>

      <h1 className="error-title">Connection Error</h1>

      <p className="error-subtitle">
        The terminal is currently offline and unable to connect to the M9Vends network.
        Please wait while we attempt to restore the connection.
      </p>

      {/* Retry chip */}
      <div className="error-retry-chip">
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>sync</span>
        <span>Retrying connection...</span>
      </div>

      {/* Subtle spinner */}
      <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', color: 'var(--surface-container-highest)' }} viewBox="25 25 50 50">
          <circle cx="50" cy="50" fill="none" r="20" stroke="currentColor" strokeWidth="4" />
        </svg>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="25 25 50 50" className="svg-spinner">
          <circle cx="50" cy="50" fill="none" r="20" />
        </svg>
      </div>

      <p className="error-retry">Reattempting in 10 seconds...</p>
    </div>
  )
}
