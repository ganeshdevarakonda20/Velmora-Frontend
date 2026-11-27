import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { 
  getCartByUserId, 
  addItemToCart as apiAddToCart, 
  updateCartItemQuantity as apiUpdateQty, 
  removeCartItem as apiRemoveItem, 
  clearCart as apiClearCart 
} from '../api/cartApi'

const CartContext = createContext()

export function CartProvider({ children }) {
  const { user, isLoggedIn } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  // Remove any legacy guestCart from localStorage so no items leak across sessions
  useEffect(() => {
    localStorage.removeItem('guestCart')
  }, [])

  const fetchCart = useCallback(async () => {
    if (isLoggedIn && user?.userId) {
      try {
        setLoading(true)
        const res = await getCartByUserId(user.userId)
        setCart(res.data)
      } catch (err) {
        console.error('Error fetching user cart from DB:', err)
        setCart(null)
      } finally {
        setLoading(false)
      }
    } else {
      setCart(null)
    }
  }, [isLoggedIn, user?.userId])

  useEffect(() => {
    if (isLoggedIn && user?.userId) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [isLoggedIn, user?.userId, fetchCart])

  const addToCart = async (product, quantity = 1, size = 'M') => {
    if (!isLoggedIn || !user?.userId) {
      return { success: false, requiresLogin: true, message: 'Please sign in to add items to your bag.' }
    }

    try {
      const prodId = product.productId || product.id
      const itemDto = {
        productId: prodId,
        quantity: quantity
      }
      const res = await apiAddToCart(user.userId, itemDto)
      setCart(res.data)
      return { success: true }
    } catch (err) {
      console.error('Add to cart error:', err)
      return { 
        success: false, 
        message: err.response?.data?.message || err.response?.data?.error || 'Failed to add item to bag.' 
      }
    }
  }

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      return removeItem(cartItemId)
    }
    if (isLoggedIn && user?.userId) {
      try {
        const res = await apiUpdateQty(user.userId, cartItemId, quantity)
        setCart(res.data)
      } catch (err) {
        console.error('Update qty error:', err)
      }
    }
  }

  const removeItem = async (cartItemId) => {
    if (isLoggedIn && user?.userId) {
      try {
        const res = await apiRemoveItem(user.userId, cartItemId)
        setCart(res.data)
      } catch (err) {
        console.error('Remove item error:', err)
      }
    }
  }

  const clearCurrentCart = async () => {
    if (isLoggedIn && user?.userId) {
      try {
        await apiClearCart(user.userId)
      } catch (err) {
        console.error('Clear cart error:', err)
      }
    }
    setCart(null)
    localStorage.removeItem('guestCart')
  }

  // Items are strictly sourced from the logged-in user's database cart
  const cartItems = (isLoggedIn && cart?.items) ? cart.items : []

  const cartCount = cartItems.reduce((acc, item) => acc + Number(item.quantity || 1), 0)

  const computedItemsTotal = cartItems.reduce((acc, item) => {
    const unitPrice = Number(item.price || item.product?.price || 0)
    const qty = Number(item.quantity || 1)
    const itemTotal = item.subTotal != null && Number(item.subTotal) > 0
      ? Number(item.subTotal)
      : unitPrice * qty
    return acc + itemTotal
  }, 0)

  const cartTotal = computedItemsTotal > 0 ? computedItemsTotal : Number(cart?.totalPrice || 0)

  return (
    <CartContext.Provider value={{
      cart,
      cartItems,
      cartCount,
      cartTotal,
      loading,
      addToCart,
      updateQuantity,
      removeItem,
      clearCurrentCart,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
