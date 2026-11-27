import API from './axiosConfig'

export const getAllProducts = () => API.get('/products')
export const getProductById = (id) => API.get(`/products/${id}`)
export const getProductsByCategory = (categoryId) => API.get(`/products/category/${categoryId}`)
export const searchProducts = (keyword) => API.get(`/products/search?keyword=${encodeURIComponent(keyword)}`)
export const createProduct = (productData) => API.post('/products', productData)
export const updateProduct = (id, productData) => API.put(`/products/${id}`, productData)
export const deleteProduct = (id) => API.delete(`/products/${id}`)

export const getAllCategories = () => API.get('/categories')
export const getCategoryById = (id) => API.get(`/categories/${id}`)
export const createCategory = (data) => API.post('/categories', data)
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data)
export const deleteCategory = (id) => API.delete(`/categories/${id}`)
