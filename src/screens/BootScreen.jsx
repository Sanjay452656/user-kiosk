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
          retryTimeout = setTimeout(boot, 5000) // retry every 5s
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
      <div className="boot-logo-text">
        <span className="boot-logo-m">M9</span>
        <span className="boot-logo-v">Vends</span>
      </div>
      <div className="spinner" />
      <p className="boot-text">Connecting to machine...</p>
    </div>
  )
}
