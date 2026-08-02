'use client'
import { useState }      from 'react'
import { useKioskStore } from '../store/kioskStore'
import { placeOrder }    from '../api/order.api'

export default function CartScreen() {
  const {
    cart, cartTotal, deviceVID,
    updateQuantity, setOrder, goTo,
  } = useKioskStore()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // Safety — redirect back if cart is empty
  if (cart.length === 0) {
    goTo('catalog')
    return null
  }

  const handlePlaceOrder = async (payment_method) => {
    setLoading(true)
    setError(null)
    try {
      const res = await placeOrder({
        machine_id:     deviceVID,
        items:          cart.map(c => ({ catalog_id: c.catalog_id, quantity: c.quantity })),
        payment_method,
      })
      setOrder(res.data)
      goTo(payment_method === 'UPI' ? 'upi' : 'cash')
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Order failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cart-screen">
      <header className="cart-header">
        <button className="btn-back" onClick={() => goTo('catalog')}>← Back</button>
        <h2 className="cart-header-title">Review Order</h2>
        <div className="cart-header-spacer" />
      </header>

      <div className="cart-items">
        {cart.map(item => (
          <div key={item.catalog_id} className="cart-item">
            <div className="cart-item-left">
              <div className="cart-item-img-placeholder">🥤</div>
              <div className="cart-item-info">
                <span className="cart-item-name">{item.product_name}</span>
                <span className="cart-item-unit">₹{item.price} each</span>
              </div>
            </div>
            <div className="cart-item-right">
              <div className="qty-control">
                <button onClick={() => updateQuantity(item.catalog_id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.catalog_id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                >+</button>
              </div>
              <span className="cart-item-subtotal">₹{item.price * item.quantity}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-total-row">
        <span className="cart-total-label">Total</span>
        <strong className="cart-total-value">₹{cartTotal()}</strong>
      </div>

      {error && <div className="cart-error">{error}</div>}

      <div className="payment-buttons">
        <button
          id="btn-pay-upi"
          className="btn-pay-upi"
          onClick={() => handlePlaceOrder('UPI')}
          disabled={loading}
        >
          {loading ? (
            <span className="btn-loading"><span className="spinner-sm" /> Processing...</span>
          ) : (
            <>⚡ Pay ₹{cartTotal()} with UPI</>
          )}
        </button>
        <button
          id="btn-pay-cash"
          className="btn-pay-cash"
          onClick={() => handlePlaceOrder('CASH')}
          disabled={loading}
        >
          💵 Pay with Cash
        </button>
      </div>
    </div>
  )
}
