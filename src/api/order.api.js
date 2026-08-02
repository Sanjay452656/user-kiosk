import { saasApi } from './axios'

/**
 * Place an order.
 * @param {{ machine_id: string, items: {catalog_id, quantity}[], payment_method?: 'UPI'|'CASH' }} payload
 */
export const placeOrder = async ({ machine_id, items, payment_method = 'UPI' }) => {
  const res = await saasApi.post('/api/public/order', { machine_id, items, payment_method })
  return res.data // { success, data: { order_id, payment_link?, total_amount, items, ... } }
}

/**
 * Poll order payment & fulfilment status.
 * @param {string} order_id
 */
export const getOrderStatus = async (order_id) => {
  const res = await saasApi.get(`/api/public/order/${order_id}/status`)
  return res.data // { success, order_id, payment_status, order_status, total_amount, paid_at }
}

/**
 * Cancel a PENDING order (on timeout or user cancel).
 * @param {string} order_id
 */
export const cancelOrder = async (order_id) => {
  const res = await saasApi.post(`/api/public/order/${order_id}/cancel`)
  return res.data
}
