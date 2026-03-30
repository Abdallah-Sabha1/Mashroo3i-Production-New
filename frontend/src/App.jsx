import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { PageLoading } from './components/ui/Loading'
import useAuthStore from './store/authStore'
import useLanguageStore from './store/languageStore'
import i18n from './i18n'

const Landing            = lazy(() => import('./pages/Landing'))
const Register           = lazy(() => import('./pages/Register'))
const Login              = lazy(() => import('./pages/Login'))
const Dashboard          = lazy(() => import('./pages/Dashboard'))
const SubmitIdea         = lazy(() => import('./pages/SubmitIdea'))
const Evaluation         = lazy(() => import('./pages/Evaluation'))
const Financial          = lazy(() => import('./pages/Financial'))
const FinancialProjections = lazy(() => import('./pages/FinancialProjections'))
const BusinessPlan       = lazy(() => import('./pages/BusinessPlan'))
const Profile            = lazy(() => import('./pages/Profile'))

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

const App = () => {
  const { language, setLanguage } = useLanguageStore()

  useEffect(() => {
    const saved = localStorage.getItem('mashroo3i_lang') || 'ar'
    document.documentElement.lang = saved
    document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
    i18n.changeLanguage(saved)
    if (saved !== language) setLanguage(saved)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ToastProvider>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/"                             element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/register"                     element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/login"                        element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/dashboard"                    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/submit-idea"                  element={<ProtectedRoute><SubmitIdea /></ProtectedRoute>} />
          <Route path="/evaluation/:ideaId"           element={<ProtectedRoute><Evaluation /></ProtectedRoute>} />
          <Route path="/financial/:ideaId"            element={<ProtectedRoute><Financial /></ProtectedRoute>} />
          <Route path="/financial-projections/:ideaId" element={<ProtectedRoute><FinancialProjections /></ProtectedRoute>} />
          <Route path="/business-plan/:ideaId"        element={<ProtectedRoute><BusinessPlan /></ProtectedRoute>} />
          <Route path="/profile"                      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*"                             element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  )
}

export default App
