'use client'
import { useEffect }     from 'react'
import { QRCodeSVG }     from 'qrcode.react'
import { iotApi }        from '../api/axios'
import { useKioskStore } from '../store/kioskStore'

const IS_DEV = process.env.NODE_ENV === 'development'

export default function ProvisionScreen() {
  const { serialNumber, setDeviceInfo, goTo } = useKioskStore()

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await iotApi.post('/api/device/wake-up', {
          serialNumber,
          model:  'M9-Vending-Pro',
          status: 'online',
        })
        setDeviceInfo(res.data)
        if (res.data.isProvisioned) {
          clearInterval(poll)
          goTo('idle')
        }
      } catch { /* silent — keep polling */ }
    }, 10000)

    return () => clearInterval(poll)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const skipToIdle = () => {
    setDeviceInfo({
      deviceVID:     '6a67ad9aa95ea9b1fe046186',
      isProvisioned: true,
      kioskBrowserURL: null,
      mqtt: null,
    })
    goTo('idle')
  }

  return (
    <div className="provision-screen">
      {/* Header */}
      <header>
        <div className="provision-header-logo">M9Vends</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            aria-label="Help"
            style={{
              width: 'var(--touch-min)', height: 'var(--touch-min)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-lg)', border: 'none', background: 'transparent',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--on-surface-variant)' }}>help</span>
          </button>
          <button
            aria-label="Info"
            style={{
              width: 'var(--touch-min)', height: 'var(--touch-min)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-lg)', border: 'none', background: 'transparent',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--on-surface-variant)' }}>info</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="provision-main">
        <div className="provision-content">
          {/* Intro */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--stack-md)', textAlign: 'center' }}>
            <div className="provision-badge">Setup Required</div>
            <h1 className="provision-title">Device Not Activated</h1>
            <p className="provision-subtitle">
              Scan this QR code with the M9Vends Admin App to activate this machine
            </p>
          </div>

          {/* Card */}
          <div className="provision-card">
            <div className="provision-card-inner">
              {/* QR Code */}
              <div className="qr-wrapper">
                <QRCodeSVG
                  value={serialNumber}
                  size={224}
                  style={{ width: '100%', height: 'auto', maxWidth: 224, maxHeight: 224 }}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              {/* Serial Number */}
              <div className="serial-area">
                <span className="serial-label-text">Serial Number</span>
                <div className="serial-label">{serialNumber}</div>
              </div>
            </div>

            {/* Status bar */}
            <div className="provision-status-bar">
              <span className="pulse-dot" />
              <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--on-surface-variant)' }}>
                Waiting for activation...
              </span>
            </div>
          </div>

          <p className="provision-footer">Ensure your kiosk is connected to the local network.</p>

          {IS_DEV && (
            <button className="dev-skip-btn" onClick={skipToIdle}>
              ⚡ Skip to Idle (Dev Only)
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
