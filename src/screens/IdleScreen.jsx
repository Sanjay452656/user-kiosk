'use client'
import { useEffect }     from 'react'
import { useKioskStore } from '../store/kioskStore'
import { getCatalog }    from '../api/catalog.api'

export default function IdleScreen() {
  const { deviceVID, setCatalog, setCatalogError, resetSession, goTo } = useKioskStore()

  useEffect(() => { resetSession() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTouch = async () => {
    goTo('catalog')
    try {
      const data = await getCatalog(deviceVID) // deviceVID === machine_id
      setCatalog(data.catalog)
    } catch {
      setCatalogError('Failed to load products. Please try again.')
    }
  }

  return (
    <div className="idle-screen" onClick={handleTouch} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleTouch()}>
      <div className="idle-bg-animation" />

      <div className="idle-logo">
        <span className="boot-logo-m">M9</span>
        <span className="boot-logo-v">Vends</span>
      </div>

      <div className="idle-tagline">Fresh Flavours, Instant Delivery</div>

      <div className="idle-cta-wrapper">
        <div className="idle-cta-ring" />
        <h1 className="idle-cta">Touch to Start</h1>
      </div>

      <div className="idle-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>
    </div>
  )
}
