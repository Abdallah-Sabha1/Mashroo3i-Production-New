// pages/Evaluation.jsx — Clean document-style results
import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { evaluation as evalApi, ideas as ideasApi, getErrorMessage } from '../services/api'
import Navbar from '../components/layout/Navbar'
import ScoreCircle from '../components/shared/ScoreCircle'
import SwotGrid from '../components/shared/SwotGrid'
import Button from '../components/ui/Button'
import { Spinner } from '../components/ui/Loading'
import { getSectorLabel } from '../utils/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSwot(raw) {
  if (!raw) return {}
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw
  return {
    strengths:     data.Strengths     || data.strengths     || [],
    weaknesses:    data.Weaknesses    || data.weaknesses    || [],
    opportunities: data.Opportunities || data.opportunities || [],
    threats:       data.Threats       || data.threats       || [],
  }
}

function parseRecommendations(text) {
  if (!text) return []
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean)
  if (lines.length > 1) return lines
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10)
  return sentences.length > 1 ? sentences : [text]
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function VerdictIcon({ score }) {
  if (score >= 65) return (
    <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
  if (score >= 40) return (
    <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
  return (
    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Evaluation = () => {
  const { ideaId }   = useParams()
  const navigate     = useNavigate()
  const { t }        = useTranslation()
  const [evalData,   setEvalData]   = useState(null)
  const [idea,       setIdea]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [generating, setGenerating] = useState(false)
  const [pageError,  setPageError]  = useState(null)
  const [msgIndex,   setMsgIndex]   = useState(0)
  const msgTimer = useRef(null)

  const AI_MESSAGES = t('evaluation.aiMessages', { returnObjects: true })

  useEffect(() => { loadData() }, [ideaId])

  // Rotate AI loading messages
  useEffect(() => {
    if (generating) {
      msgTimer.current = setInterval(() =>
        setMsgIndex(i => (i + 1) % AI_MESSAGES.length), 1500)
    } else {
      clearInterval(msgTimer.current)
      setMsgIndex(0)
    }
    return () => clearInterval(msgTimer.current)
  }, [generating])

  const loadData = async () => {
    setPageError(null)
    setLoading(true)
    try {
      const ideaRes = await ideasApi.getById(ideaId)
      setIdea(ideaRes.data)
      try {
        const evalRes = await evalApi.get(ideaId)
        setEvalData(evalRes.data)
      } catch (err) {
        if (err.response?.status === 404) {
          setGenerating(true)
          const genRes = await evalApi.generate(ideaId)
          setEvalData(genRes.data)
          setGenerating(false)
        } else {
          throw err
        }
      }
    } catch (err) {
      console.error('Error loading evaluation:', err)
      if (err.response?.status === 429) {
        setPageError(t('evaluation.rateLimited'))
      } else {
        setPageError(getErrorMessage(err))
      }
    } finally {
      setLoading(false)
      setGenerating(false)
    }
  }

  const handleReEvaluate = async () => {
    if (!window.confirm(t('evaluation.actions.confirmReEval'))) return
    try {
      await evalApi.delete(ideaId)
      setEvalData(null)
      setGenerating(true)
      const genRes = await evalApi.generate(ideaId)
      setEvalData(genRes.data)
    } catch (err) {
      console.error('Re-evaluate failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  const scoreDesc = (score, type) => {
    if (type === 'novelty') {
      if (score >= 80) return t('evaluation.scores.scoreDescs.noveltyHigh')
      if (score >= 60) return t('evaluation.scores.scoreDescs.noveltyMid')
      return t('evaluation.scores.scoreDescs.noveltyLow')
    }
    if (type === 'market') {
      if (score >= 80) return t('evaluation.scores.scoreDescs.marketHigh')
      if (score >= 60) return t('evaluation.scores.scoreDescs.marketMid')
      return t('evaluation.scores.scoreDescs.marketLow')
    }
    if (score >= 80) return t('evaluation.scores.scoreDescs.overallHigh')
    if (score >= 60) return t('evaluation.scores.scoreDescs.overallMid')
    return t('evaluation.scores.scoreDescs.overallLow')
  }

  // Loading state
  if (loading || generating) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-slate-500 dark:text-gray-500 text-sm"
            >
              {generating ? AI_MESSAGES[msgIndex] : t('evaluation.loadingEval')}
            </motion.p>
          </div>
        </div>
      </div>
    )
  }

  // Derived data
  const swotData          = parseSwot(evalData?.swotAnalysis)
  const redFlags          = evalData?.redFlags || []
  const recommendations   = parseRecommendations(evalData?.recommendations)
  const overallScore      = evalData?.overallScore || 0

  const evalFailed = evalData && overallScore === 0

  const verdictBorderColor =
    overallScore >= 65 ? 'border-l-emerald-500' :
    overallScore >= 40 ? 'border-l-amber-500'   :
                         'border-l-red-500'

  const verdictLabel =
    overallScore >= 65 ? t('evaluation.verdicts.promising') :
    overallScore >= 40 ? t('evaluation.verdicts.needsRefinement') :
                         t('evaluation.verdicts.highRisk')

  const riskBadgeClass =
    evalData?.riskLevel === 'Low Risk'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
      : evalData?.riskLevel === 'High Risk'
      ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
      : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-gray-500
              hover:text-slate-700 dark:hover:text-gray-300 mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('evaluation.backToDashboard')}
          </Link>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            {idea?.title}
          </h1>
          <p className="text-sm text-slate-400 dark:text-gray-500 mt-1">
            {getSectorLabel(idea?.sector)} · {idea?.businessType || 'B2C'} · {t('evaluation.evaluationResults')}
          </p>
        </motion.div>

        {/* Page error */}
        {pageError && (
          <div className="mb-6 rounded-xl border border-red-200 dark:border-red-800
            bg-white dark:bg-gray-900 p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-slate-700 dark:text-gray-300">{pageError}</p>
              <button
                onClick={loadData}
                className="text-sm text-indigo-600 dark:text-indigo-400 mt-2 font-medium hover:underline"
              >
                {t('evaluation.tryAgain')}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">

          {/* ── FAILED EVALUATION ── */}
          {evalFailed && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800
                border-l-4 border-l-red-400 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t('evaluation.evalFailed.title')}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {t('evaluation.evalFailed.body')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReEvaluate}
                  className="ml-8 text-sm font-medium text-indigo-600 dark:text-indigo-400
                    hover:underline"
                >
                  {t('evaluation.evalFailed.retry')}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── VERDICT ── */}
          {evalData && !evalFailed && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800
                border-l-4 ${verdictBorderColor} rounded-xl p-5`}>
                <div className="flex items-start gap-3 mb-2">
                  <VerdictIcon score={overallScore} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {verdictLabel}
                    </p>
                    {evalData.verdict && (
                      <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">
                        {evalData.verdict}
                      </p>
                    )}
                  </div>
                </div>

                {/* Red flags */}
                {redFlags.length > 0 && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-gray-800">
                    {redFlags.map((flag, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                          {flag}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── SCORES ── */}
          {!evalFailed && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl overflow-hidden">

              <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('evaluation.scores.title')}
                </h2>
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                  {t('evaluation.scores.subtitle', { type: idea?.businessType || 'B2C' })}
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-around gap-8 px-5 py-8">
                <div className="flex flex-col items-center gap-2">
                  <ScoreCircle score={evalData?.noveltyScore || 0} label={t('evaluation.scores.novelty')} />
                  <p className="text-xs text-center text-slate-400 dark:text-gray-500 max-w-[130px]">
                    {scoreDesc(evalData?.noveltyScore || 0, 'novelty')}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ScoreCircle score={evalData?.marketPotentialScore || 0} label={t('evaluation.scores.market')} />
                  <p className="text-xs text-center text-slate-400 dark:text-gray-500 max-w-[130px]">
                    {scoreDesc(evalData?.marketPotentialScore || 0, 'market')}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ScoreCircle score={evalData?.overallScore || 0} label={t('evaluation.scores.overall')} size={160} />
                  <p className="text-xs text-center text-slate-400 dark:text-gray-500 max-w-[130px]">
                    {scoreDesc(evalData?.overallScore || 0, 'overall')}
                  </p>
                </div>
              </div>

              {/* Risk level row */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-gray-800
                flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                  {t('evaluation.scores.riskAssessment')}
                </p>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${riskBadgeClass}`}>
                  {evalData?.riskLevel || 'Medium Risk'}
                </span>
              </div>
            </div>
          </motion.div>}

          {/* ── SWOT ── */}
          {!evalFailed && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('evaluation.swot.title')}
                </h2>
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                  {t('evaluation.swot.subtitle')}
                </p>
              </div>
              <div className="p-5">
                <SwotGrid swotData={swotData} />
              </div>
            </div>
          </motion.div>}

          {/* ── RECOMMENDATIONS ── */}
          {!evalFailed && recommendations.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                  {t('evaluation.recommendations.title')}
                </h2>
                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-gray-800
                        text-slate-600 dark:text-gray-300 text-xs font-semibold
                        flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ACTIONS ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <Button onClick={() => navigate(`/financial-projections/${ideaId}`)} className="flex-1">
              {t('evaluation.actions.financialProjections')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/financial/${ideaId}`)} className="flex-1">
              {t('evaluation.actions.classicPlan')}
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/business-plan/${ideaId}`)} className="flex-1">
              {t('evaluation.actions.downloadPlan')}
            </Button>
          </motion.div>

          {/* Re-evaluate */}
          <div className="flex justify-center pt-1">
            <button
              onClick={handleReEvaluate}
              className="text-xs text-slate-400 dark:text-gray-600
                hover:text-slate-600 dark:hover:text-gray-400 transition-colors"
            >
              {t('evaluation.actions.reEvaluate')}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Evaluation
