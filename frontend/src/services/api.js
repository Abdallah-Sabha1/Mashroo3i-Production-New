import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

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
      return Promise.reject(error)
    }

    // Attach a human-readable message to every error
    if (error.response?.status === 429) {
      error.userMessage =
        'Too many requests. Please wait a minute and try again.'
    } else if (error.response?.status >= 500) {
      error.userMessage =
        'Something went wrong on our end. Please try again in a moment.'
    } else if (!error.response) {
      error.userMessage =
        'Cannot reach the server. Please check your internet connection.'
    } else {
      error.userMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Something went wrong. Please try again.'
    }

    return Promise.reject(error)
  }
)

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
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
  delete: (ideaId) => api.delete(`/evaluation/${ideaId}`),
}

export const financial = {
  create: (ideaId, data) => api.post(`/financial/${ideaId}`, data),
  get: (ideaId) => api.get(`/financial/${ideaId}`),
}

export const businessPlan = {
  download: (ideaId) => api.get(`/businessplan/${ideaId}/download`, { responseType: 'blob' }),
}

export const getErrorMessage = (err) =>
  err?.userMessage ||
  err?.response?.data?.message ||
  err?.message ||
  'Something went wrong. Please try again.'

export default api
