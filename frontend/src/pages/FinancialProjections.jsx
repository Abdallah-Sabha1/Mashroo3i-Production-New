import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ideas as ideasApi } from '../services/api'
import Navbar from '../components/layout/Navbar'
import FinancialProjectionsStep from '../components/wizard/FinancialProjectionsStep'
import { Spinner } from '../components/ui/Loading'

// ── Main page (single step - skip redundant industry/business model selection) ────

const FinancialProjections = () => {
  const { ideaId } = useParams()
  const { t } = useTranslation()
  const [idea, setIdea] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // ✅ FIX #7: Add AbortController to cancel requests on unmount
    const abortCtrl = new AbortController()
    let active = true
    setLoading(true)
    setError(null)

    ideasApi.getById(parseInt(ideaId), { signal: abortCtrl.signal })
      .then(res => {
        if (active) setIdea(res.data)
      })
      .catch(err => {
        // ✅ Ignore abort errors - request was cancelled
        if (err.name === 'AbortError') return
        if (active) setError(t('common.errorLoadingData'))
      })
      .finally(() => { if (active) setLoading(false) })

    return () => {
      abortCtrl.abort()  // ✅ Cancel request on unmount
      active = false
    }
  }, [ideaId, t])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      </div>
    )
  }

  // ✅ FIX #2: Validate all required props exist before rendering child component
  if (error || !idea) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Link
              to={`/evaluation/${ideaId}`}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              {t('financialWizard.backToAnalysis')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ✅ FIX #2: Ensure required fields exist before passing to child
  if (!idea.sector || !idea.businessType) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              {t('common.errorLoadingData')}
            </p>
            <Link
              to={`/evaluation/${ideaId}`}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              {t('financialWizard.backToAnalysis')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const stepTitle = t('financialWizard.stepTitles.projections')
  const stepSubtitle = t('financialWizard.stepSubtitles.projections')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Back link */}
        <Link
          to={`/evaluation/${ideaId}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-gray-500
            hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          {t('financialWizard.backToAnalysis')}
        </Link>

        {/* Step header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-6"
        >
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{stepTitle}</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{stepSubtitle}</p>
        </motion.div>

        {/* Step content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22 }}
        >
          <FinancialProjectionsStep
            ideaId={parseInt(ideaId)}
            industryType={idea.sector}
            businessModel={idea.businessType}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default FinancialProjections
