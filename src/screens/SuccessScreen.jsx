'use client'
import { useEffect, useState } from 'react'
import { useKioskStore }       from '../store/kioskStore'

export default function SuccessScreen() {
  const { currentOrder, cart, resetToIdle } = useKioskStore()
  const [countdown, setCountdown] = useState(5)

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
    <div className="success-screen">
      {/* Confetti */}
      <div className="success-confetti">
        <div className="confetti-piece" />
        <div className="confetti-piece" />
        <div className="confetti-piece" />
        <div className="confetti-piece" />
        <div className="confetti-piece" />
        <div className="confetti-piece" />
        <div className="confetti-piece" />
        <div className="confetti-piece" />
        <div className="confetti-piece" />
        <div className="confetti-piece" />
      </div>

      <div className="success-glow" />

      {/* Card */}
      <div className="success-card">
        {/* Success icon */}
        <div className="success-icon-wrapper">
          <span className="material-symbols-outlined success-icon"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: 48 }}>
            check
          </span>
        </div>

        {/* Heading */}
        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-subtitle">Your order is being prepared. Please collect it below.</p>

        {/* Order summary */}
        <div className="order-summary">
          <p className="order-summary-title">Order Summary</p>

          {cart.map(item => (
            <div key={item.catalog_id} className="summary-item">
              <span>{item.product_name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}

          <div className="summary-divider" />
          <div className="summary-total">
            <span>Total Paid</span>
            <strong>₹{currentOrder?.total_amount}</strong>
          </div>
        </div>

        {/* Thank you */}
        <p className="thank-you">Thank you for your purchase!</p>

        {/* Auto-return */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button className="btn-home" onClick={resetToIdle}>
            <span className="material-symbols-outlined">restart_alt</span>
            BACK TO START
          </button>
          <div className="auto-return-bar">
            <div
              className="auto-return-progress"
              style={{ animationDuration: '5s' }}
            />
          </div>
          <p className="auto-return-text">Auto-returning in {countdown}s...</p>
        </div>
      </div>
    </div>
  )
}
