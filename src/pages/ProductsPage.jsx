import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FiSliders, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi'
import { getAllProducts, searchProducts } from '../api/productApi'
import ProductCard from '../components/ProductCard'
import './ProductsPage.css'

const POPULAR_BRANDS = ['ZARA', 'SNITCH', 'RARE RABBIT', "LEVI'S", 'H&M', 'SUPERDRY', 'THE SOULED STORE', 'FLYING MACHINE']
const CATEGORY_FILTERS = ['All', 'T-Shirts', 'Shirts', 'Pants', 'Jeans', 'Track Pants', 'Kurtas', 'Co-ord Sets', 'Women Tops', 'Women Dresses', 'Footwear']

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const searchQuery = searchParams.get('search') || ''
  const categoryParam = searchParams.get('category') || 'All'
  const brandParam = searchParams.get('brand') || 'All'
  const genderParam = searchParams.get('gender') || ''

  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [selectedBrand, setSelectedBrand] = useState(brandParam)
  const [priceCeiling, setPriceCeiling] = useState(15000)
  const [sortBy, setSortBy] = useState('popular')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSelectedCategory(categoryParam)
  }, [categoryParam])

  useEffect(() => {
    setSelectedBrand(brandParam)
  }, [brandParam])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        let prods = []
        if (searchQuery.trim()) {
          // Reset stale sidebar filters when a new search query is executed
          setSelectedCategory('All')
          setSelectedBrand('All')
          const res = await searchProducts(searchQuery.trim())
          prods = res.data || []

          // Client-side fallback across name, brand, category, description, and singular/plural
          if (prods.length === 0) {
            const allRes = await getAllProducts()
            const allProds = allRes.data || []
            const q = searchQuery.trim().toLowerCase()
            const singularQ = q.endsWith('s') && q.length > 3 ? q.slice(0, -1) : q
            prods = allProds.filter(p => {
              const hay = [
                p.productName || p.name || '',
                p.brand || '',
                p.category?.categoryName || p.categoryName || '',
                p.description || ''
              ].join(' ').toLowerCase()
              return hay.includes(q) || hay.includes(singularQ)
            })
          }
        } else {
          const res = await getAllProducts()
          prods = res.data || []
        }
        setProducts(prods)
      } catch (err) {
        console.error('Error fetching catalog', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [searchQuery])

  // Filter Pipeline with comprehensive Category & Gender Mapping
  const filteredProducts = products.filter(p => {
    const rawName = (p.productName || p.name || '')
    const pName = rawName.toLowerCase()
    const pBrand = (p.brand || rawName.split(' ')[0] || '').toLowerCase()
    const pCat = (p.category?.categoryName || p.categoryName || '').toLowerCase()

    // 1. Gender Filter
    if (genderParam) {
      const g = genderParam.toLowerCase()
      if (g === 'women') {
        const isWomen = pCat.includes('women') || pName.includes('women') || pCat.includes('dress') || pCat.includes('top')
        if (!isWomen) return false
      } else if (g === 'men') {
        const isWomen = pCat.includes('women') || pName.includes('women') || pCat.includes('dress')
        if (isWomen) return false
      }
    }

    // 2. Category Filter (Supports Nav Strip macro categories: Topwear, Bottomwear, Ethnic, Footwear, Kids)
    let matchesCategory = true
    const activeCat = selectedCategory.toLowerCase()

    if (activeCat !== 'all') {
      if (activeCat === 'topwear' || activeCat === 'top wear') {
        matchesCategory = pCat.includes('shirt') || pCat.includes('top') || pName.includes('shirt') || pName.includes('tee')
      } else if (activeCat === 'bottomwear' || activeCat === 'bottom wear') {
        matchesCategory = pCat.includes('pant') || pCat.includes('cargo') || pCat.includes('denim') || pName.includes('pant') || pName.includes('jean')
      } else if (activeCat === 'ethnic' || activeCat === 'ethnic wear') {
        matchesCategory = pCat.includes('kurta') || pName.includes('kurta') || pName.includes('ethnic')
      } else if (activeCat === 'footwear') {
        matchesCategory = pCat.includes('footwear') || pName.includes('shoe') || pName.includes('sneaker') || pName.includes('boot')
      } else if (activeCat === 'kids') {
        matchesCategory = pCat.includes('kids') || pName.includes('kids') || pName.includes('boy') || pName.includes('girl')
      } else {
        matchesCategory = pCat.includes(activeCat) || pName.includes(activeCat)
      }
    }

    // 3. Brand Filter
    const matchesBrand = selectedBrand === 'All' || 
      pBrand.includes(selectedBrand.toLowerCase()) ||
      pName.includes(selectedBrand.toLowerCase())

    // 4. Price Filter
    const matchesPrice = (p.price || 0) <= priceCeiling

    return matchesCategory && matchesBrand && matchesPrice
  })

  // Sort Pipeline
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'priceLow') return (a.price || 0) - (b.price || 0)
    if (sortBy === 'priceHigh') return (b.price || 0) - (a.price || 0)
    if (sortBy === 'discount') return ((b.actualPrice || b.price * 1.8) - b.price) - ((a.actualPrice || a.price * 1.8) - a.price)
    return (b.productId || b.id || 0) - (a.productId || a.id || 0)
  })

  const getPageTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`
    if (genderParam) return `${genderParam.toUpperCase()}'S LUXURY COLLECTION`
    if (selectedCategory !== 'All') return `${selectedCategory.toUpperCase()} COLLECTION`
    return 'ALL FASHION COLLECTIONS'
  }

  return (
    <div className="ajio-products-page container">
      {/* Header */}
      <div className="catalog-top-header">
        <h1 className="catalog-title">{getPageTitle()}</h1>
        <span className="catalog-count-pill">{sortedProducts.length} Items Found</span>
      </div>

      <div className="catalog-main-layout">
        {/* Left Filter Sidebar */}
        <aside className="modern-filter-sidebar card">
          <div className="filter-header-bar">
            <h4><FiSliders /> FILTERS</h4>
            {(selectedCategory !== 'All' || selectedBrand !== 'All' || priceCeiling < 15000 || genderParam) && (
              <button 
                type="button" 
                className="clear-all-btn"
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedBrand('All')
                  setPriceCeiling(15000)
                  setSearchParams({})
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="filter-box">
            <span className="filter-box-title">CATEGORY</span>
            <div className="filter-options-list">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-pill-opt ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat)
                    setSearchParams(cat === 'All' ? {} : { category: cat })
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div className="filter-box">
            <span className="filter-box-title">PREMIUM BRANDS</span>
            <div className="filter-options-list">
              <button 
                type="button" 
                className={`filter-pill-opt ${selectedBrand === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedBrand('All')}
              >
                All Brands
              </button>
              {POPULAR_BRANDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`filter-pill-opt ${selectedBrand === b ? 'active' : ''}`}
                  onClick={() => setSelectedBrand(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Price Ceiling */}
          <div className="filter-box">
            <div className="filter-box-title-row">
              <span className="filter-box-title">MAX PRICE</span>
              <span className="price-val-tag">₹{priceCeiling.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range"
              min="499"
              max="15000"
              step="500"
              value={priceCeiling}
              onChange={(e) => setPriceCeiling(Number(e.target.value))}
              className="modern-range-slider"
            />
            <div className="range-bounds">
              <span>₹499</span>
              <span>₹15,000+</span>
            </div>
          </div>
        </aside>

        {/* Right Content */}
        <main className="catalog-products-stream">
          {/* Sorting Action Bar */}
          <div className="sort-action-row card">
            <span className="stream-summary-text">
              Showing <strong>{sortedProducts.length}</strong> styles
            </span>
            <div className="sort-by-wrap">
              <label htmlFor="sort-dropdown">SORT BY:</label>
              <select 
                id="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="modern-sort-select"
              >
                <option value="popular">Popularity & Rating</option>
                <option value="discount">Biggest Discount</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="spinner"></div>
          ) : sortedProducts.length === 0 ? (
            <div className="catalog-empty card">
              <h3>No Matches Found</h3>
              <p>Try resetting filters or searching for top brands like Zara or Snitch.</p>
            </div>
          ) : (
            <div className="products-grid-feed">
              {sortedProducts.map((p) => (
                <ProductCard key={p.productId || p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ProductsPage
