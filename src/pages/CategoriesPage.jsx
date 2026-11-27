import { Link, useNavigate } from 'react-router-dom'
import { FiCompass, FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import './CategoriesPage.css'

const CATEGORY_LIST = [
  {
    id: 1,
    name: "Women's Haute Couture",
    slug: "Women",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80",
    desc: "Fluid dresses, raw silk tunics, and sculpted bespoke skirts."
  },
  {
    id: 2,
    name: "Men's Tailored Silhouettes",
    slug: "Men",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80",
    desc: "Sharply cut suits, linen trench coats, and hand-woven shirts."
  },
  {
    id: 3,
    name: "Haute Ethnic & Traditional Weaves",
    slug: "Ethnic",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80",
    desc: "Heritage zardozi sherwanis, Chanderi kurtas, and Banarasi craft."
  },
  {
    id: 4,
    name: "Aesthetic Outerwear & Overcoats",
    slug: "Outerwear",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=700&q=80",
    desc: "Heavyweight organic cotton trenches, cashmere capes, and drapes."
  }
]

function CategoriesPage() {
  const navigate = useNavigate()

  return (
    <div className="categories-page container">
      <div className="categories-header text-center">
        <span className="cat-eyebrow">Curated Universes</span>
        <h1>Atelier Categories</h1>
        <p>Explore the specialized aesthetic domains that comprise the Velmora maison.</p>
        <div className="divider"></div>
      </div>

      <div className="categories-full-grid">
        {CATEGORY_LIST.map((cat) => (
          <div key={cat.id} className="category-full-card card">
            <div className="cat-card-img-box">
              <img src={cat.image} alt={cat.name} className="cat-card-img" />
            </div>
            <div className="cat-card-content">
              <h3>{cat.name}</h3>
              <p>{cat.desc}</p>
              <Link to={`/products?category=${cat.slug}`} className="btn-primary cat-action-btn">
                Browse Collection <FiArrowRight />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoriesPage
