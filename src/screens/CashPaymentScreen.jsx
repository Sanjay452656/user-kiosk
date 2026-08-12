'use client'
import { useEffect, useRef, useState } from 'react'
import { useKioskStore }               from '../store/kioskStore'
import { getOrderStatus, cancelOrder } from '../api/order.api'

const CASH_TIMEOUT_S =
  Math.floor(parseInt(process.env.NEXT_PUBLIC_CASH_TIMEOUT_MS ?? '600000', 10) / 1000)
const POLL_MS =
  parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL_MS ?? '3000', 10)

export default function CashPaymentScreen() {
  const { currentOrder, updatePaymentStatus, goTo } = useKioskStore()
  const [secondsLeft, setSecondsLeft] = useState(CASH_TIMEOUT_S)
  const pollRef  = useRef(null)
  const timerRef = useRef(null)

  const orderId     = currentOrder?.order_id ?? ''
  const shortId     = orderId.slice(-8).toUpperCase()
  const totalAmount = currentOrder?.total_amount ?? 0

  const stopAll = () => {
    clearInterval(pollRef.current)
    clearInterval(timerRef.current)
  }

  const handleCancel = async () => {
    stopAll()
    try { await cancelOrder(orderId) } catch { /* best-effort */ }
    updatePaymentStatus('FAILED', 'CANCELLED')
    goTo('failed')
  }

  useEffect(() => {
    if (!orderId) { goTo('cart'); return }

    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { handleCancel(); return 0 }
        return s - 1
      })
    }, 1000)

    pollRef.current = setInterval(async () => {
      try {
        const data = await getOrderStatus(orderId)
        updatePaymentStatus(data.payment_status, data.order_status)
        if (data.payment_status === 'PAID')   { stopAll(); goTo('success') }
        if (data.payment_status === 'FAILED') { stopAll(); goTo('failed')  }
      } catch { /* keep polling */ }
    }, POLL_MS)

    return stopAll
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div className="cash-screen">
      {/* Top bar */}
      <div className="payment-header">
        <button className="btn-cancel" onClick={handleCancel}>
          <span className="material-symbols-outlined">close</span>
          Cancel
        </button>
        <div className="countdown">
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>timer</span>
          {mm}:{ss}
        </div>
      </div>

      {/* Body */}
      <div className="cash-body">
        <div className="cash-content">
          <h1 className="cash-title">Pay with Cash</h1>

          <div className="cash-grid">
            {/* Left: amount + instructions + waiting */}
            <div className="cash-left">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span className="cash-amount-label">Total Amount</span>
                <div className="cash-amount">₹{totalAmount}</div>
              </div>

              <div className="cash-divider" />

              <div className="cash-instruction">
                <span className="material-symbols-outlined cash-instruction-icon">payments</span>
                <p>Please hand the exact cash amount to the nearby store attendant to complete your purchase.</p>
              </div>

              <div className="cash-divider" />

              <div className="cash-waiting-area">
                <div className="waiting-dots">
                  <span /><span /><span />
                </div>
                <span className="cash-waiting-text">Waiting for attendant confirmation...</span>
              </div>
            </div>

            {/* Right: order ID box */}
            <div className="cash-right">
              <div className="cash-right-pattern" />

              <span className="cash-attendant-label">Show this to the attendant</span>

              <div className="order-id-box">
                <p className="order-id-label">Order Number</p>
                <div className="order-id-number">ORDER # {shortId}</div>
              </div>

              <p className="cash-expiry-note">
                Do not close this screen.<br />
                Your order expires in <strong>{mm}:{ss}</strong>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="cash-footer">
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 20 }}>support_agent</span>
            <span className="cash-footer-text">Need help? Ask the store attendant.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
