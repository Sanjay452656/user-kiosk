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
      <div className="error-icon">⚠️</div>
      <h1 className="error-title">Connection Error</h1>
      <p className="error-subtitle">Unable to connect to the M9Vends network.</p>
      <p className="error-retry">Retrying automatically...</p>
      <div className="spinner" style={{ marginTop: '24px' }} />
    </div>
  )
}
