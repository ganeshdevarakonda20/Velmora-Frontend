import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiShoppingBag, FiArrowRight, FiShield, FiTruck, FiArrowLeft, FiRefreshCw, FiLogIn } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './CartPage.css'

function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeItem, clearCurrentCart } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  if (!isLoggedIn) {
    return (
      <div className="cart-page container">
        <div className="empty-cart-box card">
          <FiShoppingBag className="empty-cart-icon" />
          <h2>Sign In to Access Your Bag</h2>
          <p>Your shopping bag is securely synced with your Velmora account.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <Link to="/login" state={{ from: '/cart' }} className="btn-primary">
              <FiLogIn /> Sign In
            </Link>
            <Link to="/products" className="btn-secondary">
              Explore Collection <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page container">
        <div className="empty-cart-box card">
          <FiShoppingBag className="empty-cart-icon" />
          <h2>Your Shopping Bag is Empty</h2>
          <p>Discover trendsetting collections from Zara, Snitch, Rare Rabbit and more.</p>
          <Link to="/products" className="btn-primary mt-md">
            Explore Collection <FiArrowRight />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page container">
      <div className="cart-header">
        <h1>Your Shopping Bag</h1>
        <p>Review items in your bag before proceeding to secure checkout.</p>
      </div>

      <div className="cart-layout">
        {/* Cart Items List */}
        <div className="cart-items-section card">
          <div className="cart-table-header">
            <span>Product Details</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span>Remove</span>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item) => {
              const product = item.product || item
              const id = item.cartItemId || item.id || item.productId
              const price = product.price || item.price || 0
              const name = product.productName || product.name || 'Casual Style'
              const brand = product.brand || (name.split(' ')[0]) || 'VELMORA'
              const image = product.imageUrl || product.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80'
              const size = item.size || 'M'
              const qty = item.quantity || 1

              return (
                <div key={id} className="cart-item-row">
                  <div className="cart-item-product">
                    <img src={image} alt={name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <span className="cart-item-brand">{brand}</span>
                      <h4>{name}</h4>
                      <p className="cart-item-size">Size: <strong>{size}</strong></p>
                      <p className="cart-item-unit-price">₹{price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="cart-item-qty">
                    <div className="qty-control">
                      <button 
                        type="button" 
                        onClick={() => updateQuantity(item.cartItemId, qty - 1)}
                        className="qty-btn"
                        aria-label="Decrease quantity"
                      >-</button>
                      <span className="qty-value">{qty}</span>
                      <button 
                        type="button" 
                        onClick={() => updateQuantity(item.cartItemId, qty + 1)}
                        className="qty-btn"
                        aria-label="Increase quantity"
                      >+</button>
                    </div>
                  </div>

                  <div className="cart-item-subtotal">
                    ₹{(price * qty).toLocaleString('en-IN')}
                  </div>

                  <div className="cart-item-action">
                    <button 
                      type="button" 
                      className="remove-btn" 
                      onClick={() => removeItem(item.cartItemId)}
                      title="Remove from bag"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="cart-footer-actions">
            <button type="button" className="styled-clear-bag-btn" onClick={clearCurrentCart}>
              <FiTrash2 /> Clear Entire Bag
            </button>
            <Link to="/products" className="continue-shopping-link">
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <aside className="cart-summary-section card">
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-rows">
            <div className="summary-row">
              <span>Bag Total</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="summary-row">
              <span>Estimated Delivery</span>
              <span className="free-shipping-tag">FREE</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row summary-grand-total">
              <span>Total Amount</span>
              <span className="grand-total-val">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button 
            type="button" 
            className="btn-primary checkout-cta-btn"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout <FiArrowRight />
          </button>

          <div className="cart-perks-badge">
            <div className="perk-row">
              <FiTruck className="perk-icon" />
              <span>Free Express Delivery Across India</span>
            </div>
            <div className="perk-row">
              <FiShield className="perk-icon" />
              <span>100% Genuine Branded Merchandise</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CartPage
