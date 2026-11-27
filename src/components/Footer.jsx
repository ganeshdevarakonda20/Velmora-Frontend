import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiShield, FiTruck, FiRefreshCw, FiAward } from 'react-icons/fi'
import { FaFacebookF, FaInstagram, FaTwitter, FaPinterestP } from 'react-icons/fa'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      {/* Brand Perks Bar - Crisp High-Contrast Styling */}
      <div className="footer-perks">
        <div className="container footer-perks-grid">
          <div className="perk-item">
            <FiAward className="perk-icon" />
            <div>
              <h5>100% Genuine Brands</h5>
              <p>Direct from Zara, Snitch, Rare Rabbit & Levi's</p>
            </div>
          </div>
          <div className="perk-item">
            <FiTruck className="perk-icon" />
            <div>
              <h5>Express Delivery</h5>
              <p>Free pan-India delivery on all orders</p>
            </div>
          </div>
          <div className="perk-item">
            <FiShield className="perk-icon" />
            <div>
              <h5>Secure Checkout</h5>
              <p>256-bit encrypted card, UPI & netbanking</p>
            </div>
          </div>
          <div className="perk-item">
            <FiRefreshCw className="perk-icon" />
            <div>
              <h5>Easy 14-Day Returns</h5>
              <p>Instant doorstep pickup & refund</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-container container">

        {/* Brand Section */}
        <div className="footer-section footer-brand">
          <h3 className="footer-logo">
            <span className="logo-accent">V</span>ELMORA
          </h3>
          <p className="footer-description">
            Velmora is your ultimate modern fashion destination. Discover trendsetting streetwear, 
            exclusive drops, tailored formals, and premium branded collections from world-renowned labels.
          </p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon" title="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon" title="Instagram">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon" title="Twitter">
              <FaTwitter />
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="social-icon" title="Pinterest">
              <FaPinterestP />
            </a>
          </div>
        </div>

        {/* Collections Links */}
        <div className="footer-section">
          <h4 className="footer-heading">Top Categories</h4>
          <ul className="footer-links">
            <li><Link to="/products?category=T-Shirts">T-Shirts & Oversized</Link></li>
            <li><Link to="/products?category=Shirts">Casual & Formal Shirts</Link></li>
            <li><Link to="/products?category=Pants">Denims, Jeans & Cargo</Link></li>
            <li><Link to="/products?category=Ethnic">Kurtas & Ethnic Sets</Link></li>
            <li><Link to="/products?category=Track">Track Pants & Joggers</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="footer-section">
          <h4 className="footer-heading">Customer Care</h4>
          <ul className="footer-links">
            <li><Link to="/orders">Track Your Order</Link></li>
            <li><Link to="/cart">Shopping Bag</Link></li>
            <li><Link to="/about">Size & Fit Guide</Link></li>
            <li><Link to="/about">Shipping & Delivery Policy</Link></li>
            <li><Link to="/contact">Help Center & Support</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4 className="footer-heading">Contact Vilmora</h4>
          <ul className="footer-contact">
            <li>
              <FiMapPin className="contact-icon" />
              <span>Vilmora Retail Hub, Fashion Boulevard, Chennai, India</span>
            </li>
            <li>
              <FiPhone className="contact-icon" />
              <span>+91 98765 43210 / 1800-VILMORA</span>
            </li>
            <li>
              <FiMail className="contact-icon" />
              <span>support@vilmora.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} Vilmora Modern Retail Private Limited. All rights reserved.</p>
          <p>Designed for contemporary style & modern fashion enthusiasts.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
