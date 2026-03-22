import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { auth } from '../services/api'
import useAuthStore from '../store/authStore'
import Navbar from '../components/layout/Navbar'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const Profile = () => {
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
      // For now, update local state
      setUser({ ...user, ...data })
      setSuccess('Profile updated successfully!')
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile Settings</h1>
          <p className="text-slate-500 mb-8">Manage your account information.</p>

          {/* Avatar */}
          <Card className="mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{user?.fullName?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{user?.fullName}</h2>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>
          </Card>

          {/* Profile Form */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Personal Information</h3>

            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-600">{success}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Full Name" required error={errors.fullName?.message}
                {...register('fullName', { required: 'Name is required' })} />
              <Input label="Email" type="email" disabled
                {...register('email')} className="opacity-60" />
              <Input label="Education" placeholder="e.g., BS Computer Science"
                {...register('education')} />
              <Input label="Experience" placeholder="e.g., 3 years in marketing"
                {...register('experience')} />
              <Input label="Business Interest" placeholder="e.g., Technology, Healthcare"
                {...register('businessInterest')} />
              <Button type="submit" loading={loading}>Update Profile</Button>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="!border-red-200">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Account Actions</h3>
            <Button variant="danger" onClick={handleLogout}>
              Sign Out
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
