import { useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { 
  FiSearch, 
  FiShoppingBag, 
  FiUser, 
  FiMenu, 
  FiX, 
  FiLogOut, 
  FiUserPlus, 
  FiHome, 
  FiMail, 
  FiPackage 
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import velmoraLogo from '../assets/velmora-logo.svg'
import './Navbar.css'

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoggedIn, logout } = useAuth()
  const { cartCount } = useCart()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const categoryNavigation = [
    { name: 'ALL', path: '/products' },
    { name: 'MEN', path: '/products?gender=Men' },
    { name: 'WOMEN', path: '/products?gender=Women' },
    { name: 'KIDS', path: '/products?category=Kids' },
    { name: 'TOP WEAR', path: '/products?category=Topwear' },
    { name: 'BOTTOM WEAR', path: '/products?category=Bottomwear' },
    { name: 'FOOTWEAR', path: '/products?category=Footwear' },
    { name: 'ETHNIC WEAR', path: '/products?category=Ethnic' },
    { name: 'NEW ARRIVALS', path: '/products?sort=new' }
  ]

  return (
    <header className="modern-header">
      {/* Top Banner Promo Bar */}
      <div className="top-promo-bar">
        <span>EXCLUSIVE SEASON SALE: FLAT 40% - 70% OFF ON ZARA, SNITCH & RARE RABBIT | USE CODE: <strong>VELMORA70</strong></span>
      </div>

      {/* Main Navigation Bar */}
      <div className="main-nav-bar">
        <div className="container nav-row">
          
          {/* Left Side: Brand Logo + Search Bar immediately adjacent */}
          <div className="nav-left-section">
            <Link to="/" className="brand-logo-anchor" onClick={() => setMobileMenuOpen(false)}>
              <img src={velmoraLogo} alt="VELMORA" className="brand-logo-svg" />
            </Link>

            {/* Search Bar placed on the LEFT */}
            <form className="nav-search-form" onSubmit={handleSearch}>
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search Zara, Snitch, Shirts, T-Shirts, Cargo, Jeans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </form>
          </div>

          {/* Right Side: Navigation Links (Home, Shop, Contact Us) + Auth / Bag Actions */}
          <div className="nav-right-section">
            <nav className="header-primary-nav">
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-quick-link active' : 'nav-quick-link'}>
                <FiHome className="quick-nav-icon" /> Home
              </NavLink>
              <NavLink to="/products" className={({ isActive }) => isActive && location.pathname === '/products' && !location.search ? 'nav-quick-link active' : 'nav-quick-link'}>
                Shop
              </NavLink>
              <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-quick-link active' : 'nav-quick-link'}>
                <FiMail className="quick-nav-icon" /> Contact Us
              </NavLink>
            </nav>

            <div className="nav-actions">
              {isLoggedIn ? (
                <div className="user-action-dropdown">
                  <Link to="/profile" className="action-pill-btn user-logged-pill" title={user?.name || "My Profile"}>
                    <div className="action-icon-circle user-circle">
                      <FiUser className="action-svg" />
                    </div>
                    <span className="action-label">{user?.name || 'My Profile'}</span>
                  </Link>
                  <div className="dropdown-menu">
                    <Link to="/profile"><FiUser /> My Profile</Link>
                    <Link to="/orders"><FiPackage /> My Orders</Link>
                    {user?.role === 'ROLE_ADMIN' && <Link to="/admin">Admin Studio</Link>}
                    <button onClick={handleLogout} className="logout-action"><FiLogOut /> Sign Out</button>
                  </div>
                </div>
              ) : (
                <div className="auth-action-buttons">
                  <Link to="/login" className="action-pill-btn signin-pill" title="Sign In">
                    <div className="action-icon-circle">
                      <FiUser className="action-svg" />
                    </div>
                    <span className="action-label">Sign In</span>
                  </Link>

                  <Link to="/login?mode=register" className="action-pill-btn register-pill" title="Register Account">
                    <div className="action-icon-circle register-circle">
                      <FiUserPlus className="action-svg" />
                    </div>
                    <span className="action-label">Register</span>
                  </Link>
                </div>
              )}

              {/* Shopping Bag Button */}
              <Link to="/cart" className="action-pill-btn bag-pill" title="Shopping Bag">
                <div className="action-icon-circle bag-circle">
                  <FiShoppingBag className="action-svg" />
                  {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
                </div>
                <span className="action-label">Bag</span>
              </Link>

              <button className="mobile-toggle-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Navigation">
                {mobileMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Categories Navigation Strip */}
      <div className="categories-nav-strip">
        <div className="container strip-container">
          <ul className={`cat-strip-links ${mobileMenuOpen ? 'open' : ''}`}>
            {categoryNavigation.map((cat, idx) => (
              <li key={idx}>
                <NavLink 
                  to={cat.path} 
                  className={({ isActive }) => isActive && cat.name === 'ALL' && location.pathname === '/products' && !location.search ? 'cat-strip-link active' : 'cat-strip-link'}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Navbar
