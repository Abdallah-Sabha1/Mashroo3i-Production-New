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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Mashroo3i
            </h1>
          </Link>
          <p className="text-slate-600 dark:text-gray-400">{t('auth.login.subtitle')}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label={t('auth.login.email')}
              type="email"
              placeholder={t('auth.login.emailPlaceholder')}
              required
              error={errors.email?.message}
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
              {...register('password', { required: t('auth.login.errors.passwordRequired') })}
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {t('auth.login.signIn')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-gray-400">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              {t('auth.login.signUp')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
