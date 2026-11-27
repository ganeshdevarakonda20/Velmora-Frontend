import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiSave, 
  FiCheckCircle, 
  FiArrowLeft, 
  FiPackage, 
  FiTrash2, 
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { getCurrentUser, updateUserProfile, getAddressesByUserId } from '../api/authApi'
import './ProfilePage.css'

function ProfilePage() {
  const { user, isLoggedIn, updateUser } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    address: user?.address || ''
  })
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isCleared, setIsCleared] = useState(false)
  const [loadingDb, setLoadingDb] = useState(false)

  // Fetch live fresh profile directly from backend database on mount
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    async function loadFreshFromDb() {
      setLoadingDb(true)
      try {
        const res = await getCurrentUser()
        if (res.data) {
          const dbUser = res.data
          const cleanAddr = (raw, userName) => {
            if (!raw || raw === 'None') return ''
            let cleaned = raw.replace(/\.?\s*Phone:\s*.*$/i, '').trim()
            if (userName) {
              const prefix = `${userName.trim()},`
              if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
                cleaned = cleaned.slice(prefix.length).trim()
              }
            }
            return cleaned
          }

          const rawAddr = cleanAddr(dbUser.address, dbUser.name)
          
          // Parse fallback from users.address if comma-separated (without username/phone)
          let parsedStreet = rawAddr
          let parsedCity = ''
          let parsedState = ''
          let parsedPin = ''

          if (rawAddr.includes(',')) {
            const parts = rawAddr.split(',').map(s => s.trim()).filter(Boolean)
            parsedStreet = parts[0] || ''
            if (parts[1]) {
              if (parts[1].includes('-')) {
                const cityPin = parts[1].split('-').map(s => s.trim())
                parsedCity = cityPin[0] || ''
                parsedPin = cityPin[1] || ''
              } else {
                parsedCity = parts[1]
              }
            }
            if (parts[2]) {
              if (parts[2].includes('-')) {
                const statePin = parts[2].split('-').map(s => s.trim())
                parsedState = statePin[0] || ''
                parsedPin = parsedPin || statePin[1] || ''
              } else {
                parsedState = parts[2]
              }
            }
          }

          // Fetch structured address directly from MySQL addresses table by userId
          if (dbUser.userId) {
            try {
              const addrRes = await getAddressesByUserId(dbUser.userId)
              if (Array.isArray(addrRes.data) && addrRes.data.length > 0) {
                const dbAddr = addrRes.data[0]
                const sanitizedStreet = cleanAddr(dbAddr.street, dbUser.name)
                if (sanitizedStreet && sanitizedStreet.includes(',')) {
                  const sParts = sanitizedStreet.split(',').map(s => s.trim()).filter(Boolean)
                  parsedStreet = sParts[0] || sanitizedStreet
                } else if (sanitizedStreet) {
                  parsedStreet = sanitizedStreet
                }
                parsedCity = dbAddr.city || parsedCity
                parsedState = dbAddr.state || parsedState
                parsedPin = dbAddr.pincode || parsedPin
              }
            } catch (addrErr) {
              console.warn('Could not load structured address from addresses table:', addrErr.message)
            }
          }

          setFormData({
            name: dbUser.name || '',
            email: dbUser.email || '',
            phone: (dbUser.phone && dbUser.phone !== 'None') ? dbUser.phone : '',
            street: parsedStreet,
            city: parsedCity,
            state: parsedState,
            pincode: parsedPin,
            address: rawAddr
          })
          updateUser(dbUser)
        }
      } catch (err) {
        console.warn('Using cached user profile data:', err)
        if (user) {
          setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || ''
          }))
        }
      } finally {
        setLoadingDb(false)
      }
    }

    loadFreshFromDb()
  }, [isLoggedIn, navigate])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccessMsg('')
    setErrorMsg('')
  }

  // Update profile in backend and session
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')

    const cityPin = formData.city
      ? (formData.pincode ? `${formData.city.trim()} - ${formData.pincode.trim()}` : formData.city.trim())
      : (formData.pincode ? formData.pincode.trim() : '')
    const fullAddress = [formData.street?.trim(), cityPin, formData.state?.trim()].filter(Boolean).join(', ') || formData.address

    const updatePayload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: fullAddress,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode
    }

    try {
      if (user?.userId) {
        const res = await updateUserProfile(user.userId, updatePayload)
        if (res.data) {
          updateUser(res.data)
        } else {
          updateUser(updatePayload)
        }
      } else {
        updateUser(updatePayload)
      }

      setFormData(prev => ({ ...prev, address: fullAddress }))
      setSuccessMsg('Profile and addresses updated in database! Details will auto-fill during checkout.')
      
      // Reactive Button Animation Trigger
      setIsSaved(true)
      setTimeout(() => {
        setIsSaved(false)
      }, 2500)
    } catch (err) {
      console.error('Error saving profile:', err)
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to update details in database. Please check inputs.'
      setErrorMsg(msg)
    } finally {
      setSaving(false)
    }
  }

  // Delete / Clear saved delivery details
  const handleDeleteDetails = async () => {
    if (window.confirm('Are you sure you wish to delete and clear your saved phone number and address from the database?')) {
      setSaving(true)
      setSuccessMsg('')
      setErrorMsg('')

      try {
        setFormData(prev => ({
          ...prev,
          phone: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          address: ''
        }))

        if (user?.userId) {
          await updateUserProfile(user.userId, {
            name: formData.name,
            email: formData.email,
            phone: 'None',
            address: 'None',
            street: '',
            city: '',
            state: '',
            pincode: ''
          }).catch(e => console.warn('Backend clear notice:', e))
        }

        updateUser({
          phone: '',
          address: ''
        })

        setSuccessMsg('Saved address and contact details cleared from the database.')
        setIsCleared(true)
        setTimeout(() => setIsCleared(false), 2200)
      } catch (err) {
        console.error('Error deleting details:', err)
      } finally {
        setSaving(false)
      }
    }
  }

  return (
    <div className="profile-page container">
      <div className="profile-layout">
        {/* Left Side Profile Card */}
        <aside className="profile-sidebar card">
          <div className="profile-avatar-box">
            <div className="avatar-circle">
              <FiUser />
            </div>
            <h3>{formData.name || user?.name || 'Customer'}</h3>
            <p className="profile-email-badge">{formData.email || user?.email || 'user@example.com'}</p>
            <span className="profile-role-pill">
              {typeof user?.role === 'object' && user.role !== null
                ? (user.role.roleName || 'CUSTOMER')
                : (user?.role || 'CUSTOMER')}
            </span>
          </div>

          <div className="profile-nav-links">
            <button className="profile-tab-btn active">
              <FiUser /> Personal Details
            </button>
            <Link to="/orders" className="profile-tab-btn">
              <FiPackage /> My Orders & Tracking
            </Link>
          </div>
        </aside>

        {/* Right Side Form to Update or Delete Details */}
        <div className="profile-content-card card">
          <div className="profile-card-header">
            <div>
              <h2>Account & Address Details</h2>
              <p>View, update, or clear your saved delivery address and contact information.</p>
            </div>
          </div>

          {successMsg && (
            <div className="profile-success-box">
              <FiCheckCircle className="p-success-icon" /> <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="profile-error-box">
              <FiAlertCircle className="p-error-icon" /> <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-with-icon">
                <FiUser className="input-icon" />
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

            <div className="form-group">
              <label className="form-label">Email Address (Primary Login)</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  disabled
                  value={formData.email}
                  className="form-input with-left-icon input-disabled"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone Number</label>
              <div className="input-with-icon">
                <FiPhone className="input-icon" />
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

            {/* Structured Address Section */}
            <div className="profile-address-subcard">
              <h4 className="subcard-title"><FiMapPin /> Registered Delivery Address</h4>

              <div className="form-group">
                <label className="form-label">Street / Flat / House Address</label>
                <input
                  type="text"
                  name="street"
                  placeholder="Flat No. 4B, Crescent Villa, Green Avenue"
                  value={formData.street}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-grid-3">
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
            </div>

            {/* Dual CTAs: Save (with Reactive Animation) & Delete Details */}
            <div className="profile-actions-row">
              <button 
                type="submit" 
                className={`btn-primary profile-save-btn ${isSaved ? 'saved-success-reactive' : ''}`} 
                disabled={saving}
              >
                {isSaved ? (
                  <>
                    <FiCheck className="pop-check-icon" />
                    <span>Profile Saved</span>
                  </>
                ) : saving ? (
                  <span>Saving Changes...</span>
                ) : (
                  <>
                    <FiSave />
                    <span>Save Profile Details</span>
                  </>
                )}
              </button>

              <button 
                type="button" 
                onClick={handleDeleteDetails} 
                className={`profile-delete-btn ${isCleared ? 'cleared-reactive' : ''}`}
                disabled={saving || (!formData.phone && !formData.street && !formData.address && !isCleared)}
                title="Clear saved address and phone from database"
              >
                {isCleared ? (
                  <>
                    <FiCheck className="pop-check-icon" />
                    <span>Details Cleared</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 /> Delete / Clear Details
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
