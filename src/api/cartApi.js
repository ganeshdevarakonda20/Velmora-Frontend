import API from './axiosConfig'

export const getCartByUserId = (userId) => API.get(`/cart/user/${userId}`)
export const addItemToCart = (userId, itemDto) => API.post(`/cart/user/${userId}/items`, itemDto)
export const updateCartItemQuantity = (userId, cartItemId, quantity) => 
  API.put(`/cart/user/${userId}/items/${cartItemId}?quantity=${quantity}`)
export const removeCartItem = (userId, cartItemId) => 
  API.delete(`/cart/user/${userId}/items/${cartItemId}`)
export const clearCart = (userId) => API.delete(`/cart/user/${userId}`)
