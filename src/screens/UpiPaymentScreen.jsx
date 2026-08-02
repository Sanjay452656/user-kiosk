'use client'
import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG }                   from 'qrcode.react'
import { useKioskStore }               from '../store/kioskStore'
import { getOrderStatus, cancelOrder } from '../api/order.api'

const UPI_TIMEOUT_S =
  Math.floor(parseInt(process.env.NEXT_PUBLIC_UPI_TIMEOUT_MS ?? '180000', 10) / 1000)
const POLL_MS =
  parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL_MS ?? '3000', 10)

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

    // Countdown timer
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { handleCancel(); return 0 }
        return s - 1
      })
    }, 1000)

    // Payment status polling
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
        <button className="btn-cancel" onClick={handleCancel}>✕ Cancel</button>
        <div className={`countdown${isUrgent ? ' urgent' : ''}`}>{mm}:{ss} ⏱</div>
      </div>

      {/* Body */}
      <div className="upi-body">
        <h2 className="upi-title">Scan to Pay</h2>

        <div className="qr-container">
          <QRCodeSVG
            value={currentOrder?.payment_link ?? 'https://m9vends.com'}
            size={260}
            level="M"
            bgColor="#ffffff"
            fgColor="#050a14"
          />
          <div className="qr-glow" />
        </div>

        <div className="upi-amount">₹{currentOrder?.total_amount}</div>

        <p className="upi-hint">GPay · PhonePe · Paytm · Any UPI app</p>

        <div className="waiting-indicator">
          <span className="pulse-dot" />
          <span className="waiting-text">Waiting for payment...</span>
        </div>
      </div>
    </div>
  )
}
