'use client'
import { useState }      from 'react'
import Image             from 'next/image'
import { useKioskStore } from '../store/kioskStore'

export default function CatalogScreen() {
  const {
    catalog, catalogError,
    cart, addToCart, updateQuantity,
    cartTotal, cartItemCount, goTo,
  } = useKioskStore()
  const [search, setSearch] = useState('')

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

  if (catalogError) {
    return (
      <div className="catalog-error-screen">
        <div className="error-icon">⚠️</div>
        <p className="catalog-error-msg">{catalogError}</p>
        <button className="btn-home" onClick={() => goTo('idle')}>← Back to Start</button>
      </div>
    )
  }

  if (catalog.length === 0) {
    return (
      <div className="catalog-loading-screen">
        <div className="spinner" />
        <p>Loading products...</p>
      </div>
    )
  }

  return (
    <div className="catalog-screen">
      {/* Header */}
      <header className="catalog-header">
        <button className="btn-back" onClick={() => goTo('idle')}>← Back</button>
        <div className="catalog-header-logo">
          <span className="boot-logo-m">M9</span><span className="boot-logo-v">Vends</span>
        </div>
        <button
          className="cart-badge-btn"
          onClick={() => cartItemCount() > 0 && goTo('cart')}
        >
          🛒 <span className="cart-count">{cartItemCount()}</span>
        </button>
      </header>

      {/* Search */}
      <div className="search-wrapper">
        <input
          className="catalog-search"
          placeholder="🔍  Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="product-grid">
        {filtered.length === 0 ? (
          <div className="catalog-empty">No products found</div>
        ) : (
          filtered.map(item => {
            const qty = getQty(item.catalog_id)
            const oos = item.stock === 0
            return (
              <div key={item.catalog_id} className={`product-card${oos ? ' out-of-stock' : ''}`}>
                {/* Image */}
                <div className="product-image-wrapper">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      className="product-img"
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  ) : (
                    <div className="product-img-placeholder">🥤</div>
                  )}
                  {item.slot_label && (
                    <span className="slot-chip">{item.slot_label}</span>
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
                      {oos
                        ? 'Out of stock'
                        : item.stock <= 5
                          ? `Only ${item.stock} left`
                          : 'In stock'}
                    </div>
                  </div>
                </div>

                {/* Cart control */}
                {oos ? (
                  <div className="oos-label">Unavailable</div>
                ) : qty === 0 ? (
                  <button className="btn-add" onClick={() => handleAdd(item)}>Add</button>
                ) : (
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item.catalog_id, qty - 1)}>−</button>
                    <span>{qty}</span>
                    <button
                      onClick={() => updateQuantity(item.catalog_id, qty + 1)}
                      disabled={qty >= item.stock}
                    >+</button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Sticky cart bar */}
      {cartItemCount() > 0 && (
        <div className="cart-bar">
          <div className="cart-bar-info">
            <span className="cart-bar-count">{cartItemCount()} {cartItemCount() === 1 ? 'item' : 'items'}</span>
            <span className="cart-bar-total">₹{cartTotal()}</span>
          </div>
          <button className="btn-checkout" onClick={() => goTo('cart')}>
            Checkout →
          </button>
        </div>
      )}
    </div>
  )
}
