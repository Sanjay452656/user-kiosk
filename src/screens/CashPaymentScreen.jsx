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
        <button className="btn-cancel" onClick={handleCancel}>✕ Cancel</button>
        <div className="countdown">{mm}:{ss} ⏱</div>
      </div>

      {/* Body */}
      <div className="cash-body">
        <h2 className="cash-title">Pay with Cash</h2>

        <div className="order-id-box">
          <p className="order-id-label">Show this to the attendant</p>
          <div className="order-id-number">ORDER # {shortId}</div>
        </div>

        <div className="cash-amount">₹{totalAmount}</div>

        <p className="cash-hint">
          Hand ₹{totalAmount} cash to the attendant.<br />
          They will confirm your order on the dashboard.
        </p>

        <div className="waiting-dots">
          <span /><span /><span />
        </div>
        <p className="waiting-sub">Waiting for attendant confirmation...</p>
      </div>
    </div>
  )
}
