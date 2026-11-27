import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiTrash2, FiEdit2, FiPackage, FiShoppingBag, FiDollarSign, FiUsers, FiArrowLeft } from 'react-icons/fi'
import { getAllProducts, createProduct, deleteProduct, getAllCategories } from '../../api/productApi'
import { getAllOrders } from '../../api/orderApi'
import { useAuth } from '../../context/AuthContext'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])
  const [activeTab, setActiveTab] = useState('products')
  const [loading, setLoading] = useState(true)

  const [newProd, setNewProd] = useState({
    productName: '',
    description: '',
    price: '',
    stock: '25',
    imageUrl: '',
    categoryId: '1'
  })
  const [showAddModal, setShowAddModal] = useState(false)

  const loadAdminData = async () => {
    setLoading(true)
    try {
      const [pRes, oRes, cRes] = await Promise.allSettled([
        getAllProducts(),
        getAllOrders(),
        getAllCategories()
      ])
      if (pRes.status === 'fulfilled') setProducts(pRes.value.data || [])
      if (oRes.status === 'fulfilled') setOrders(oRes.value.data || [])
      if (cRes.status === 'fulfilled') setCategories(cRes.value.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'ROLE_ADMIN') {
      navigate('/')
      return
    }
    loadAdminData()
  }, [isLoggedIn, user?.role, navigate])

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const prodName = newProd.name || newProd.productName
      const stockVal = Number(newProd.stockQuantity || newProd.stock || 25)
      await createProduct({
        name: prodName,
        description: newProd.description,
        price: Number(newProd.price),
        stockQuantity: stockVal,
        stockQuantitiy: stockVal,
        imageUrl: newProd.imageUrl,
        categoryId: Number(newProd.categoryId)
      })
      setShowAddModal(false)
      setNewProd({ productName: '', name: '', description: '', price: '', stock: '25', imageUrl: '', categoryId: '1' })
      loadAdminData()
    } catch (err) {
      alert('Failed to add product: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you wish to delete this creation?')) {
      try {
        await deleteProduct(id)
        loadAdminData()
      } catch (err) {
        alert('Delete failed')
      }
    }
  }

  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0)

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <div>
          <span className="admin-eyebrow">Maison Management Console</span>
          <h1>Velmora Administrator Atelier</h1>
        </div>
        <button 
          type="button" 
          className="btn-primary" 
          onClick={() => setShowAddModal(true)}
        >
          <FiPlus /> Inscribe New Creation
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-stats-grid">
        <div className="stat-card card">
          <FiShoppingBag className="stat-icon" />
          <div>
            <span className="stat-label">Active Creations</span>
            <h3>{products.length}</h3>
          </div>
        </div>

        <div className="stat-card card">
          <FiPackage className="stat-icon" />
          <div>
            <span className="stat-label">Orders Logged</span>
            <h3>{orders.length}</h3>
          </div>
        </div>

        <div className="stat-card card">
          <FiDollarSign className="stat-icon" />
          <div>
            <span className="stat-label">Gross Revenue</span>
            <h3>₹{totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card card">
          <FiUsers className="stat-icon" />
          <div>
            <span className="stat-label">Curated Categories</span>
            <h3>{categories.length || 4}</h3>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Product Catalog Management
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Client Orders Registry
        </button>
      </div>

      {/* Products Table */}
      {activeTab === 'products' && (
        <div className="admin-table-card card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Piece</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.productId || p.id}>
                  <td>#{p.productId || p.id}</td>
                  <td className="table-product-name">{p.productName || p.name}</td>
                  <td>{p.category?.categoryName || p.categoryName || 'Luxury Couture'}</td>
                  <td className="table-price">₹{(p.price || 0).toLocaleString('en-IN')}</td>
                  <td>{p.stock ?? 20}</td>
                  <td>
                    <button 
                      className="admin-delete-btn" 
                      onClick={() => handleDelete(p.productId || p.id)}
                      title="Remove piece"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders Table */}
      {activeTab === 'orders' && (
        <div className="admin-table-card card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Date</th>
                <th>Destination</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.orderId || o.id}>
                  <td>#VEL-{o.orderId || o.id}</td>
                  <td>{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : 'Recent'}</td>
                  <td>{o.shippingAddress?.substring(0, 35)}...</td>
                  <td className="table-price">₹{(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <span className="badge badge-primary">{o.orderStatus || 'CONFIRMED'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Inscribe New Couture Piece</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddProduct} className="modal-form">
              <div className="form-group">
                <label className="form-label">Creation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raw Silk Banarasi Tunic"
                  value={newProd.productName}
                  onChange={e => setNewProd({ ...newProd, productName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price (INR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 12500"
                  value={newProd.price}
                  onChange={e => setNewProd({ ...newProd, price: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProd.imageUrl}
                  onChange={e => setNewProd({ ...newProd, imageUrl: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  placeholder="Textile composition, craft, fit details..."
                  value={newProd.description}
                  onChange={e => setNewProd({ ...newProd, description: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
