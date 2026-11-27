import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  FiCheckCircle, 
  FiShield, 
  FiArrowLeft, 
  FiLock, 
  FiCreditCard, 
  FiTruck, 
  FiAlertCircle, 
  FiShoppingBag, 
  FiArrowRight, 
  FiHome, 
  FiPackage, 
  FiCheck,
  FiSmartphone,
  FiGlobe
} from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { checkoutOrder } from '../api/orderApi'
import './CheckoutPage.css'

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', logoText: 'HDFC' },
  { id: 'ICICI', name: 'ICICI Bank', logoText: 'ICICI' },
  { id: 'SBI', name: 'State Bank of India', logoText: 'SBI' },
  { id: 'AXIS', name: 'Axis Bank', logoText: 'AXIS' },
  { id: 'KOTAK', name: 'Kotak Mahindra', logoText: 'KOTAK' },
  { id: 'PNB', name: 'Punjab National Bank', logoText: 'PNB' }
]

function CheckoutPage() {
  const { cartItems, cartTotal, fetchCart } = useCart()
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  // Form State: Pre-filled automatically from database user profile
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
    landmark: '',
    paymentMethod: 'UPI' // UPI, CARD, NETBANKING, COD
  })

  // UPI Specific State
  const [upiMethod, setUpiMethod] = useState('GPay') // GPay, PhonePe, Paytm, OtherUPI, QR
  const [upiId, setUpiId] = useState('')
  const [upiVerified, setUpiVerified] = useState(false)

  // Card Specific State
  const [cardType, setCardType] = useState('DEBIT') // DEBIT, CREDIT
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState(user?.name || '')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('HDFC')
  const [bankUserId, setBankUserId] = useState('')

  const [loading, setLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [confirmedTotal, setConfirmedTotal] = useState(0)
  const [error, setError] = useState('')

  // Auth Guard
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/checkout' } })
    }
  }, [isLoggedIn, navigate])

  // Automatically detect and prefill address and contact info from user database profile
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || ''
      }))
      if (!cardHolder && user.name) {
        setCardHolder(user.name)
      }
    }
  }, [user, cardHolder])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  // Card number input formatter (formats into groups of 4 digits)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 16)
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw
    setCardNumber(formatted)
  }

  // Card Expiry formatter (MM/YY)
  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 4)
    if (raw.length >= 3) {
      setCardExpiry(`${raw.substring(0, 2)}/${raw.substring(2, 4)}`)
    } else {
      setCardExpiry(raw)
    }
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!user?.userId) {
      setError('Please sign in to complete your purchase.')
      setLoading(false)
      return
    }

    if (cartItems.length === 0) {
      setError('Your shopping bag is empty. Please add items before placing an order.')
      setLoading(false)
      return
    }

    // Validate payment method specifics
    if (formData.paymentMethod === 'UPI') {
      if (upiMethod === 'OtherUPI' && !upiId.trim()) {
        setError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank).')
        setLoading(false)
        return
      }
    } else if (formData.paymentMethod === 'CARD') {
      const cleanNumber = cardNumber.replace(/\s/g, '')
      if (cleanNumber.length < 15) {
        setError('Please enter a complete 16-digit debit or credit card number.')
        setLoading(false)
        return
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setError('Please enter a valid expiry date (MM/YY).')
        setLoading(false)
        return
      }
      if (!cardCvv || cardCvv.length < 3) {
        setError('Please enter a valid 3-digit CVV.')
        setLoading(false)
        return
      }
    } else if (formData.paymentMethod === 'NETBANKING') {
      if (!selectedBank) {
        setError('Please select your preferred banking partner.')
        setLoading(false)
        return
      }
    }

    const fullShippingAddress = `${formData.fullName}, ${formData.address}${formData.landmark ? ', Landmark: ' + formData.landmark : ''}, ${formData.city}, ${formData.state} - ${formData.pincode}. Phone: ${formData.phone}`

    // Construct enriched payment description
    let paymentDetail = formData.paymentMethod
    if (formData.paymentMethod === 'UPI') {
      paymentDetail = `UPI (${upiMethod}${upiId ? ': ' + upiId : ''})`
    } else if (formData.paymentMethod === 'CARD') {
      paymentDetail = `${cardType} Card (Ending in ${cardNumber.slice(-4)})`
    } else if (formData.paymentMethod === 'NETBANKING') {
      paymentDetail = `Net Banking (${selectedBank})`
    } else {
      paymentDetail = 'Cash on Delivery (COD)'
    }

    const orderPayload = {
      shippingAddress: fullShippingAddress,
      paymentMethod: paymentDetail
    }

    try {
      const res = await checkoutOrder(user.userId, orderPayload)
      if (res.data && (res.data.orderId || res.data.id)) {
        const createdId = res.data.orderId || res.data.id
        const serverTotal = Number(res.data.totalAmount || 0)
        setConfirmedTotal(serverTotal > 0 ? serverTotal : cartTotal)
        setOrderId(createdId)
        setOrderComplete(true)
        await fetchCart()
      } else {
        throw new Error('Order confirmation not received from server.')
      }
    } catch (err) {
      console.error('Order checkout error:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to place order with database. Please verify your items are in stock.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // VIEW: Order Complete ("Thank You for Ordering")
  // With explicit back and navigation buttons
  // ==========================================
  if (orderComplete) {
    return (
      <div className="checkout-page container">
        <div className="order-success-card card">
          <div className="success-icon-wrap">
            <FiCheckCircle className="success-icon" />
          </div>
          <span className="success-tag">Order Confirmed</span>
          <h2>Thank You for Ordering with Velmora</h2>
          <p className="order-num-text">Order Reference: <strong>#VEL-{orderId}</strong></p>
          <p className="order-success-desc">
            Your branded apparel order has been placed successfully in the database.
            Real-time tracking and delivery updates have been scheduled for <strong>{formData.email || 'your registered email'}</strong>.
          </p>

          <div className="success-order-summary-box">
            <div className="summary-pill">
              <span>Payment Mode:</span>
              <strong>{formData.paymentMethod}</strong>
            </div>
            <div className="summary-pill">
              <span>Total Paid:</span>
              <strong>₹{confirmedTotal.toLocaleString('en-IN')}</strong>
            </div>
            <div className="summary-pill">
              <span>Delivery Status:</span>
              <strong className="status-processing">Processing & Tailoring</strong>
            </div>
          </div>

          {/* Prominent Action Navigation Buttons */}
          <div className="success-actions">
            <button type="button" onClick={() => navigate('/')} className="btn-primary success-home-cta">
              <FiHome /> Back to Home
            </button>
            <Link to="/orders" className="btn-secondary">
              <FiPackage /> View My Orders
            </Link>
            <Link to="/products" className="btn-secondary">
              <FiShoppingBag /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // VIEW: Empty Cart
  if (cartItems.length === 0 && !loading) {
    return (
      <div className="checkout-page container">
        <div className="checkout-nav-back-row">
          <button type="button" className="page-back-btn" onClick={() => navigate('/products')}>
            <FiArrowLeft /> Back to Shop
          </button>
        </div>
        <div className="empty-cart-box card">
          <FiShoppingBag className="empty-bag-large-icon" />
          <h2>Your Shopping Bag is Empty</h2>
          <p>
            There are no products in your bag to checkout. Please browse our boutique and add items.
          </p>
          <Link to="/products" className="btn-primary">
            Explore Collection <FiArrowRight />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page container">
      {/* Back to Bag navigation */}
      <div className="checkout-nav-back-row">
        <button type="button" className="page-back-btn" onClick={() => navigate('/cart')}>
          <FiArrowLeft /> Back to Bag
        </button>
      </div>

      <div className="checkout-header">
        <h1>Velmora Bespoke Checkout</h1>
        <p>Review your verified shipping address and complete your secure payment.</p>
      </div>

      {error && (
        <div className="checkout-error-banner">
          <FiAlertCircle className="error-icon" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="checkout-layout">
        
        {/* Left Column: 1. Address + 2. Interactive Payment Methods */}
        <div className="checkout-forms">
          
          {/* Section 1: Shipping Address (Auto-detected from database) */}
          <div className="checkout-section-card card">
            <div className="section-title-row">
              <h3 className="section-title">1. Delivery & Contact Details</h3>
              <span className="autofill-badge">
                <FiCheck /> Auto-filled from Database Profile
              </span>
            </div>
            
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Recipient Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Anandha Kumar"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Order Confirmation) *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <textarea
                name="address"
                required
                rows="3"
                placeholder="Flat / House No., Building Name, Street Name"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Landmark (Optional)</label>
              <input
                type="text"
                name="landmark"
                placeholder="Near Metro Station, Opp. Park"
                value={formData.landmark}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="Chennai"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="Tamil Nadu"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  placeholder="600001"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Payment Details System */}
          <div className="checkout-section-card card">
            <div className="section-title-row">
              <h3 className="section-title">2. Select Payment Mode</h3>
              <span className="secure-badge-pill">
                <FiLock /> 256-Bit SSL Secured
              </span>
            </div>

            {/* Payment Mode Selector Tabs */}
            <div className="payment-method-selector-tabs">
              <button
                type="button"
                className={`pm-tab-btn ${formData.paymentMethod === 'UPI' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'UPI' }))}
              >
                <FiSmartphone className="tab-icon" />
                <div className="tab-text">
                  <strong>UPI</strong>
                  <span>PhonePe, GPay, Paytm</span>
                </div>
              </button>

              <button
                type="button"
                className={`pm-tab-btn ${formData.paymentMethod === 'CARD' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'CARD' }))}
              >
                <FiCreditCard className="tab-icon" />
                <div className="tab-text">
                  <strong>Cards</strong>
                  <span>Debit & Credit Cards</span>
                </div>
              </button>

              <button
                type="button"
                className={`pm-tab-btn ${formData.paymentMethod === 'NETBANKING' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'NETBANKING' }))}
              >
                <FiGlobe className="tab-icon" />
                <div className="tab-text">
                  <strong>Net Banking</strong>
                  <span>All Major Indian Banks</span>
                </div>
              </button>

              <button
                type="button"
                className={`pm-tab-btn ${formData.paymentMethod === 'COD' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'COD' }))}
              >
                <FiTruck className="tab-icon" />
                <div className="tab-text">
                  <strong>Cash on Delivery</strong>
                  <span>Pay upon arrival</span>
                </div>
              </button>
            </div>

            {/* Sub-Panel: UPI Payment Interface */}
            {formData.paymentMethod === 'UPI' && (
              <div className="payment-subpanel card">
                <h4 className="subpanel-title">Choose your preferred UPI Application:</h4>
                <div className="upi-app-options">
                  <label className={`upi-app-card ${upiMethod === 'PhonePe' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="upiApp" 
                      checked={upiMethod === 'PhonePe'} 
                      onChange={() => setUpiMethod('PhonePe')} 
                    />
                    <div className="upi-app-content">
                      <span className="app-logo-pill phonepe-pill">PhonePe</span>
                      <span className="app-subtext">Instant App Verification</span>
                    </div>
                  </label>

                  <label className={`upi-app-card ${upiMethod === 'GPay' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="upiApp" 
                      checked={upiMethod === 'GPay'} 
                      onChange={() => setUpiMethod('GPay')} 
                    />
                    <div className="upi-app-content">
                      <span className="app-logo-pill gpay-pill">Google Pay</span>
                      <span className="app-subtext">Fast UPI Auto-approval</span>
                    </div>
                  </label>

                  <label className={`upi-app-card ${upiMethod === 'Paytm' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="upiApp" 
                      checked={upiMethod === 'Paytm'} 
                      onChange={() => setUpiMethod('Paytm')} 
                    />
                    <div className="upi-app-content">
                      <span className="app-logo-pill paytm-pill">Paytm</span>
                      <span className="app-subtext">Paytm Wallet & UPI</span>
                    </div>
                  </label>

                  <label className={`upi-app-card ${upiMethod === 'OtherUPI' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="upiApp" 
                      checked={upiMethod === 'OtherUPI'} 
                      onChange={() => setUpiMethod('OtherUPI')} 
                    />
                    <div className="upi-app-content">
                      <span className="app-logo-pill bhim-pill">Any UPI ID</span>
                      <span className="app-subtext">BHIM, Cred, Amazon Pay</span>
                    </div>
                  </label>

                  <label className={`upi-app-card ${upiMethod === 'QR' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="upiApp" 
                      checked={upiMethod === 'QR'} 
                      onChange={() => setUpiMethod('QR')} 
                    />
                    <div className="upi-app-content">
                      <span className="app-logo-pill qr-pill">Scan QR Code</span>
                      <span className="app-subtext">Scan using any camera</span>
                    </div>
                  </label>
                </div>

                {/* UPI Input / Details */}
                {upiMethod === 'OtherUPI' ? (
                  <div className="upi-id-box">
                    <label className="form-label">Enter Virtual Payment Address (VPA / UPI ID)</label>
                    <div className="upi-input-group">
                      <input 
                        type="text" 
                        placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm" 
                        value={upiId}
                        onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); }}
                        className="form-input"
                      />
                      <button 
                        type="button" 
                        className={`upi-verify-btn ${upiVerified ? 'verified' : ''}`}
                        onClick={() => {
                          if (upiId.includes('@')) {
                            setUpiVerified(true)
                          } else {
                            alert('Please enter a valid UPI format with @ symbol.')
                          }
                        }}
                      >
                        {upiVerified ? '✓ Verified' : 'Verify ID'}
                      </button>
                    </div>
                    {upiVerified && <p className="verified-success-msg">✓ Account name verified: {formData.fullName}</p>}
                  </div>
                ) : upiMethod === 'QR' ? (
                  <div className="upi-qr-display-card">
                    <div className="qr-box-mock">
                      <div className="qr-code-graphic">
                        <div className="qr-corner top-left"></div>
                        <div className="qr-corner top-right"></div>
                        <div className="qr-corner bottom-left"></div>
                        <div className="qr-center-text">VELMORA UPI</div>
                      </div>
                      <div className="qr-info">
                        <strong>Scan with PhonePe, Paytm, or GPay</strong>
                        <p>Amount: <span>₹{cartTotal.toLocaleString('en-IN')}</span></p>
                        <span className="qr-timer">Valid for 04:59 mins</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="upi-app-ready-notice">
                    <p>
                      Click <strong>"Pay via {upiMethod}"</strong> below. A secure payment approval notification will be requested from your {upiMethod} account.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sub-Panel: Credit / Debit Card Interface */}
            {formData.paymentMethod === 'CARD' && (
              <div className="payment-subpanel card">
                <div className="card-type-toggle-row">
                  <h4 className="subpanel-title">Enter Card Credentials:</h4>
                  <div className="card-type-pills">
                    <button
                      type="button"
                      className={`card-sub-pill ${cardType === 'DEBIT' ? 'active' : ''}`}
                      onClick={() => setCardType('DEBIT')}
                    >
                      Debit Card
                    </button>
                    <button
                      type="button"
                      className={`card-sub-pill ${cardType === 'CREDIT' ? 'active' : ''}`}
                      onClick={() => setCardType('CREDIT')}
                    >
                      Credit Card
                    </button>
                  </div>
                </div>

                <div className="card-input-grid">
                  <div className="form-group full-col">
                    <label className="form-label">16-Digit {cardType === 'DEBIT' ? 'Debit' : 'Credit'} Card Number *</label>
                    <div className="card-number-wrapper">
                      <input 
                        type="text" 
                        placeholder="4532 8920 1234 5678"
                        maxLength="19"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="form-input card-num-input"
                      />
                      <div className="card-brand-badges">
                        <span className="brand-chip visa">VISA</span>
                        <span className="brand-chip mc">MC</span>
                        <span className="brand-chip rupay">RuPay</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group full-col">
                    <label className="form-label">Name on Card *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Anandha Kumar"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-grid-2 full-col">
                    <div className="form-group">
                      <label className="form-label">Expiry Date *</label>
                      <input 
                        type="text" 
                        placeholder="MM / YY"
                        maxLength="5"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">CVV / Security Code *</label>
                      <input 
                        type="password" 
                        placeholder="•••"
                        maxLength="4"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="rbi-secure-note">
                  <FiLock /> Encrypted via PCI-DSS Compliant 256-Bit TLS protocol.
                </div>
              </div>
            )}

            {/* Sub-Panel: Net Banking Interface */}
            {formData.paymentMethod === 'NETBANKING' && (
              <div className="payment-subpanel card">
                <h4 className="subpanel-title">Select your Net Banking Institution:</h4>
                <div className="banks-grid">
                  {POPULAR_BANKS.map(bank => (
                    <label 
                      key={bank.id} 
                      className={`bank-tile-card ${selectedBank === bank.id ? 'selected' : ''}`}
                    >
                      <input 
                        type="radio" 
                        name="bankSelection" 
                        checked={selectedBank === bank.id} 
                        onChange={() => setSelectedBank(bank.id)} 
                      />
                      <div className="bank-logo-badge">{bank.logoText}</div>
                      <span className="bank-name-label">{bank.name}</span>
                    </label>
                  ))}
                </div>

                <div className="other-banks-row">
                  <label className="form-label">Or Select from 50+ Other Indian Banks:</label>
                  <select 
                    value={selectedBank} 
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="form-input"
                  >
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                    <option value="PNB">Punjab National Bank</option>
                    <option value="BOB">Bank of Baroda</option>
                    <option value="CANARA">Canara Bank</option>
                    <option value="UNION">Union Bank of India</option>
                    <option value="INDUSIND">IndusInd Bank</option>
                    <option value="YES">Yes Bank</option>
                  </select>
                </div>

                <div className="bank-user-id-row">
                  <label className="form-label">Customer ID / Net Banking Username (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Enter Customer ID for express single-click login" 
                    value={bankUserId}
                    onChange={(e) => setBankUserId(e.target.value)}
                    className="form-input"
                  />
                  <span className="subtext-note">You will be routed to {selectedBank}'s verified net banking portal to authenticate.</span>
                </div>
              </div>
            )}

            {/* Sub-Panel: Cash on Delivery Notice */}
            {formData.paymentMethod === 'COD' && (
              <div className="payment-subpanel cod-subpanel card">
                <div className="cod-info-box">
                  <div className="cod-icon-circle">
                    <FiTruck />
                  </div>
                  <div>
                    <h4>Cash on Delivery Selected</h4>
                    <p>
                      No advance payment is needed now. Simply pay <strong>₹{cartTotal.toLocaleString('en-IN')}</strong> in cash or via UPI to the delivery courier partner when the parcel arrives at your address.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Order Summary & Confirm Button */}
        <aside className="checkout-summary card">
          <h3 className="summary-title">Order Overview</h3>
          
          <div className="checkout-items-preview">
            {cartItems.map((item) => {
              const product = item.product || item
              const id = item.cartItemId || item.productId
              const price = product.price || item.price || 0
              const name = product.productName || product.name || 'Bespoke Creation'
              const image = product.imageUrl || product.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=150&q=80'
              return (
                <div key={id} className="preview-item-row">
                  <img src={image} alt={name} className="preview-img" />
                  <div className="preview-details">
                    <h5>{name}</h5>
                    <p>Qty: {item.quantity || 1} | Size: {item.size || 'M'}</p>
                    <span className="preview-price">₹{((price) * (item.quantity || 1)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-row">
            <span>Delivery Concierge</span>
            <span className="text-free-shipping">FREE (Season Perk)</span>
          </div>

          <div className="summary-row">
            <span>Selected Payment</span>
            <span className="payment-mode-indicator">{formData.paymentMethod}</span>
          </div>

          <div className="summary-row summary-total">
            <span>Total Payable</span>
            <span className="total-val">₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>

          {/* Dynamic Action Button according to payment mode */}
          <button 
            type="submit" 
            className="btn-primary place-order-submit-btn"
            disabled={loading}
          >
            {loading ? (
              "Processing Order..."
            ) : formData.paymentMethod === 'UPI' ? (
              `Pay ₹${cartTotal.toLocaleString('en-IN')} via ${upiMethod}`
            ) : formData.paymentMethod === 'CARD' ? (
              `Pay ₹${cartTotal.toLocaleString('en-IN')} via ${cardType === 'DEBIT' ? 'Debit' : 'Credit'} Card`
            ) : formData.paymentMethod === 'NETBANKING' ? (
              `Pay ₹${cartTotal.toLocaleString('en-IN')} via ${selectedBank}`
            ) : (
              "Confirm Cash on Delivery Order"
            )} <FiLock />
          </button>

          <p className="secure-badge-note">
            <FiShield /> 100% Encrypted & Authenticated Transaction
          </p>
        </aside>
      </form>
    </div>
  )
}

export default CheckoutPage
