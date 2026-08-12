'use client'
import { useEffect } from 'react'
import { iotApi }        from '../api/axios'
import { useKioskStore } from '../store/kioskStore'

export default function BootScreen() {
  const { serialNumber, setDeviceInfo, goTo } = useKioskStore()

  useEffect(() => {
    let cancelled = false
    let retryTimeout = null

    const boot = async () => {
      try {
        const res = await iotApi.post('/api/device/wake-up', {
          serialNumber,
          model:  'M9-Vending-Pro',
          status: 'online',
        })
        if (cancelled) return
        setDeviceInfo(res.data)
        goTo(res.data.isProvisioned ? 'idle' : 'provision')
      } catch {
        if (!cancelled) {
          retryTimeout = setTimeout(boot, 5000)
        }
      }
    }

    boot()
    return () => {
      cancelled = true
      clearTimeout(retryTimeout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="boot-screen">
      {/* Precision SVG Spinner */}
      <div className="boot-logo-text">M9Vends</div>

      <div className="relative w-32 h-32 flex items-center justify-center" style={{ position: 'relative', width: 128, height: 128, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Background track */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', color: 'var(--surface-container-highest)' }} viewBox="25 25 50 50">
          <circle cx="50" cy="50" fill="none" r="20" stroke="currentColor" strokeWidth="4" />
        </svg>
        {/* Animated arc */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="25 25 50 50" className="svg-spinner">
          <circle cx="50" cy="50" fill="none" r="20" />
        </svg>
      </div>

      <p className="boot-text">Connecting to machine...</p>
    </div>
  )
}
