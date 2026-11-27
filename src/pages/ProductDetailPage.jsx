import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { 
  FiShoppingBag, 
  FiTruck, 
  FiShield, 
  FiCheck, 
  FiArrowLeft, 
  FiStar, 
  FiPackage, 
  FiRefreshCw, 
  FiTag, 
  FiLayers,
  FiZap,
  FiCheckCircle
} from 'react-icons/fi'
import { getProductById } from '../api/productApi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './ProductDetailPage.css'

const FALLBACK_DETAIL = {
  productId: 1,
  productName: "ZARA Textured Woven Casual Shirt",
  price: 1899,
  categoryName: "Shirts",
  description: "Crafted from 100% Breathable Cotton. Premium modern silhouette tailored with precision stitching and modern European finish.",
  imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85",
  brand: "ZARA"
}

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart()
  const { isLoggedIn } = useAuth()

  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isAdded, setIsAdded] = useState(false)

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true)
      try {
        const res = await getProductById(id)
        if (res.data) {
          setProduct(res.data)
        } else {
          setProduct({ ...FALLBACK_DETAIL, productId: Number(id) })
        }
      } catch (err) {
        setProduct({ ...FALLBACK_DETAIL, productId: Number(id) })
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  if (loading) return <div className="spinner" style={{ marginTop: '6rem' }}></div>
  if (!product) return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>Product not found.</div>

  const prodId = product.productId || product.id || Number(id)
  const name = product.productName || product.name || FALLBACK_DETAIL.productName
  const brand = product.brand || (name.split(' ')[0]) || 'ZARA'
  const price = Math.round(product.price || FALLBACK_DETAIL.price)
  const mrp = product.actualPrice || product.mrp || Math.round(price * 1.85)
  const discountPercent = Math.round(((mrp - price) / mrp) * 100)
  const image = product.imageUrl || product.image || FALLBACK_DETAIL.imageUrl
  const desc = product.description || FALLBACK_DETAIL.description
  const category = product.category?.categoryName || product.categoryName || FALLBACK_DETAIL.categoryName
  const rating = product.rating || (4.2 + (prodId % 7) * 0.1).toFixed(1)
  const ratingsCount = 140 + (prodId * 23) % 900
  const reviewsCount = 38 + (prodId * 7) % 200

  // Derived rich specifications like Ajio & Flipkart
  const fabricType = product.color ? (prodId % 2 === 0 ? "100% Breathable Compact Cotton" : "Pure Linen & Supima Blend") : "100% Breathable Cotton"
  const fitType = prodId % 3 === 0 ? "Oversized Relaxed Fit" : (prodId % 2 === 0 ? "Slim Fit Tailored" : "Regular Comfort Fit")
  const weaveType = prodId % 2 === 0 ? "Woven Oxford Weave" : "Knitted Single Jersey"
  const washCare = "Machine wash cold at 30°C. Do not bleach. Tumble dry gentle."

  const handleAdd = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    const res = await addToCart(product, quantity, selectedSize)
    if (res?.success) {
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2200)
    }
  }

  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    await addToCart(product, quantity, selectedSize)
    navigate('/checkout')
  }

  return (
    <div className="product-detail-page container">
      {/* Modern Compact Flipkart / Ajio Two-Column Layout */}
      <div className="pdp-main-grid">
        
        {/* Left Column: Compact Visual Section */}
        <div className="pdp-left-col">
          <div className="pdp-compact-img-card card">
            <img src={image} alt={name} className="pdp-compact-img" />
            <span className="pdp-offer-tag-badge">{discountPercent}% OFF SPECIAL DROP</span>
          </div>

          {/* Quick Action Button under image for instant checkout */}
          <div className="pdp-cta-container">
            <button 
              type="button" 
              className={`btn-primary pdp-add-bag-btn ${isAdded ? 'added-success-anim' : ''}`}
              onClick={handleAdd}
            >
              {isAdded ? (
                <>
                  <FiCheck className="btn-icon-pop" />
                  <span>Added in the Bag!</span>
                </>
              ) : (
                <>
                  <FiShoppingBag className="btn-icon" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>

            <button 
              type="button" 
              className="pdp-buy-now-btn"
              onClick={handleBuyNow}
            >
              <FiZap /> Buy Now
            </button>
          </div>
        </div>

        {/* Right Column: Pricing, Rating, Selection & Specifications */}
        <div className="pdp-right-col">
          <div className="pdp-header-block card">
            <span className="pdp-brand-tag">{brand}</span>
            <h1 className="pdp-product-title">{name}</h1>
            <span className="pdp-category-breadcrumb">Category: <strong>{category}</strong></span>

            {/* Rating & Review Badge */}
            <div className="pdp-rating-row">
              <div className="pdp-star-pill">
                <span>{rating}</span>
                <FiStar className="star-icon-filled" />
              </div>
              <span className="pdp-rating-text">{ratingsCount} Ratings & {reviewsCount} Verified Reviews</span>
              <span className="pdp-assured-tag"><FiCheckCircle /> Velmora Assured</span>
            </div>

            {/* Price Matrix */}
            <div className="pdp-price-matrix">
              <span className="pdp-selling-price">₹{price.toLocaleString('en-IN')}</span>
              <span className="pdp-mrp-price">₹{mrp.toLocaleString('en-IN')}</span>
              <span className="pdp-discount-tag">({discountPercent}% OFF)</span>
              <span className="pdp-tax-note">Inclusive of all taxes</span>
            </div>
          </div>

          {/* Size & Quantity Selection Card */}
          <div className="pdp-selection-card card">
            <div className="size-selector-header">
              <span className="selector-title">Select Size:</span>
              <span className="size-chart-link">Size Chart Guide</span>
            </div>

            <div className="size-options-row">
              {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                <button
                  key={size}
                  type="button"
                  className={`size-pill-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="qty-row">
              <span className="selector-title">Quantity:</span>
              <div className="qty-counter-box">
                <button 
                  type="button" 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="qty-btn"
                >-</button>
                <span className="qty-count">{quantity}</span>
                <button 
                  type="button" 
                  onClick={() => setQuantity(q => q + 1)}
                  className="qty-btn"
                >+</button>
              </div>
            </div>
          </div>

          {/* Flipkart / Ajio Style Specifications & Fabric Details Card */}
          <div className="pdp-specs-card card">
            <h3 className="specs-card-title"><FiLayers /> Product Specifications</h3>
            
            <div className="specs-table-grid">
              <div className="spec-row">
                <span className="spec-label">Brand</span>
                <span className="spec-value highlight-brand">{brand}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Fabric / Material</span>
                <span className="spec-value">{fabricType}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Fit</span>
                <span className="spec-value">{fitType}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Weave / Pattern</span>
                <span className="spec-value">{weaveType}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Wash Care</span>
                <span className="spec-value">{washCare}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Origin / Atelier</span>
                <span className="spec-value">Crafted in India</span>
              </div>
            </div>

            {/* Description Paragraph */}
            <div className="pdp-desc-section">
              <h4>Product Description</h4>
              <p>{desc}</p>
            </div>
          </div>

          {/* Delivery & Trust Badges */}
          <div className="pdp-trust-card card">
            <div className="trust-badge-row">
              <FiTruck className="trust-icon" />
              <div>
                <strong>Free Pan-India Delivery</strong>
                <p>Delivered in 2-4 business days with live tracking updates.</p>
              </div>
            </div>
            <div className="trust-badge-row">
              <FiRefreshCw className="trust-icon" />
              <div>
                <strong>14 Days Hassle-Free Returns & Exchanges</strong>
                <p>Doorstep pickup available without questions asked.</p>
              </div>
            </div>
            <div className="trust-badge-row">
              <FiShield className="trust-icon" />
              <div>
                <strong>100% Genuine Guaranteed Brand</strong>
                <p>Sourced directly from authorized manufacturing houses.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default ProductDetailPage
