import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { auth } from '../services/api'
import useAuthStore from '../store/authStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const Login = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const res = await auth.login(data)
      login(res.data, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || t('auth.login.errors.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: dark branding ── */}
      <div className="hidden lg:flex lg:w-1/2 section-hero flex-col justify-between p-12">
        <Link to="/">
          <span className="text-2xl font-bold text-gradient-primary">Mashroo3i</span>
        </Link>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-50 leading-snug mb-4">
              {t('auth.login.heroTitle', 'Turn your idea into a business plan')}
            </h2>
            <p className="text-hero-muted text-lg mb-10">
              {t('auth.login.heroSubtitle', 'AI-powered evaluation, financial projections, and strategic insights — all in one place.')}
            </p>

            <div className="space-y-5">
              {[
                { icon: '⚡', text: t('auth.login.feature1', 'Instant AI evaluation in seconds') },
                { icon: '📊', text: t('auth.login.feature2', 'Detailed financial projections') },
                { icon: '🎯', text: t('auth.login.feature3', 'SWOT analysis & risk assessment') },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl feature-icon flex items-center justify-center text-lg flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-gray-300 text-sm">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <p className="text-gray-600 text-xs">© 2025 Mashroo3i. {t('auth.login.rights', 'All rights reserved.')}</p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/">
              <h1 className="text-2xl font-bold text-gradient-primary">Mashroo3i</h1>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
              {t('auth.login.title', 'Welcome back')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('auth.login.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label={t('auth.login.email')}
              type="email"
              placeholder={t('auth.login.emailPlaceholder')}
              required
              error={errors.email?.message}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              {...register('email', {
                required: t('auth.login.errors.emailRequired'),
                pattern: { value: /^\S+@\S+$/i, message: t('auth.login.errors.emailInvalid') }
              })}
            />
            <Input
              label={t('auth.login.password')}
              type="password"
              placeholder={t('auth.login.passwordPlaceholder')}
              required
              error={errors.password?.message}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              {...register('password', { required: t('auth.login.errors.passwordRequired') })}
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {t('auth.login.signIn')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
              {t('auth.login.signUp')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
