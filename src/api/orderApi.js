import API from './axiosConfig'

export const checkoutOrder = (userId, orderData) => API.post(`/orders/checkout/${userId}`, orderData)
export const getOrdersByUserId = (userId) => API.get(`/orders/user/${userId}`)
export const getOrderById = (orderId) => API.get(`/orders/${orderId}`)
export const getAllOrders = () => API.get('/orders')
export const updateOrderStatus = (orderId, status) => API.put(`/orders/${orderId}/status?status=${status}`)
