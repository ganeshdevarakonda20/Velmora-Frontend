import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FiPackage, 
  FiCalendar, 
  FiClock, 
  FiCheckCircle, 
  FiArrowLeft, 
  FiTruck, 
  FiCheck, 
  FiCreditCard, 
  FiMapPin 
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { getOrdersByUserId } from '../api/orderApi'
import './OrdersPage.css'

function OrdersPage() {
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/orders' } })
      return
    }
    async function fetchOrders() {
      setLoading(true)
      try {
        if (isLoggedIn && user?.userId) {
          const res = await getOrdersByUserId(user.userId)
          if (res.data && Array.isArray(res.data)) {
            setOrders(res.data)
          } else {
            setOrders([])
          }
        } else {
          setOrders([])
        }
      } catch (err) {
        console.error('Error fetching orders from DB:', err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [isLoggedIn, user?.userId, navigate])

  // Helper to determine realistic tracking step (1 to 4)
  const getOrderProgress = (orderDate, rawStatus) => {
    const statusUpper = (rawStatus || '').toUpperCase()
    if (statusUpper === 'DELIVERED') return 4
    if (statusUpper === 'CANCELLED') return 0
    if (statusUpper === 'SHIPPED') return 3

    // Calculate elapsed time since order
    const createdTime = orderDate ? new Date(orderDate).getTime() : Date.now()
    const hoursElapsed = (Date.now() - createdTime) / (1000 * 60 * 60)

    if (hoursElapsed > 48) return 3 // Shipped / In Transit
    if (hoursElapsed > 12) return 2 // Processing & Tailoring
    return 2 // Default to Processing & Tailoring for fresh orders
  }

  return (
    <div className="orders-page container">
      <div className="orders-header">
        <h1>My Orders & Tracking</h1>
        <p>Review real-time status, packaging schedules, and delivery transit of your Velmora orders.</p>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : orders.length === 0 ? (
        <div className="empty-orders-box card">
          <FiPackage className="empty-pkg-icon" />
          <h3>No Orders Recorded</h3>
          <p>You have not placed any orders yet. Discover our latest collections from Zara, Snitch, and Rare Rabbit.</p>
          <Link to="/products" className="btn-primary mt-md">Explore Boutique</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const dateStr = order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Recent'

            const progressStep = getOrderProgress(order.orderDate, order.status || order.orderStatus)
            const items = order.items || order.orderItems || []
            const paymentMethodStr = order.paymentMethod || 'Online Payment'

            return (
              <div key={order.orderId || order.id} className="order-card card">
                {/* Header bar */}
                <div className="order-card-header">
                  <div>
                    <span className="order-id">Order Ref: <strong>#VEL-{order.orderId || order.id}</strong></span>
                    <span className="order-date"><FiCalendar /> Placed on {dateStr}</span>
                  </div>
                  <div className="order-status-badge-wrap">
                    <span className={`status-badge ${progressStep >= 3 ? 'status-shipped' : 'status-processing'}`}>
                      <FiClock /> {progressStep >= 3 ? 'Shipped & In Transit' : 'Processing'}
                    </span>
                  </div>
                </div>

                {/* Visual 4-Step Progress Tracking Stepper */}
                <div className="order-stepper-container">
                  <div className="stepper-track">
                    <div 
                      className="stepper-fill" 
                      style={{ width: progressStep === 4 ? '100%' : progressStep === 3 ? '70%' : '35%' }}
                    ></div>
                  </div>

                  <div className="stepper-steps-row">
                    <div className="stepper-node completed">
                      <div className="node-circle"><FiCheck /></div>
                      <span className="node-title">Order Confirmed</span>
                      <span className="node-desc">Payment Verified</span>
                    </div>

                    <div className={`stepper-node ${progressStep >= 2 ? 'active' : ''}`}>
                      <div className="node-circle">
                        {progressStep > 2 ? <FiCheck /> : <FiClock />}
                      </div>
                      <span className="node-title">Processing</span>
                      <span className="node-desc">Packed & Ready</span>
                    </div>

                    <div className={`stepper-node ${progressStep >= 3 ? 'active' : ''}`}>
                      <div className="node-circle">
                        {progressStep > 3 ? <FiCheck /> : <FiTruck />}
                      </div>
                      <span className="node-title">Shipped & In Transit</span>
                      <span className="node-desc">BlueDart Express</span>
                    </div>

                    <div className={`stepper-node ${progressStep >= 4 ? 'completed' : ''}`}>
                      <div className="node-circle">
                        <FiPackage />
                      </div>
                      <span className="node-title">Delivered</span>
                      <span className="node-desc">To Doorstep</span>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="order-items-table">
                  {items.map((item, idx) => (
                    <div key={idx} className="order-item-line">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.productName || "Product"} 
                          className="order-item-thumb" 
                        />
                      )}
                      <div className="item-name-col">
                        <h6>{item.productName || item.product?.productName || item.name || "Velmora Designer Apparel"}</h6>
                        <span>Size: {item.size || 'M'} | SKU: VEL-{item.productId || 100 + idx}</span>
                      </div>
                      <div className="item-qty-col">Qty: {item.quantity || 1}</div>
                      <div className="item-price-col">₹{(item.price || item.subTotal || 0).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>

                {/* Footer details */}
                <div className="order-card-footer">
                  <div className="shipping-dest">
                    <strong><FiMapPin /> Delivery Address:</strong>
                    <p>{order.shippingAddress || (user?.address ? user.address : "Client Registered Address")}</p>
                    <span className="order-pm-badge"><FiCreditCard /> Mode: {paymentMethodStr}</span>
                  </div>
                  <div className="order-card-total">
                    <span>Order Total:</span>
                    <strong>₹{(order.totalAmount || 0).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
