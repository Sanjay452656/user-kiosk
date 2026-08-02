'use client'
import { create } from 'zustand'

export const useKioskStore = create((set, get) => ({
  // ─── Screen navigation
  currentScreen: 'boot',
  // Values: boot | provision | idle | catalog | cart | upi | cash | success | failed | error

  // ─── Device Identity (from IoT backend after boot)
  serialNumber:    process.env.NEXT_PUBLIC_SERIAL_NUMBER ?? 'SN-M9V-4820',
  deviceVID:       null,   // from wake-up response = machine_id for REST API
  isProvisioned:   false,
  kioskBrowserURL: null,
  mqttConfig:      null,   // { url, port, username, password }

  // ─── Catalog
  catalog:       [],
  catalogError:  null,
  catalogLoaded: false,   // true after fetch completes (even if empty)

  // ─── Cart  [{ catalog_id, product_name, price, quantity, stock, image_url }]
  cart: [],

  // ─── Active Order
  currentOrder:  null,
  // UPI:  { order_id, razorpay_order_id, total_amount, payment_link, payment_method }
  // CASH: { order_id, total_amount, payment_method }
  paymentStatus: null,   // 'PENDING' | 'PAID' | 'FAILED'
  orderStatus:   null,   // 'PLACED' | 'DISPENSING' | 'COMPLETED' | 'CANCELLED'

  // ─── Actions
  goTo: (screen) => set({ currentScreen: screen }),

  setDeviceInfo: (info) => set({
    deviceVID:       info.deviceVID,
    isProvisioned:   info.isProvisioned,
    kioskBrowserURL: info.kioskBrowserURL ?? null,
    mqttConfig:      info.mqtt ?? null,
  }),

  addToCart: (item) => set((state) => {
    const existing = state.cart.find(c => c.catalog_id === item.catalog_id)
    if (existing) {
      return {
        cart: state.cart.map(c =>
          c.catalog_id === item.catalog_id
            ? { ...c, quantity: Math.min(c.quantity + 1, c.stock) }
            : c
        ),
      }
    }
    return { cart: [...state.cart, { ...item, quantity: 1 }] }
  }),

  updateQuantity: (catalog_id, qty) => set((state) => ({
    cart: qty <= 0
      ? state.cart.filter(c => c.catalog_id !== catalog_id)
      : state.cart.map(c =>
          c.catalog_id === catalog_id ? { ...c, quantity: Math.min(qty, c.stock) } : c
        ),
  })),

  setCatalog:      (catalog) => set({ catalog, catalogError: null, catalogLoaded: true }),
  setCatalogError: (err)     => set({ catalogError: err, catalogLoaded: true }),

  setOrder: (order) => set({
    currentOrder:  order,
    paymentStatus: 'PENDING',
    orderStatus:   'PLACED',
  }),

  updatePaymentStatus: (payment_status, order_status) =>
    set({ paymentStatus: payment_status, orderStatus: order_status }),

  resetSession: () => set({
    cart: [], currentOrder: null, paymentStatus: null, orderStatus: null,
    catalog: [], catalogLoaded: false, catalogError: null,
  }),

  resetToIdle: () => set({
    cart: [], currentOrder: null, paymentStatus: null, orderStatus: null,
    catalog: [], catalogError: null, catalogLoaded: false, currentScreen: 'idle',
  }),

  // Computed helpers (called as functions)
  cartTotal:     () => get().cart.reduce((s, i) => s + i.price * i.quantity, 0),
  cartItemCount: () => get().cart.reduce((s, i) => s + i.quantity, 0),
}))
