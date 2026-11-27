import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiArrowLeft, FiArrowUp } from 'react-icons/fi'
import './FixedHomeButton.css'

function FixedHomeButton() {
  const navigate = useNavigate()
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show on all subpages; on homepage only show if scrolled down
    if (location.pathname !== '/') {
      setVisible(true)
    } else {
      const handleScroll = () => {
        setVisible(window.scrollY > 300)
      }
      handleScroll()
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [location.pathname])

  if (!visible) return null

  const isHome = location.pathname === '/'

  const handleClick = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    // Step-by-step back navigation through the previous pages
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <button 
      type="button" 
      className="fixed-back-to-home-btn"
      onClick={handleClick}
      title={isHome ? "Back to Top" : "Go Back to Previous Page"}
      aria-label={isHome ? "Back to Top" : "Back"}
    >
      {isHome ? (
        <>
          <FiArrowUp className="fixed-nav-icon" />
          <span className="fixed-nav-text">Back to Top</span>
        </>
      ) : (
        <>
          <FiArrowLeft className="fixed-nav-arrow" />
          <span className="fixed-nav-text">Back</span>
        </>
      )}
    </button>
  )
}

export default FixedHomeButton
