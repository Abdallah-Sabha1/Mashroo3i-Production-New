import { useState, useEffect } from 'react'

function getStoredTheme() {
  try {
    return localStorage.getItem('theme')
  } catch {
    return null
  }
}

function setStoredTheme(theme) {
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // localStorage not available
  }
}

function getSystemPreference() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(isDark) {
  const root = document.documentElement
  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = getStoredTheme()
    if (stored === 'dark') return true
    if (stored === 'light') return false
    return getSystemPreference()
  })

  useEffect(() => {
    applyTheme(isDark)
  }, [isDark])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      const stored = getStoredTheme()
      if (!stored) {
        setIsDark(e.matches)
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev
      setStoredTheme(next ? 'dark' : 'light')
      return next
    })
  }

  return [isDark, toggleDark]
}

export default useDarkMode
