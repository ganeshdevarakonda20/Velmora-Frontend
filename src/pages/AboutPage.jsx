import { Link, useNavigate } from 'react-router-dom'
import { FiAward, FiCheck, FiCompass, FiFeather, FiArrowLeft } from 'react-icons/fi'
import './AboutPage.css'

function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container text-center">
          <span className="about-eyebrow">The Maison Heritage</span>
          <h1>The Story of Velmora</h1>
          <p>Where contemporary high fashion meets the sacred art of mindful craft.</p>
        </div>
      </div>

      <div className="container about-content">
        <div className="about-grid-2">
          <div className="about-text-col">
            <span className="section-subtitle">Our Philosophy</span>
            <h2>Created for Discerning Connoisseurs of Style</h2>
            <p>
              Velmora was established upon a singular, resolute conviction: that true luxury is not fast, 
              ephemeral, or mass-produced. True luxury is an intimate synergy between artisan mastery, 
              noble natural textiles, and effortless elegance.
            </p>
            <p>
              Every garment carrying the Velmora seal is conceived as wearable poetry—cut with mathematical 
              precision and sewn by master craftsmen who have practiced their trade for generations.
            </p>
          </div>
          <div className="about-img-col card">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" 
              alt="Velmora Studio Craft" 
            />
          </div>
        </div>

        <div className="pillars-section">
          <div className="section-heading">
            <span className="section-subtitle">Core Tenets</span>
            <h2>The Four Velmora Pillars</h2>
            <div className="divider"></div>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card card">
              <FiFeather className="pillar-icon" />
              <h4>Noble Textiles</h4>
              <p>We source only unadulterated mulberry silks, long-staple organic linens, and breathable virgin wools.</p>
            </div>

            <div className="pillar-card card">
              <FiAward className="pillar-icon" />
              <h4>Atelier Standard</h4>
              <p>Every seam, buttonhole, and lapel is inspected under strict couture guild quality benchmarks.</p>
            </div>

            <div className="pillar-card card">
              <FiCompass className="pillar-icon" />
              <h4>Timeless Aesthetics</h4>
              <p>Silhouettes designed to outlast transient fashion seasons and remain perpetually refined.</p>
            </div>

            <div className="pillar-card card">
              <FiCheck className="pillar-icon" />
              <h4>Ethical Stewardship</h4>
              <p>Fair living wages for artisans and sustainable closed-loop natural dye processes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
