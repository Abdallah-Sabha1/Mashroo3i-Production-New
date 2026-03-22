import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:44395/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor - add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

export const ideas = {
  create: (data) => api.post('/ideas', data),
  getAll: () => api.get('/ideas/user/me'),
  getById: (id) => api.get(`/ideas/${id}`),
  update: (id, data) => api.put(`/ideas/${id}`, data),
  delete: (id) => api.delete(`/ideas/${id}`),
}

export const evaluation = {
  generate: (ideaId) => api.post(`/evaluation/${ideaId}`),
  get: (ideaId) => api.get(`/evaluation/${ideaId}`),
}

export const financial = {
  create: (ideaId, data) => api.post(`/financial/${ideaId}`, data),
  get: (ideaId) => api.get(`/financial/${ideaId}`),
}

export const businessPlan = {
  download: (ideaId) => api.get(`/businessplan/${ideaId}/download`, { responseType: 'blob' }),
}

export default api
