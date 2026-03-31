import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../../store/authStore'
import useLanguageStore from '../../store/languageStore'
import { useDarkMode } from '../../utils/darkMode'
import Button from '../ui/Button'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { language, toggleLanguage } = useLanguageStore()
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isDark, toggleDark] = useDarkMode()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
    setProfileOpen(false)
  }

  const isRtl = language === 'ar'
  const isLanding = location.pathname === '/'

  return (
    <nav className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
      isLanding
        ? 'bg-transparent border-white/10'
        : 'bg-white dark:bg-gray-950 border-slate-200 dark:border-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient-primary" dir="ltr">
              Mashroo3i
            </span>
          </Link>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-1">
              {[
                { to: '/dashboard',   label: t('nav.dashboard') },
                { to: '/submit-idea', label: t('nav.newIdea')   },
                { to: '/profile',     label: t('nav.profile')   },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1">
              {[
                { href: '#features', label: t('nav.features') },
                { href: '#about',    label: t('nav.about')    },
              ].map(item => (
                <a key={item.href} href={item.href} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLanding
                    ? 'text-hero-muted hover:text-white hover:bg-white/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                }`}>
                  {item.label}
                </a>
              ))}
            </div>
          )}

          <div className="hidden md:flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                isLanding
                  ? 'border-white/20 text-white/80 hover:bg-white/10'
                  : 'border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800'
              }`}
              title={isRtl ? 'Switch to English' : 'التبديل للعربية'}
              dir="ltr"
            >
              {isRtl ? 'EN' : 'AR'}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className={`p-2 rounded-lg transition-colors ${
                isLanding
                  ? 'text-white/70 hover:bg-white/10 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
              aria-label={isDark ? t('nav.lightMode') : t('nav.darkMode')}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{user?.fullName?.charAt(0) || 'U'}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{user?.fullName?.split(' ')[0]}</span>
                  <svg className="w-4 h-4 text-slate-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute end-0 mt-2 w-56 bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-slate-200 dark:border-gray-800 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.fullName}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
                        {t('nav.profile')}
                      </Link>
                      <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
                        {t('nav.dashboard')}
                      </Link>
                      <div className="border-t border-slate-100 dark:border-gray-800 mt-1 pt-1">
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 w-full transition-colors">
                          {t('nav.signOut')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">{t('nav.signIn')}</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">{t('nav.getStarted')}</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {/* Language toggle (mobile) */}
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-gray-700 text-xs font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              dir="ltr"
            >
              {isRtl ? 'EN' : 'AR'}
            </button>
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label={isDark ? t('nav.lightMode') : t('nav.darkMode')}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard"   onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800">{t('nav.dashboard')}</Link>
                  <Link to="/submit-idea" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800">{t('nav.newIdea')}</Link>
                  <Link to="/profile"     onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800">{t('nav.profile')}</Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="block w-full text-start px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">{t('nav.signOut')}</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800">{t('nav.signIn')}</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full" size="sm">{t('nav.getStarted')}</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
