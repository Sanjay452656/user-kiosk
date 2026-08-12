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
      const data = await getCatalog(deviceVID)
      setCatalog(data.catalog)
    } catch {
      setCatalogError('Failed to load products. Please try again.')
    }
  }

  return (
    <div className="idle-screen" onClick={handleTouch} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleTouch()}>

      {/* Animated ambient background */}
      <div className="idle-bg-animation" />

      {/* Particles (logic preserved, hidden in new design) */}
      <div className="idle-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>

      {/* Central card */}
      <div className="idle-card">
        {/* Brand wordmark */}
        <h1 className="idle-logo">M9Vends</h1>

        {/* Tagline */}
        <p className="idle-tagline">Fresh Flavours, Instant Delivery</p>

        {/* CTA */}
        <div className="idle-cta-wrapper">
          {/* ring kept for structure, hidden via CSS */}
          <div className="idle-cta-ring" />
          <button className="idle-cta">
            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>touch_app</span>
            Touch to Start
          </button>
        </div>

        {/* Footer trust marks */}
        <div className="idle-footer">
          <span>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
            Secure
          </span>
          <span>•</span>
          <span>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bolt</span>
            Instant
          </span>
          <span>•</span>
          <span>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>eco</span>
            Fresh
          </span>
        </div>
      </div>
    </div>
  )
}
