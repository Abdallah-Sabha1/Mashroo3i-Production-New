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
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || t('auth.register.errors.failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen section-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-3xl font-bold text-gradient-primary mb-2">
              Mashroo3i
            </h1>
          </Link>
          <p className="text-hero-muted">{t('auth.register.subtitle')}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label={t('auth.register.fullName')}
              placeholder={t('auth.register.fullNamePlaceholder')}
              required
              error={errors.fullName?.message}
              {...register('fullName', { required: t('auth.register.errors.nameRequired') })}
            />
            <Input
              label={t('auth.register.email')}
              type="email"
              placeholder={t('auth.register.emailPlaceholder')}
              required
              error={errors.email?.message}
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
              {...register('password', {
                required: t('auth.register.errors.passwordRequired'),
                minLength: { value: 8, message: t('auth.register.errors.passwordMin') }
              })}
            />
            <Input
              label={t('auth.register.education')}
              placeholder={t('auth.register.educationPlaceholder')}
              {...register('education')}
            />
            <Input
              label={t('auth.register.experience')}
              placeholder={t('auth.register.experiencePlaceholder')}
              {...register('experience')}
            />
            <Input
              label={t('auth.register.businessInterest')}
              placeholder={t('auth.register.businessInterestPlaceholder')}
              {...register('businessInterest')}
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {t('auth.register.createAccount')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-gray-400">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300">
              {t('auth.register.signIn')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
