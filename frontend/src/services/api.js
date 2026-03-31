import axios from 'axios'
import i18n from '../i18n'

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

    // Attach a translated human-readable message to every error
    const t = i18n.t.bind(i18n)
    if (error.response?.status === 429) {
      error.userMessage = t('common.errors.tooManyRequests')
    } else if (error.response?.status >= 500) {
      error.userMessage = t('common.errors.serverError')
    } else if (!error.response) {
      error.userMessage = t('common.errors.networkError')
    } else {
      error.userMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        t('common.errors.defaultError')
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

// ✅ FIX #7: Add optional config parameter to support AbortController signal
export const ideas = {
  create: (data, config) => api.post('/ideas', data, config),
  getAll: (config) => api.get('/ideas/user/me', config),
  getById: (id, config) => api.get(`/ideas/${id}`, config),
  update: (id, data, config) => api.put(`/ideas/${id}`, data, config),
  delete: (id, config) => api.delete(`/ideas/${id}`, config),
}

export const evaluation = {
  generate: (ideaId, config) => api.post(`/evaluation/${ideaId}`, {}, config),
  get: (ideaId, config) => api.get(`/evaluation/${ideaId}`, config),
  delete: (ideaId, config) => api.delete(`/evaluation/${ideaId}`, config),
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
