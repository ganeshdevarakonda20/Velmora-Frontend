import API from './axiosConfig'

export const loginUser = (credentials) => API.post('/auth/login', credentials)
export const registerUser = (userData) => API.post('/auth/register', userData)
export const getCurrentUser = () => API.get('/auth/me')
export const getUserById = (userId) => API.get(`/users/${userId}`)
export const updateUserProfile = (userId, userData) => API.put(`/users/${userId}`, userData)
