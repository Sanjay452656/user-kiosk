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

  // Dev bypass — force provision state with the deviceVID from the last wake-up response
  const skipToIdle = () => {
    setDeviceInfo({
      deviceVID:     '6a67ad9aa95ea9b1fe046186', // from the live wake-up response
      isProvisioned: true,
      kioskBrowserURL: null,
      mqtt: null,
    })
    goTo('idle')
  }

  return (
    <div className="provision-screen">
      <div className="provision-badge">Setup Required</div>
      <h1 className="provision-title">Device Not Activated</h1>
      <p className="provision-subtitle">
        Scan this QR code with the M9Vends Admin App to activate this machine
      </p>

      <div className="qr-wrapper">
        <QRCodeSVG
          value={serialNumber}
          size={240}
          level="M"
          bgColor="#ffffff"
          fgColor="#050a14"
        />
      </div>

      <p className="serial-label">Serial: {serialNumber}</p>

      <div className="waiting-indicator">
        <span className="pulse-dot" />
        <span>Waiting for activation...</span>
      </div>

      {IS_DEV && (
        <button className="dev-skip-btn" onClick={skipToIdle}>
          ⚡ Skip to Idle (Dev Only)
        </button>
      )}
    </div>
  )
}
