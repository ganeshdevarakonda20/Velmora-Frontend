import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiMail, FiLock, FiUser, FiArrowRight, FiAlertCircle, FiPhone, FiMapPin, FiStar, FiEye, FiEyeOff } from 'react-icons/fi'
import { loginUser, registerUser } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

function LoginPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const initialMode = searchParams.get('mode') === 'register'

  const [isRegisterMode, setIsRegisterMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    address: ''
  })
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const redirectPath = location.state?.from || '/'

  useEffect(() => {
    if (searchParams.get('mode') === 'register') {
      setIsRegisterMode(true)
    } else {
      setIsRegisterMode(false)
    }
  }, [location.search])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      if (isRegisterMode) {
        // Register flow: Pass structured individual address details to populate addresses table
        const fullAddress = formData.address || 
          `${formData.street || ''}${formData.city ? ', ' + formData.city : ''}${formData.state ? ', ' + formData.state : ''}${formData.pincode ? ' - ' + formData.pincode : ''}`.trim()

        const registerPayload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || '9876543210',
          address: fullAddress || 'India',
          street: formData.street || 'Main Street',
          city: formData.city || 'Chennai',
          state: formData.state || 'Tamil Nadu',
          pincode: formData.pincode || '600001'
        }
        await registerUser(registerPayload)
        
        // Show success confirmation and switch directly to Sign In page
        setSuccessMsg('Account created successfully! Please sign in with your credentials.')
        setIsRegisterMode(false)
        navigate('/login', { replace: true })
      } else {
        // Direct login flow: Parse AuthResponseDto returned from Spring Boot
        const loginRes = await loginUser({ email: formData.email, password: formData.password })
        const { token, userId, email, role } = loginRes.data
        const realUserId = userId || loginRes.data.user?.userId || 1
        
        const userData = {
          userId: realUserId,
          email: email || formData.email,
          name: formData.name || email?.split('@')[0] || 'Member',
          role: role || 'ROLE_CUSTOMER',
          phone: formData.phone || '',
          address: formData.address || ''
        }
        login(token, userData)
        navigate(redirectPath, { replace: true })
      }
    } catch (err) {
      console.error('Auth error:', err)
      const msg = err.response?.data?.message || err.response?.data?.error || 'Authentication failed. Please verify credentials or ensure Spring Boot backend is active.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page container">
      <div className={`auth-card card ${isRegisterMode ? 'register-wide' : ''}`}>
        <div className="auth-header">
          <div className="logo-star-badge">
            <FiStar className="star-icon" />
          </div>
          <h2>{isRegisterMode ? "Create Velmora Account" : "Sign In to Velmora"}</h2>
          <p>{isRegisterMode ? "Join our exclusive bespoke shopping community" : "Access your boutique orders, bag, and luxury wishlist"}</p>
        </div>

        {successMsg && (
          <div className="auth-success-box" style={{ padding: '0.875rem 1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #16A34A', borderRadius: '10px', color: '#16A34A', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>✓</span> <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="auth-error-box">
            <FiAlertCircle /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={`auth-form ${isRegisterMode ? 'register-grid' : ''}`}>
          {isRegisterMode && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <span className="input-icon-wrapper">
                  <FiUser className="input-icon" />
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Anandha Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input with-left-icon"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <span className="input-icon-wrapper">
                <FiMail className="input-icon" />
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input with-left-icon"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <span className="input-icon-wrapper">
                <FiLock className="input-icon" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="form-input with-left-icon with-right-icon"
              />
              <button 
                type="button" 
                className="toggle-password-visibility-btn" 
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                tabIndex="-1"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {isRegisterMode && (
            <>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <div className="input-with-icon">
                  <span className="input-icon-wrapper">
                    <FiPhone className="input-icon" />
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input with-left-icon"
                  />
                </div>
              </div>

              <div className="form-group full-span">
                <label className="form-label">Street Address</label>
                <div className="input-with-icon">
                  <span className="input-icon-wrapper">
                    <FiMapPin className="input-icon" />
                  </span>
                  <input
                    type="text"
                    name="street"
                    placeholder="Flat / House No., Street Name"
                    value={formData.street}
                    onChange={handleChange}
                    className="form-input with-left-icon"
                  />
                </div>
              </div>

              <div className="form-row-3 full-span">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Chennai"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Tamil Nadu"
                    value={formData.state}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Postal Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="600001"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn-primary auth-submit-btn full-span" 
            disabled={loading}
          >
            {loading ? "Processing..." : (isRegisterMode ? "Create Account" : "Sign In")} <FiArrowRight />
          </button>
        </form>

        <div className="auth-toggle">
          {isRegisterMode ? (
            <p>
              Already an esteemed member?{" "}
              <button 
                type="button" 
                className="toggle-mode-btn" 
                onClick={() => { setIsRegisterMode(false); setError(''); }}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New to Velmora?{" "}
              <button 
                type="button" 
                className="toggle-mode-btn" 
                onClick={() => { setIsRegisterMode(true); setError(''); }}
              >
                Register Now
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
