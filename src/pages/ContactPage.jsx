import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiArrowLeft, FiCheck } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import './ContactPage.css'

function ContactPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    subject: '', 
    message: '' 
  })

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || ''
      }))
    }
  }, [user])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="contact-page container">
      <div className="contact-header text-center">
        <span className="contact-eyebrow">Client Concierge</span>
        <h1>Connect with Velmora</h1>
        <p>Whether inquiring about bespoke tailoring, order tracking, or styling guidance, our team is at your service.</p>
        <div className="divider"></div>
      </div>

      <div className="contact-layout">
        {/* Info Column */}
        <div className="contact-info-card card">
          <h3>The Flagship Maison</h3>
          <p>We welcome private viewings and personal bespoke styling consultations by appointment.</p>

          <div className="contact-details-list">
            <div className="c-detail-item">
              <FiMapPin className="c-icon" />
              <div>
                <strong>Atelier Address</strong>
                <p>Velmora Flagship Atelier, 123 Luxury Boulevard, Poes Garden, Chennai, India</p>
              </div>
            </div>

            <div className="c-detail-item">
              <FiPhone className="c-icon" />
              <div>
                <strong>Client Phone Concierge</strong>
                <p>+91 98765 43210 (Mon - Sat, 10 AM - 7 PM IST)</p>
              </div>
            </div>

            <div className="c-detail-item">
              <FiMail className="c-icon" />
              <div>
                <strong>Electronic Inquiries</strong>
                <p>concierge@velmora.com / atelier@velmora.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form Column */}
        <div className="contact-form-card card">
          {submitted ? (
            <div className="contact-success-box text-center">
              <FiCheckCircle className="c-success-icon" />
              <h3>Message Received with Care</h3>
              <p>A dedicated Velmora concierge associate will review your note and respond within 24 hours.</p>
              <button type="button" className="btn-secondary mt-md" onClick={() => setSubmitted(false)}>
                Send Another Inscription
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="c-form">
              <h3>Direct Concierge Inscription</h3>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anandha Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="client@luxury.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject of Inquiry</label>
                <input
                  type="text"
                  placeholder="Bespoke fitting, Order query, or Fabric consultation"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Note *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Kindly detail your inquiry or measurements..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn-primary c-submit-btn">
                Transmit Note <FiSend />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactPage
