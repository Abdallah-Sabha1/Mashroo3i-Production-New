import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/authStore'
import { auth as authApi } from '../services/api'
import Navbar from '../components/layout/Navbar'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const Profile = () => {
  const { t } = useTranslation()
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      education: user?.education || '',
      experience: user?.experience || '',
      businessInterest: user?.businessInterest || '',
    }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setSuccess('')
    try {
      await authApi.updateProfile({
        fullName: data.fullName,
        education: data.education,
        experience: data.experience,
        businessInterest: data.businessInterest,
      })
      setUser({ ...user, ...data })
      setSuccess(t('profile.updateSuccess'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Update failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('profile.title')}</h1>
          <p className="text-slate-600 dark:text-gray-400 mb-8">{t('profile.subtitle')}</p>

          {/* Avatar */}
          <Card className="mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                <span className="text-white text-xl font-bold">{user?.fullName?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{user?.fullName}</h2>
                <p className="text-sm text-slate-500 dark:text-gray-500">{user?.email}</p>
              </div>
            </div>
          </Card>

          {/* Form */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{t('profile.personalInfo')}</h3>

            {success && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400">{success}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input label={t('profile.fullName')} required error={errors.fullName?.message}
                {...register('fullName', { required: t('profile.nameRequired') })} />
              <Input label={t('profile.email')} type="email" disabled {...register('email')} className="opacity-60" />
              <Input label={t('profile.education')} placeholder={t('profile.educationPlaceholder')} {...register('education')} />
              <Input label={t('profile.experience')} placeholder={t('profile.experiencePlaceholder')} {...register('experience')} />
              <Input label={t('profile.businessInterest')} placeholder={t('profile.businessInterestPlaceholder')} {...register('businessInterest')} />
              <Button type="submit" loading={loading}>{t('profile.updateProfile')}</Button>
            </form>
          </Card>

          {/* Sign Out */}
          <Card className="!border-red-200 dark:!border-red-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('profile.account')}</h3>
            <Button variant="danger" onClick={handleLogout}>{t('profile.signOut')}</Button>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
