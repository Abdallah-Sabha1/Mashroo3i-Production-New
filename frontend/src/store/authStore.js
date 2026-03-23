import { create } from 'zustand'

// Safe localStorage wrapper for environments where it may be blocked
const safeStorage = {
  getItem: (key) => {
    try { return localStorage.getItem(key) } catch { return null }
  },
  setItem: (key, value) => {
    try { localStorage.setItem(key, value) } catch {}
  },
  removeItem: (key) => {
    try { localStorage.removeItem(key) } catch {}
  },
}

const useAuthStore = create((set) => ({
  user: JSON.parse(safeStorage.getItem('user') || 'null'),
  token: safeStorage.getItem('token') || null,
  isAuthenticated: !!safeStorage.getItem('token'),

  login: (userData, token) => {
    safeStorage.setItem('user', JSON.stringify(userData))
    safeStorage.setItem('token', token)
    set({ user: userData, token, isAuthenticated: true })
  },

  logout: () => {
    safeStorage.removeItem('user')
    safeStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  setUser: (userData) => {
    safeStorage.setItem('user', JSON.stringify(userData))
    set({ user: userData })
  },
}))

export default useAuthStore
