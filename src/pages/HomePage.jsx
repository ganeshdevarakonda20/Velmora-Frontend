import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiArrowRight, FiZap } from 'react-icons/fi'
import { getAllProducts } from '../api/productApi'
import ProductCard from '../components/ProductCard'
import './HomePage.css'

// 8 Unique High-Fashion Editorial Hero Slides
const HERO_SLIDES = [
  {
    id: 1,
    title: "THE BIG BOLD DROP",
    subtitle: "ZARA & SNITCH SPECIALS",
    highlight: "FLAT 50% - 70% OFF",
    desc: "Over 500+ fresh styles in oversized graphic tees, structured linen shirts & baggy parachute cargo.",
    ctaText: "SHOP THE DROP",
    link: "/products?sort=discount",
    bgImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85",
    tag: "TRENDING NOW"
  },
  {
    id: 2,
    title: "RARE RABBIT LUXE",
    subtitle: "TIMELESS STATEMENT APPAREL",
    highlight: "MIN. 40% OFF",
    desc: "Refined Italian-cut formal shirts, tailored blazers and monochrome vacation co-ords.",
    ctaText: "EXPLORE COLLECTION",
    link: "/products?search=Rare+Rabbit",
    bgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85",
    tag: "BRAND EXCLUSIVE"
  },
  {
    id: 3,
    title: "CARGO & DENIM EDITION",
    subtitle: "LEVI'S & SUPERDRY SPECIALS",
    highlight: "STARTS AT ₹1,499",
    desc: "Relaxed baggy fits, utility carpenter pockets and raw unwashed vintage washes.",
    ctaText: "EXPLORE DENIMS",
    link: "/products?category=Bottomwear",
    bgImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1600&q=85",
    tag: "NEW STREETWEAR"
  },
  {
    id: 4,
    title: "AUTUMN TEXTURED LINEN",
    subtitle: "MINIMALIST LUXURY SILHOUETTES",
    highlight: "UP TO 55% OFF",
    desc: "Bespoke French-cuff linen shirts, earthy Cuban collars and breathable resort trousers.",
    ctaText: "SHOP LINEN",
    link: "/products?search=Linen",
    bgImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85",
    tag: "HOT NEW DROP"
  },
  {
    id: 5,
    title: "HAUTE ETHNIC & FESTIVE",
    subtitle: "ROYAL SILKS & HERITAGE WEAVES",
    highlight: "FLAT 45% OFF",
    desc: "Modern asymmetric kurtas, royal bandhgala blazers, and artisanal festive eveningwear.",
    ctaText: "EXPLORE ETHNIC",
    link: "/products?category=Ethnic",
    bgImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85",
    tag: "FESTIVE SPOTLIGHT"
  },
  {
    id: 6,
    title: "URBAN UTILITY & TRACKS",
    subtitle: "THE SOULED STORE & PUMA",
    highlight: "UNDER ₹1,299",
    desc: "High-density fleece joggers, streetwear track pants, and heavyweight graphic hoodies.",
    ctaText: "VIEW JOGGERS",
    link: "/products?search=Track",
    bgImage: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1600&q=85",
    tag: "BESTSELLERS"
  },
  {
    id: 7,
    title: "WOMEN'S ATELIER COUTURE",
    subtitle: "ZARA & H&M RUNWAY PICKS",
    highlight: "NEW ARRIVALS",
    desc: "Draped monochrome slip dresses, tailored power blazers, and high-rise pleated pants.",
    ctaText: "SHOP WOMEN",
    link: "/products?gender=Women",
    bgImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85",
    tag: "RUNWAY EDIT"
  },
  {
    id: 8,
    title: "MONOCHROME CO-ORD SETS",
    subtitle: "VACATION & RESORT ESSENTIALS",
    highlight: "SPECIAL 50% OFF",
    desc: "Effortless printed short-sleeve shirt and relaxed short pairings tailored for modern comfort.",
    ctaText: "DISCOVER CO-ORDS",
    link: "/products?search=Co-ord",
    bgImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1600&q=85",
    tag: "LIMITED EDITION"
  }
]

const QUICK_CATEGORIES = [
  { name: 'Oversized Tees', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80', path: '/products?search=T-Shirt' },
  { name: 'Casual Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80', path: '/products?search=Shirt' },
  { name: 'Cargo & Jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80', path: '/products?search=Pants' },
  { name: 'Co-ord Sets', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80', path: '/products?search=Co-ord' },
  { name: 'Kurtas & Ethnic', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=500&q=80', path: '/products?search=Kurta' },
  { name: 'Track & Joggers', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=500&q=80', path: '/products?search=Track' }
]

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await getAllProducts()
        if (res.data && res.data.length > 0) {
          setProducts(res.data)
        }
      } catch (e) {
        console.error('Error fetching home products', e)
      } finally {
        setLoading(false)
      }
    }
    loadFeed()
  }, [])

  const nextSlide = () => setCurrentSlide((currentSlide + 1) % HERO_SLIDES.length)
  const prevSlide = () => setCurrentSlide((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)

  return (
    <div className="ajio-homepage">
      {/* 1. Sideways Swipeable / Auto-Sliding Hero Carousel (8 Slides) */}
      <section className="hero-carousel-section">
        <div 
          className="carousel-track" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <div 
              key={slide.id} 
              className="carousel-slide"
              style={{ backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.90) 0%, rgba(15, 23, 42, 0.45) 55%, transparent 100%), url(${slide.bgImage})` }}
            >
              <div className="container hero-slide-container">
                <div className="slide-content-box">
                  <span className="slide-tag"><FiZap /> {slide.tag}</span>
                  <h4 className="slide-brand-subtitle">{slide.subtitle}</h4>
                  <h1 className="slide-title">{slide.title}</h1>
                  <span className="slide-highlight-badge">{slide.highlight}</span>
                  <p className="slide-description">{slide.desc}</p>
                  <Link to={slide.link} className="btn-primary hero-cta-btn">
                    {slide.ctaText} <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button className="carousel-nav-btn prev" onClick={prevSlide} aria-label="Previous Slide"><FiChevronLeft /></button>
        <button className="carousel-nav-btn next" onClick={nextSlide} aria-label="Next Slide"><FiChevronRight /></button>

        {/* Carousel Indicators */}
        <div className="carousel-dots">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Top Brands Strip (High-Contrast White & Cobalt Accent) */}
      <section className="top-brands-strip">
        <div className="container brands-flex">
          <span className="brands-title">FEATURED BRANDS:</span>
          <div className="brands-badges">
            {['ZARA', 'SNITCH', 'RARE RABBIT', "LEVI'S", 'H&M', 'SUPERDRY', 'THE SOULED STORE', 'FLYING MACHINE'].map((brand, i) => (
              <Link to={`/products?search=${encodeURIComponent(brand)}`} key={i} className="brand-pill-link">
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Quick Visual Category Circles / Cards */}
      <section className="section quick-categories-section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <h2 className="section-main-heading">TRENDING STYLES & CATEGORIES</h2>
              <p className="section-sub-heading">Curated aesthetics updated daily</p>
            </div>
            <Link to="/products" className="view-all-link">View All <FiArrowRight /></Link>
          </div>

          <div className="quick-cat-grid">
            {QUICK_CATEGORIES.map((c, idx) => (
              <Link to={c.path} key={idx} className="quick-cat-card">
                <div className="quick-cat-img-wrap">
                  <img src={c.image} alt={c.name} />
                </div>
                <span className="quick-cat-title">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Fresh Drops / Trending Products Grid */}
      <section className="section curated-feed-section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <h2 className="section-main-heading">HOT PICKS & NEW ARRIVALS</h2>
              <p className="section-sub-heading">Featured designer drops with up to 70% OFF</p>
            </div>
            <Link to="/products" className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              Explore All 800+ Items
            </Link>
          </div>

          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="modern-feed-grid">
              {products.slice(0, 10).map((prod) => (
                <ProductCard key={prod.productId || prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage
