import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import FixedHomeButton from './FixedHomeButton'
import './Layout.css'

function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      {/* Permanent Fixed Back-to-Home button that stays visible while scrolling */}
      <FixedHomeButton />
    </div>
  )
}

export default Layout
