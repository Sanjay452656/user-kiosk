'use client'
import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG }                   from 'qrcode.react'
import { useKioskStore }               from '../store/kioskStore'
import { getOrderStatus, cancelOrder } from '../api/order.api'

const UPI_TIMEOUT_S =
  Math.floor(parseInt(process.env.NEXT_PUBLIC_UPI_TIMEOUT_MS ?? '180000', 10) / 1000)
const POLL_MS =
  parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL_MS ?? '3000', 10)

// Brand Icons for UPI Apps
function GPayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  )
}

function PhonePeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="#5F259F"/>
      <path d="M21 10H14v12h3v-4h4c2.2 0 4-1.8 4-4s-1.8-4-4-4zm0 5h-4v-2h4c.6 0 1 .4 1 1s-.4 1-1 1z" fill="#FFFFFF"/>
      <path d="M11 10h2v12h-2z" fill="#FFFFFF"/>
    </svg>
  )
}

function PaytmIcon() {
  return (
    <svg width="34" height="20" viewBox="0 0 54 32" fill="none">
      <path d="M13.5 6H7v20h6.5V17H17c3.5 0 6.5-2.5 6.5-5.5S20.5 6 17 6h-3.5zm3.5 6H13.5v-3.5H17c1.4 0 2.5 1 2.5 2s-1.1 1.5-2.5 1.5z" fill="#002E6E"/>
      <path d="M25 12h5v14h-5z" fill="#002E6E"/>
      <path d="M37 6h6v4h-6v4h5v4h-5v8h-5V6h5z" fill="#00BAF2"/>
      <path d="M44 12h5v14h-5z" fill="#00BAF2"/>
    </svg>
  )
}

function BhimIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="#008338"/>
      <path d="M8 7l11 8.5L8 24V7z" fill="#F37023"/>
      <path d="M14 11.5l11 8.5-11 8.5v-17z" fill="#FFFFFF"/>
    </svg>
  )
}

export default function UpiPaymentScreen() {
  const { currentOrder, updatePaymentStatus, goTo } = useKioskStore()
  const [secondsLeft, setSecondsLeft] = useState(UPI_TIMEOUT_S)
  const pollRef  = useRef(null)
  const timerRef = useRef(null)

  const stopAll = () => {
    clearInterval(pollRef.current)
    clearInterval(timerRef.current)
  }

  const handleCancel = async () => {
    stopAll()
    try { await cancelOrder(currentOrder.order_id) } catch { /* best-effort */ }
    updatePaymentStatus('FAILED', 'CANCELLED')
    goTo('failed')
  }

  useEffect(() => {
    if (!currentOrder?.order_id) { goTo('cart'); return }

    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { handleCancel(); return 0 }
        return s - 1
      })
    }, 1000)

    pollRef.current = setInterval(async () => {
      try {
        const data = await getOrderStatus(currentOrder.order_id)
        updatePaymentStatus(data.payment_status, data.order_status)
        if (data.payment_status === 'PAID')   { stopAll(); goTo('success') }
        if (data.payment_status === 'FAILED') { stopAll(); goTo('failed')  }
      } catch { /* network hiccup — keep polling */ }
    }, POLL_MS)

    return stopAll
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const isUrgent = secondsLeft < 30

  return (
    <div className="upi-screen">
      {/* Top bar */}
      <div className="payment-header">
        <button className="btn-cancel" onClick={handleCancel}>
          <span className="material-symbols-outlined">close</span>
          Cancel
        </button>
        <div className={`countdown${isUrgent ? ' urgent' : ''}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>timer</span>
          {mm}:{ss}
        </div>
      </div>

      {/* Body — two-column layout */}
      <div className="upi-body">
        {/* Left: QR Code */}
        <div className="upi-left">
          <div style={{ textAlign: 'center' }}>
            <h1 className="upi-title">Scan to Pay</h1>
            <p className="upi-subtitle">Open your preferred UPI app</p>
          </div>

          <div className="qr-container">
            <div className="qr-outer-glow" />
            <div className="qr-wrapper-inner">
              <QRCodeSVG
                value={currentOrder?.payment_link ?? 'https://m9vends.com'}
                size={280}
                style={{ width: '100%', height: 'auto', maxWidth: 280, maxHeight: 280 }}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
              />
              <div className="qr-glow" />
            </div>
          </div>

          {/* Waiting pill */}
          <div className="upi-waiting-pill">
            <div className="upi-waiting-dots">
              <div className="upi-waiting-dot" />
              <div className="upi-waiting-dot" />
              <div className="upi-waiting-dot" />
            </div>
            <span className="upi-waiting-text">Waiting for payment...</span>
          </div>
        </div>

        {/* Right: Amount + App hints */}
        <div className="upi-right">
          {/* Amount card */}
          <div className="upi-amount-card">
            <p className="upi-amount-label">Total Amount</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="upi-amount-sym">₹</span>
              <h2 className="upi-amount">{currentOrder?.total_amount}</h2>
            </div>
            <div className="upi-amount-footer">
              <p className="upi-machine-name">M9Vends Kiosk</p>
              <p className="upi-machine-sub">Digital Refreshment Hub</p>
            </div>
          </div>

          {/* UPI App hints */}
          <div className="upi-apps-section">
            <p className="upi-apps-label">Accepted via any UPI App</p>
            <div className="upi-apps-grid">
              <div className="upi-app-tile" title="Google Pay">
                <GPayIcon />
                <span className="upi-app-name">GPay</span>
              </div>
              <div className="upi-app-tile" title="PhonePe">
                <PhonePeIcon />
                <span className="upi-app-name">PhonePe</span>
              </div>
              <div className="upi-app-tile" title="Paytm">
                <PaytmIcon />
                <span className="upi-app-name">Paytm</span>
              </div>
              <div className="upi-app-tile" title="BHIM">
                <BhimIcon />
                <span className="upi-app-name">BHIM</span>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="upi-security-note">
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', flexShrink: 0 }}>verified_user</span>
            <p>Secure transaction powered by UPI. Do not share your PIN.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
