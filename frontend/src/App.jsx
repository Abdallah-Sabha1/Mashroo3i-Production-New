import { lazy, Suspense, useEffect } from 'react'
import React from 'react'
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

// ✅ FIX #9: Add Error Boundary to catch component crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo)
    // TODO: Send to error tracking service (Sentry, DataDog, etc)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 p-4">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-slate-600 dark:text-gray-400 mb-8">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 p-2 bg-slate-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40 text-slate-700 dark:text-gray-300">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

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
  const { language, direction } = useLanguageStore()

  return (
    // ✅ FIX #9: Wrap with ErrorBoundary to catch component crashes
    <ErrorBoundary>
      <div key={language} dir={direction} className="min-h-screen">
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
      </div>
    </ErrorBoundary>
  )
}

export default App
