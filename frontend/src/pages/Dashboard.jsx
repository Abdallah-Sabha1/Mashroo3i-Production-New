import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ideas as ideasApi, evaluation as evalApi, getErrorMessage } from '../services/api'
import useAuthStore from '../store/authStore'
import Navbar from '../components/layout/Navbar'
import StatsCard from '../components/shared/StatsCard'
import OnboardingModal from '../components/shared/OnboardingModal'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { DashboardSkeleton } from '../components/ui/Loading'
import { formatDate, formatCurrency, getScoreColor, getSectorLabel } from '../utils/helpers'

const Dashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    loadIdeas()
  }, [])

  useEffect(() => {
    const alreadyOnboarded = localStorage.getItem('mashroo3i_onboarded')
    const isWelcome = searchParams.get('welcome') === 'true'
    if (!alreadyOnboarded || isWelcome) {
      setTimeout(() => setShowOnboarding(true), 500)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadIdeas = async () => {
    try {
      const res = await ideasApi.getAll()
      setIdeas(res.data)
    } catch (err) {
      console.error('Failed to load ideas:', getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleCloseOnboarding = () => {
    setShowOnboarding(false)
    searchParams.delete('welcome')
    setSearchParams(searchParams, { replace: true })
  }

  const evaluated = ideas.filter(i => i.evaluation)
  const avgScore = evaluated.length > 0
    ? Math.round(evaluated.reduce((sum, i) => sum + (i.evaluation?.overallScore || 0), 0) / evaluated.length)
    : 0
  const successRate = evaluated.length > 0
    ? Math.round((evaluated.filter(i => (i.evaluation?.overallScore || 0) >= 60).length / evaluated.length) * 100)
    : 0

  const handleDelete = async (ideaId) => {
    setDeletingId(ideaId)
    try {
      await ideasApi.delete(ideaId)
      setIdeas(prevIdeas => prevIdeas.filter(i => i.ideaId !== ideaId))
    } catch (err) {
      console.error('Failed to delete idea:', err)
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  const handleEvaluate = async (ideaId) => {
    try {
      await evalApi.generate(ideaId)
      navigate(`/evaluation/${ideaId}`)
    } catch (err) {
      if (err.response?.status === 409) {
        navigate(`/evaluation/${ideaId}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            {t('dashboard.welcome')} {user?.fullName?.split(' ')[0] || t('nav.dashboard')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('dashboard.subtitle')}</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard label={t('dashboard.stats.totalIdeas')} value={ideas.length} description={t('dashboard.stats.totalIdeasDesc')} delay={0} />
          <StatsCard label={t('dashboard.stats.evaluations')} value={evaluated.length} description={t('dashboard.stats.evaluationsDesc', { pct: ideas.length > 0 ? Math.round(evaluated.length/ideas.length*100) : 0 })} delay={0.1} />
          <StatsCard label={t('dashboard.stats.avgScore')} value={avgScore} description={t('dashboard.stats.avgScoreDesc')} delay={0.2} />
          <StatsCard label={t('dashboard.stats.successRate')} value={`${successRate}%`} description={t('dashboard.stats.successRateDesc')} delay={0.3} />
        </div>

        {/* Quick Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800
            bg-emerald-50 dark:bg-emerald-900/20 px-6 py-5
            flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                {t('dashboard.quickAction.title')}
              </h2>
              <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-1">
                {t('dashboard.quickAction.subtitle')}
              </p>
            </div>
            <Link to="/submit-idea" className="flex-shrink-0">
              <button className="px-5 py-2 rounded-lg bg-emerald-600 text-gray-50
                text-sm font-medium hover:bg-emerald-700 transition-colors
                flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('dashboard.quickAction.button')}
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Ideas List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-6">{t('dashboard.ideas.title')}</h2>

          {loading ? (
            <DashboardSkeleton />
          ) : ideas.length === 0 ? (
            <Card className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl feature-icon flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">{t('dashboard.ideas.empty')}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm max-w-sm mx-auto leading-relaxed">{t('dashboard.ideas.emptySub')}</p>
              <Link to="/submit-idea"><Button size="lg">{t('dashboard.ideas.submitFirst')}</Button></Link>
              <div className="mt-4">
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {t('dashboard.ideas.howItWorks')}
                </button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {ideas.map((idea, idx) => (
                <motion.div key={idea.ideaId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card hover className="!p-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-50 truncate">{idea.title}</h3>
                          <Badge color="purple" size="sm">{getSectorLabel(idea.sector)}</Badge>
                          {idea.evaluation && (
                            <Badge
                              color={
                                idea.evaluation.overallScore >= 65 ? 'green' :
                                idea.evaluation.overallScore >= 40 ? 'amber' : 'red'
                              }
                              size="sm"
                            >
                              {idea.evaluation.overallScore}/100
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{formatDate(idea.createdAt)}</span>
                          {!idea.evaluation && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">{t('dashboard.ideas.notEvaluated', 'Not evaluated yet')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {idea.evaluation ? (
                          <>
                            <Link to={`/evaluation/${idea.ideaId}`}>
                              <Button variant="ghost" size="sm">{t('dashboard.ideas.viewResults')}</Button>
                            </Link>
                            <Link to={`/financial/${idea.ideaId}`}>
                              <Button variant="secondary" size="sm">{t('dashboard.ideas.financialPlan')}</Button>
                            </Link>
                          </>
                        ) : (
                          <Button size="sm" onClick={() => handleEvaluate(idea.ideaId)}>{t('dashboard.ideas.evaluate')}</Button>
                        )}
                        <button
                          onClick={() => setConfirmDeleteId(idea.ideaId)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete idea"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">{t('dashboard.delete.title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t('dashboard.delete.body')}
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setConfirmDeleteId(null)}>
                {t('dashboard.delete.cancel')}
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                loading={!!deletingId}
                onClick={() => handleDelete(confirmDeleteId)}
              >
                {t('dashboard.delete.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
