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
      <div className="success-glow" />

      <div className="success-icon-wrapper">
        <div className="success-icon">✓</div>
      </div>

      <h1 className="success-title">Payment Successful!</h1>
      <p className="success-subtitle">Your order is being prepared 🎉</p>

      <div className="order-summary">
        {cart.map(item => (
          <div key={item.catalog_id} className="summary-item">
            <span>{item.product_name}</span>
            <span>× {item.quantity}</span>
          </div>
        ))}
        <div className="summary-divider" />
        <div className="summary-total">
          <span>Total paid</span>
          <strong>₹{currentOrder?.total_amount}</strong>
        </div>
      </div>

      <p className="thank-you">Thank you for your purchase! 🙏</p>

      <div className="auto-return-bar">
        <div
          className="auto-return-progress"
          style={{ animationDuration: '5s' }}
        />
        <p className="auto-return-text">Returning to start in {countdown}s</p>
      </div>

      <button className="btn-home" onClick={resetToIdle}>↩ Back to Start</button>
    </div>
  )
}
