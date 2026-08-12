# M9Vends Customer Kiosk (`user-kiosk`)

> **AI & LLM Context Note:** This document is comprehensive technical documentation for the `user-kiosk` project, optimized for LLMs (ChatGPT, Gemini, Claude) and human developers. It details the system architecture, state machine, component boundaries, API integrations, and environment configurations.

---

## 📌 Executive Summary

**M9Vends Customer Kiosk** is a touchscreen vending machine application built with **Next.js 16 (App Router)** and **React 19**. It runs as a **Single-Page Application (SPA) State Machine** on public-facing kiosk hardware, handling the complete self-service customer flow:
1. Hardware identity verification and admin activation (provisioning).
2. Ambient attract screen ("Touch to Start").
3. Real-time product catalog browsing with instant search and stock management.
4. Interactive shopping cart review.
5. Dual payment methods: **UPI QR Code** (automated payment gateway) and **Cash** (attendant confirmation).
6. Real-time order status polling, dynamic countdown timers, and automated receipt confirmation.
7. Automated session isolation and idle resetting for security and privacy.

---


## 🛠 Tech Stack & Dependencies

- **Framework:** Next.js 16.2.10 (App Router, React Compiler enabled)
- **UI & View Layer:** React 19.2.4
- **State Management:** Zustand 5.0.14 (`useKioskStore`)
- **Styling System:** Material Design 3 / Tailwind CSS v4 (`globals.css`), Google Material Symbols Outlined icons, glassmorphism, responsive grid layouts, touch-optimized target sizes (min 56px).
- **HTTP Client:** Axios 1.18.1 with Next.js API Rewrites (`next.config.mjs`)
- **IoT & Hardware Integration:** MQTT 5.15.2 WebSocket client, IoT REST backend (`/api/device/*`)
- **QR Code Generator:** `qrcode.react` 4.2.0 (`QRCodeSVG`)
- **Notifications:** `react-hot-toast` 2.6.0

---

## 🏗 Architecture & Screen State Machine

Rather than standard page-based router navigation, the application operates as a **single-page state machine** rendered at `src/app/page.js` through `src/components/KioskApp.jsx`. The active screen is driven reactively by `currentScreen` in the Zustand store (`src/store/kioskStore.js`).

### Navigation State Diagram

```
                              ┌──────────────┐
                              │  Boot Screen │
                              └──────┬───────┘
                                     │ /api/device/wake-up
                      ┌──────────────┴──────────────┐
                      ▼                             ▼
            isProvisioned = false         isProvisioned = true
             ┌─────────────────┐           ┌────────────────┐
             │ Provision Screen│           │   Idle Screen  │◄─────────────────┐
             └────────┬────────┘           └───────┬────────┘                  │
                      │ Admin Activates            │ User Touch                │
                      └────────────────────────────►                           │
                                           ┌───────▼────────┐                  │
                                           │ Catalog Screen │                  │
                                           └───────┬────────┘                  │
                                                   │ Cart Checkout             │
                                           ┌───────▼────────┐                  │
                                                   │   Cart Screen  │          │
                                           └───────┬────────┘                  │
                                                   │ Select Payment            │
                                       ┌───────────┴───────────┐               │
                                       ▼                       ▼               │
                                ┌─────────────┐         ┌─────────────┐        │
                                │ UPI Payment │         │ Cash Payment│        │
                                └──────┬──────┘         └──────┬──────┘        │
                                       │ Status Polling        │ Status Polling│
                                ┌──────┴──────┐         ┌──────┴──────┐        │
                                ▼             ▼         ▼             ▼        │
                           PAID / 5s      FAILED   PAID / 5s      FAILED       │
                         ┌───────────┐  ┌─────────┐┌───────────┐  ┌─────────┐  │
                         │  Success  │  │ Failed  ││  Success  │  │ Failed  │  │
                         └─────┬─────┘  └────┬────┘└─────┬─────┘  └────┬────┘  │
                               │             │           │             │       │
                               └─────────────┴───────────┴─────────────┴───────┘
                                              Auto-reset to Idle
```

---

## 📱 Detailed Screen Reference

All screens reside in `src/screens/`:

1. **`BootScreen.jsx` (`boot`)**:
   - Sends `POST /api/device/wake-up` with `NEXT_PUBLIC_SERIAL_NUMBER`.
   - On success: stores `deviceVID`, `isProvisioned`, `kioskBrowserURL`, `mqttConfig` in Zustand.
   - Routes to `idle` if provisioned, or `provision` if unlinked. Silently retries every 5s on failure.

2. **`ProvisionScreen.jsx` (`provision`)**:
   - Displays device serial number and a large QR code (`QRCodeSVG`) for administrative activation via the M9Vends Admin App.
   - Polls `/api/device/wake-up` every 10 seconds. Auto-advances to `idle` once activated.
   - Includes a development skip button (`⚡ Skip to Idle`).

3. **`IdleScreen.jsx` (`idle`)**:
   - Attract screen with animated background effects and brand taglines ("Fresh Flavours, Instant Delivery").
   - Resets session state on mount (`resetSession()`).
   - Tapping anywhere fetches catalog data (`getCatalog(deviceVID)`) and transitions to `catalog`.

4. **`CatalogScreen.jsx` (`catalog`)**:
   - Header with back button, brand wordmark, and interactive cart badge.
   - Real-time product search filter.
   - 2-column scrollable grid of Product Cards displaying product image/fallback, slot badge, name, price, stock status ("In stock", "Only N left", "Out of stock"), and quantity stepper.
   - Sticky bottom bar showing item count, total price, and "Checkout" button.
   - Handles full-screen loading spinner and API error retry states.

5. **`CartScreen.jsx` (`cart`)**:
   - Order summary with item list, unit prices, quantity steppers, subtotal breakdown, and grand total.
   - Payment triggers: `⚡ Pay with UPI` and `💵 Pay with Cash`.
   - Places order via `placeOrder()` API and transitions to `upi` or `cash`. Redirects back to `catalog` if cart is empty.

6. **`UpiPaymentScreen.jsx` (`upi`)**:
   - Displays dynamic UPI QR Code (`QRCodeSVG` encoding Razorpay/UPI payment link) and accepted payment app hints (Google Pay, PhonePe, Paytm, BHIM).
   - 3-minute countdown timer (`NEXT_PUBLIC_UPI_TIMEOUT_MS`).
   - Polls `getOrderStatus(order_id)` every 3 seconds (`NEXT_PUBLIC_POLL_INTERVAL_MS`).
   - Payment status `PAID` -> `success`; `FAILED` or timeout -> cancels order and moves to `failed`.

7. **`CashPaymentScreen.jsx` (`cash`)**:
   - Displays truncated 8-character monospaced Order ID (`ORDER #XXXXXXXX`) for attendant verification.
   - 10-minute countdown timer (`NEXT_PUBLIC_CASH_TIMEOUT_MS`).
   - Polls `getOrderStatus(order_id)` every 3 seconds for attendant dashboard approval.
   - Payment status `PAID` -> `success`; timeout -> cancels order and moves to `failed`.

8. **`SuccessScreen.jsx` (`success`)**:
   - Celebratory visual feedback (animated checkmark, confetti effect).
   - Purchased item breakdown and total paid summary.
   - 5-second animated countdown progress bar before returning to `idle`.

9. **`FailedScreen.jsx` (`failed`)**:
   - Displays error/timeout icon (`timer_off` or `cancel`) and failure reason.
   - Action buttons: `Try Again` (returns to `cart`) and `Back to Start` (returns to `catalog`).
   - 15-second auto-return timer to `idle`.

10. **`ErrorScreen.jsx` (`error`)**:
    - Fallback boundary screen for missing or invalid screen states.

---

## ⚙️ State Management (`src/store/kioskStore.js`)

Centralized state managed via **Zustand**.

### Store Schema

```javascript
{
  // Navigation State
  currentScreen: 'boot', // boot | provision | idle | catalog | cart | upi | cash | success | failed | error

  // Device Identity
  serialNumber:    process.env.NEXT_PUBLIC_SERIAL_NUMBER ?? 'SN-M9V-4820',
  deviceVID:       null,   // machine_id from wake-up response
  isProvisioned:   false,
  kioskBrowserURL: null,
  mqttConfig:      null,   // { url, port, username, password }

  // Catalog State
  catalog:       [],       // [{ catalog_id, product_name, price, stock, image_url, ... }]
  catalogError:  null,
  catalogLoaded: false,

  // Cart State
  cart: [],                // [{ catalog_id, product_name, price, quantity, stock, image_url }]

  // Active Order State
  currentOrder:  null,     // { order_id, razorpay_order_id, total_amount, payment_link, payment_method }
  paymentStatus: null,     // 'PENDING' | 'PAID' | 'FAILED'
  orderStatus:   null,     // 'PLACED' | 'DISPENSING' | 'COMPLETED' | 'CANCELLED'
}
```

### Key Actions & Computed Helpers

- `goTo(screen)`: Changes active screen.
- `setDeviceInfo(info)`: Updates device VID, provisioning status, and MQTT config.
- `addToCart(item)`: Adds product or increments quantity (bounded by `stock`).
- `updateQuantity(catalog_id, qty)`: Updates quantity or removes item if `qty <= 0`.
- `setCatalog(catalog)` / `setCatalogError(err)`: Updates catalog state.
- `setOrder(order)`: Initializes active order state.
- `updatePaymentStatus(payment_status, order_status)`: Syncs order status from polling API.
- `resetSession()`: Clears cart, active order, and catalog state between sessions.
- `resetToIdle()`: Full reset returning system state to `idle`.
- `cartTotal()`: Computed helper returning sum of `(price * quantity)`.
- `cartItemCount()`: Computed helper returning total quantity of items in cart.

---

## 🌐 API Specifications & Client Rewrites

API requests use dedicated Axios instances (`src/api/axios.js`). In production/development, requests are proxied via Next.js rewrites (`next.config.mjs`) to avoid CORS errors.

### Next.js API Rewrites

- `/api/public/:path*` ➡️ `http://localhost:5000/api/public/:path*` (SaaS Backend)
- `/api/device/:path*` ➡️ `https://m9vends-iot-backend-service.onrender.com/api/device/:path*` (IoT Backend)

### API Endpoint Interfaces

#### 1. Device Wake-Up & Provisioning (`iotApi`)
- **`POST /api/device/wake-up`**
  - **Payload:** `{ serialNumber: string, model: "M9-Vending-Pro", status: "online" }`
  - **Response:** `{ success: boolean, deviceVID: string, isProvisioned: boolean, kioskBrowserURL?: string, mqtt?: object }`

#### 2. Catalog (`saasApi`)
- **`GET /api/public/catalog/:machine_id`**
  - **Response:** `{ success: boolean, machine_id: string, catalog: Array<{ catalog_id: string, product_name: string, price: number, stock: number, image_url: string }> }`

#### 3. Orders (`saasApi`)
- **`POST /api/public/order`**
  - **Payload:** `{ machine_id: string, items: Array<{ catalog_id: string, quantity: number }>, payment_method: "UPI" | "CASH" }`
  - **Response:** `{ success: boolean, data: { order_id: string, total_amount: number, payment_link?: string, payment_method: string } }`

- **`GET /api/public/order/:order_id/status`**
  - **Response:** `{ success: boolean, order_id: string, payment_status: "PENDING" | "PAID" | "FAILED", order_status: "PLACED" | "DISPENSING" | "COMPLETED" | "CANCELLED", total_amount: number }`

- **`POST /api/public/order/:order_id/cancel`**
  - **Payload:** `{}`
  - **Response:** `{ success: boolean, message: string }`

---

## ⌛ Session Inactivity Hook (`src/hooks/useIdleTimeout.js`)

To handle abandoned touchscreen interactions:
- Listens globally for `touchstart` and `click` events.
- Resets user session to `idle` screen after inactivity duration defined by `NEXT_PUBLIC_IDLE_TIMEOUT_MS` (default: 120,000ms / 2 minutes).
- Excludes screens managing active payment/boot operations (`boot`, `provision`, `success`, `failed`, `error`).

---

## 🔑 Environment Variables (`.env`)

```ini
NEXT_PUBLIC_SERIAL_NUMBER=SN-M9V-4820
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_IOT_API_URL=https://m9vends-iot-backend-service.onrender.com
NEXT_PUBLIC_MQTT_BROKER_URL=ws://localhost:8083
NEXT_PUBLIC_UPI_TIMEOUT_MS=180000
NEXT_PUBLIC_CASH_TIMEOUT_MS=600000
NEXT_PUBLIC_IDLE_TIMEOUT_MS=120000
NEXT_PUBLIC_POLL_INTERVAL_MS=3000
```

---

## 📁 Repository Structure

```
user-kiosk/
├── Screen_structure.md       # UX Specification and screen layout rules
├── README.md                 # Complete technical documentation (this file)
├── next.config.mjs           # Next.js configuration and API rewrites
├── package.json              # Project dependencies and scripts
├── .env                      # Environment configuration
└── src/
    ├── api/                  # API client modules
    │   ├── axios.js          # Axios instances for SaaS and IoT backends
    │   ├── catalog.api.js    # Catalog fetching endpoints
    │   └── order.api.js      # Order placement, status polling, cancellation
    ├── app/                  # Next.js App Router root
    │   ├── globals.css       # Design tokens, Material 3 utilities, animations
    │   ├── layout.js         # Root HTML layout and font loading
    │   └── page.js           # Kiosk SPA entry point
    ├── components/
    │   └── KioskApp.jsx      # SPA screen router component
    ├── hooks/
    │   └── useIdleTimeout.js # Inactivity listener hook
    ├── screens/              # Full-screen state components
    │   ├── BootScreen.jsx
    │   ├── ProvisionScreen.jsx
    │   ├── IdleScreen.jsx
    │   ├── CatalogScreen.jsx
    │   ├── CartScreen.jsx
    │   ├── UpiPaymentScreen.jsx
    │   ├── CashPaymentScreen.jsx
    │   ├── SuccessScreen.jsx
    │   ├── FailedScreen.jsx
    │   └── ErrorScreen.jsx
    └── store/
        └── kioskStore.js     # Zustand global store & actions
```

---

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development Server

Run the development server on `http://localhost:3000`:

```bash
npm run dev
```

### Production Build

Build and verify the optimized Next.js app bundle:

```bash
npm run build
npm run start
```

