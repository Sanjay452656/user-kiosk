'use client'
import { useState }      from 'react'
import Image             from 'next/image'
import { useKioskStore } from '../store/kioskStore'

export default function CatalogScreen() {
  const {
    catalog, catalogError,
    cart, addToCart, updateQuantity,
    goTo,
  } = useKioskStore()
  const [search, setSearch] = useState('')

  // Derived directly from reactive `cart` so the badge & total update instantly
  const totalQty   = cart.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  const filtered = catalog.filter(p =>
    p.product_name.toLowerCase().includes(search.toLowerCase())
  )

  const getQty = (id) => cart.find(c => c.catalog_id === id)?.quantity ?? 0

  const handleAdd = (item) => {
    if (item.stock === 0) return
    addToCart({
      catalog_id:   item.catalog_id,
      product_name: item.product_name,
      price:        item.price,
      stock:        item.stock,
      image_url:    item.image_url,
    })
  }

  /* ── Error state ── */
  if (catalogError) {
    return (
      <div className="catalog-error-screen">
        <div className="error-icon-wrapper">
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--error)', fontVariationSettings: "'FILL' 1" }}>
            wifi_off
          </span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--on-surface)' }}>
          Unable to Load
        </h1>
        <p className="catalog-error-msg">{catalogError}</p>
        <button className="btn-home" style={{ maxWidth: 320 }} onClick={() => goTo('idle')}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Start
        </button>
      </div>
    )
  }

  /* ── Loading state ── */
  if (catalog.length === 0) {
    return (
      <div className="catalog-loading-screen">
        <div className="catalog-loading-logo">M9Vends</div>

        <div style={{ position: 'relative', width: 128, height: 128, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', color: 'var(--surface-container-highest)' }} viewBox="25 25 50 50">
            <circle cx="50" cy="50" fill="none" r="20" stroke="currentColor" strokeWidth="4" />
          </svg>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="25 25 50 50" className="svg-spinner">
            <circle cx="50" cy="50" fill="none" r="20" />
          </svg>
        </div>

        <div className="catalog-loading-text">
          <p className="catalog-loading-title">Loading Catalog</p>
          <p className="catalog-loading-sub">Retrieving real-time product availability...</p>
        </div>

        <div className="catalog-loading-bar">
          <div className="catalog-loading-bar-fill" />
        </div>
      </div>
    )
  }

  /* ── Main catalog ── */
  return (
    <div className="catalog-screen">
      {/* Header */}
      <header className="catalog-header">
        <button className="btn-back" onClick={() => goTo('idle')}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>

        <div className="catalog-header-logo">M9Vends</div>

        <button
          className="cart-badge-btn"
          onClick={() => totalQty > 0 && goTo('cart')}
          aria-label="View Cart"
        >
          <span className="material-symbols-outlined cart-icon">shopping_cart</span>
          {totalQty > 0 && (
            <span className="cart-count">{totalQty}</span>
          )}
        </button>
      </header>

      {/* Search */}
      <div className="search-wrapper">
        <div className="search-inner">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            className="catalog-search"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {filtered.length === 0 ? (
          <div className="catalog-empty">No products found</div>
        ) : (
          filtered.map(item => {
            const qty  = getQty(item.catalog_id)
            const oos  = item.stock === 0
            const low  = item.stock > 0 && item.stock <= 5
            const inCart = qty > 0

            return (
              <div
                key={item.catalog_id}
                className={`product-card${oos ? ' out-of-stock' : ''}${inCart ? ' in-cart' : ''}`}
              >
                {/* Image */}
                <div className="product-image-wrapper">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      className="product-img"
                      style={{ objectFit: 'contain' }}
                      unoptimized
                    />
                  ) : (
                    <div className="product-img-placeholder">🥤</div>
                  )}

                  {/* Slot chip */}
                  {item.slot_label && (
                    <span className="slot-chip">{item.slot_label}</span>
                  )}

                  {/* Stock badge */}
                  {oos ? (
                    <div className="stock-badge out-of-stock-badge">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>block</span>
                      Out of stock
                    </div>
                  ) : low ? (
                    <div className="stock-badge low-stock">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
                      Only {item.stock} left
                    </div>
                  ) : (
                    <div className="stock-badge in-stock">
                      <span className="stock-dot" />
                      In stock
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="product-info">
                  <h3 className="product-name">{item.product_name}</h3>
                  {item.description && (
                    <p className="product-desc">{item.description}</p>
                  )}
                  <div className="product-bottom-row">
                    <span className="product-price">₹{item.price}</span>
                    <div className={`stock-indicator ${item.stock > 5 ? 'high' : item.stock > 0 ? 'low' : 'none'}`}>
                      {oos ? 'Out of stock' : item.stock <= 5 ? `Only ${item.stock} left` : 'In stock'}
                    </div>
                  </div>
                </div>

                {/* Cart control */}
                {oos ? (
                  <div className="oos-label">NOT AVAILABLE</div>
                ) : qty === 0 ? (
                  <button className="btn-add" onClick={() => handleAdd(item)}>
                    ADD TO CART
                  </button>
                ) : (
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item.catalog_id, qty - 1)}>
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span>{qty}</span>
                    <button
                      onClick={() => updateQuantity(item.catalog_id, qty + 1)}
                      disabled={qty >= item.stock}
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Sticky cart bar */}
      {totalQty > 0 && (
        <div className="cart-bar">
          <div className="cart-bar-info">
            <span className="cart-bar-count">
              {totalQty} {totalQty === 1 ? 'item' : 'items'} in basket
            </span>
            <span className="cart-bar-total">₹{totalPrice}</span>
          </div>
          <button className="btn-checkout" onClick={() => goTo('cart')}>
            Checkout
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  )
}
