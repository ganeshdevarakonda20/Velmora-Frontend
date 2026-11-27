import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiStar, FiShoppingBag, FiCheck } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './ProductCard.css'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isAdded, setIsAdded] = useState(false)

  if (!product) return null

  const id = product.productId || product.id
  const name = product.productName || product.name || 'Slim Fit Textured Casual'
  const brand = product.brand || (name.split(' ')[0]) || 'ZARA'
  const price = Math.round(product.price || 1299)
  
  // Calculate Realistic MRP and Discount percentage
  const mrp = product.actualPrice || product.mrp || Math.round(price * 1.85)
  const discountPercent = Math.round(((mrp - price) / mrp) * 100)
  
  // Dynamic high-res fallback
  const image = product.imageUrl || product.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85'
  const rating = product.rating || (4.0 + (id % 9) * 0.1).toFixed(1)
  const reviewsCount = product.reviewsCount || (120 + (id * 17) % 850)
  const offerTag = product.offerTag || (discountPercent > 50 ? 'SPECIAL OFFER' : 'HOT DROP')
  const description = product.description || '100% Breathable compact weave with modern European tailored cut.'

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Auth Guard: Unauthenticated users are directed to login
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname + location.search } })
      return
    }

    const res = await addToCart(product, 1, 'M')
    if (res?.success) {
      setIsAdded(true)
      setTimeout(() => {
        setIsAdded(false)
      }, 1800)
    }
  }

  return (
    <div className="modern-product-card card">
      <Link to={`/products/${id}`} className="card-media-anchor">
        <div className="card-image-container">
          <img src={image} alt={name} className="product-media-img" loading="lazy" />
          
          {/* Top Badges */}
          <span className="card-offer-badge">{offerTag}</span>
          
          {/* Rating Pill */}
          <div className="card-rating-pill">
            <span className="rating-val">{rating}</span>
            <FiStar className="rating-star-icon" />
            <span className="rating-divider">|</span>
            <span className="rating-count">{reviewsCount}</span>
          </div>
        </div>

        {/* Card Content Details */}
        <div className="card-body">
          {/* 1. Brand Name */}
          <span className="card-brand-name">{brand}</span>

          {/* 2. Product Name */}
          <h3 className="card-product-title">{name}</h3>

          {/* 3. Description preview */}
          <p className="card-description-preview">{description}</p>

          {/* 4. Pricing & Discount Matrix */}
          <div className="card-price-matrix">
            <span className="card-selling-price">₹{price.toLocaleString('en-IN')}</span>
            <span className="card-mrp-price">₹{mrp.toLocaleString('en-IN')}</span>
            <span className="card-discount-pill">({discountPercent}% OFF)</span>
          </div>

          {/* 5. Permanent Always-Visible Add to Bag Button with Reactive Animation */}
          <button 
            type="button" 
            className={`card-permanent-add-btn ${isAdded ? 'added-success' : ''}`}
            onClick={handleAddToCart}
            title={isAdded ? "Added in Bag!" : "Add to Bag"}
          >
            {isAdded ? (
              <>
                <FiCheck className="btn-bag-icon check-pop-anim" />
                <span className="btn-text-anim">Added in the Bag!</span>
              </>
            ) : (
              <>
                <FiShoppingBag className="btn-bag-icon" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard
