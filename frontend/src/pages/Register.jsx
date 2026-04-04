import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { auth } from '../services/api'
import useAuthStore from '../store/authStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const Register = () => {
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
      const res = await auth.register(data)
      login(res.data, res.data.token)
      navigate('/dashboard?welcome=true')
    } catch (err) {
      setError(err.response?.data?.message || t('auth.register.errors.failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: dark branding ── */}
      <div className="hidden lg:flex lg:w-5/12 section-hero flex-col justify-between p-12">
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
              {t('auth.register.heroTitle', 'Start your entrepreneurial journey')}
            </h2>
            <p className="text-hero-muted text-lg mb-10">
              {t('auth.register.heroSubtitle', 'Join thousands of Jordanian entrepreneurs who validated their ideas with Mashroo3i.')}
            </p>

            <div className="space-y-4">
              {[
                { label: t('auth.register.stat1Label', 'Ideas evaluated'), value: '2,400+' },
                { label: t('auth.register.stat2Label', 'Success rate'), value: '68%' },
                { label: t('auth.register.stat3Label', 'Avg. score improvement'), value: '34pts' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="stat-card-hero rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <span className="text-gray-400 text-sm">{item.label}</span>
                  <span className="text-emerald-400 font-bold text-lg">{item.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <p className="text-gray-600 text-xs">© 2025 Mashroo3i. {t('auth.login.rights', 'All rights reserved.')}</p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md py-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/">
              <h1 className="text-2xl font-bold text-gradient-primary">Mashroo3i</h1>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
              {t('auth.register.title', 'Create your account')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('auth.register.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t('auth.register.fullName')}
              placeholder={t('auth.register.fullNamePlaceholder')}
              required
              error={errors.fullName?.message}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              {...register('fullName', { required: t('auth.register.errors.nameRequired') })}
            />
            <Input
              label={t('auth.register.email')}
              type="email"
              placeholder={t('auth.register.emailPlaceholder')}
              required
              error={errors.email?.message}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              {...register('email', {
                required: t('auth.register.errors.emailRequired'),
                pattern: { value: /^\S+@\S+$/i, message: t('auth.register.errors.emailInvalid') }
              })}
            />
            <Input
              label={t('auth.register.password')}
              type="password"
              placeholder={t('auth.register.passwordPlaceholder')}
              required
              error={errors.password?.message}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              {...register('password', {
                required: t('auth.register.errors.passwordRequired'),
                minLength: { value: 8, message: t('auth.register.errors.passwordMin') }
              })}
            />
            <Input
              label={t('auth.register.education')}
              placeholder={t('auth.register.educationPlaceholder')}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              }
              {...register('education')}
            />
            <Input
              label={t('auth.register.experience')}
              placeholder={t('auth.register.experiencePlaceholder')}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              {...register('experience')}
            />
            <Input
              label={t('auth.register.businessInterest')}
              placeholder={t('auth.register.businessInterestPlaceholder')}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              {...register('businessInterest')}
            />

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              {t('auth.register.createAccount')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
              {t('auth.register.signIn')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
