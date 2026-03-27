// pages/Evaluation.jsx — 3-Layer Results Design (Phase 4)
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { evaluation as evalApi, ideas as ideasApi } from '../services/api'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ScoreCircle from '../components/shared/ScoreCircle'
import SwotGrid from '../components/shared/SwotGrid'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Tooltip, { TOOLTIPS } from '../components/ui/Tooltip'
import { Spinner } from '../components/ui/Loading'

// ─── Constants ────────────────────────────────────────────────────────────────

const LOADING_MSGS = [
  'AI is reading your business idea…',
  'Checking Amman market data…',
  'Calculating risk and opportunities…',
  'Almost done — writing your report…',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreDesc(score, type) {
  if (type === 'novelty') {
    if (score >= 80) return 'Very original for Amman'
    if (score >= 60) return 'Somewhat unique — needs differentiation'
    return 'Common idea — strong differentiator needed'
  }
  if (type === 'market') {
    if (score >= 80) return 'Strong market demand in Amman'
    if (score >= 60) return 'Moderate market — find your niche'
    return 'Challenging market conditions'
  }
  if (score >= 80) return 'Strong viability'
  if (score >= 60) return 'Viable with refinement'
  return 'Needs significant improvement'
}

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

function getVerdict(score, riskLevel) {
  if (!score) return null
  const highRisk = riskLevel?.toLowerCase().includes('high')
  const lowRisk  = riskLevel?.toLowerCase().includes('low')
  if (score >= 65 && lowRisk)  return 'promising'
  if (score < 40  || highRisk) return 'risky'
  return 'refine'
}

const VERDICT_CONFIG = {
  promising: {
    icon: '✅',
    title: 'This idea looks promising',
    bg:    'bg-green-50 dark:bg-green-950',
    border:'border-green-200 dark:border-green-800',
    title_color: 'text-green-800 dark:text-green-300',
    text_color:  'text-green-700 dark:text-green-400',
    badge: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  },
  refine: {
    icon: '⚠️',
    title: 'This idea needs some refinement',
    bg:    'bg-amber-50 dark:bg-amber-950',
    border:'border-amber-200 dark:border-amber-800',
    title_color: 'text-amber-800 dark:text-amber-300',
    text_color:  'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  },
  risky: {
    icon: '🔴',
    title: 'This idea carries high risk',
    bg:    'bg-red-50 dark:bg-red-950',
    border:'border-red-200 dark:border-red-800',
    title_color: 'text-red-800 dark:text-red-300',
    text_color:  'text-red-700 dark:text-red-400',
    badge: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  },
}

const RISK_BADGE_COLOR = {
  'Low Risk':    'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  'Medium Risk': 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  'High Risk':   'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
}

// ─── Shared: Expandable Section ───────────────────────────────────────────────

function ExpandableSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
        <svg
          className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-1 border-t border-slate-100 dark:border-gray-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Evaluation = () => {
  const { ideaId }   = useParams()
  const navigate     = useNavigate()
  const [evalData,   setEvalData]   = useState(null)
  const [idea,       setIdea]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [generating, setGenerating] = useState(false)
  const [retrying,   setRetrying]   = useState(false)
  const [msgIndex,   setMsgIndex]   = useState(0)

  useEffect(() => { loadData() }, [ideaId])

  useEffect(() => {
    if (!generating) return
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % LOADING_MSGS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [generating])

  const loadData = async () => {
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
        }
      }
    } catch (err) {
      console.error('Error loading evaluation:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async () => {
    setRetrying(true)
    try {
      const res = await evalApi.generate(ideaId)
      setEvalData(res.data)
    } catch { /* ignore */ }
    finally { setRetrying(false) }
  }

  const handleReEvaluate = async () => {
    setRetrying(true)
    setMsgIndex(0)
    try {
      await evalApi.delete(ideaId)
    } catch { /* ignore if not found */ }
    try {
      setGenerating(true)
      const res = await evalApi.generate(ideaId)
      setEvalData(res.data)
    } catch { /* ignore */ }
    finally {
      setGenerating(false)
      setRetrying(false)
    }
  }

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-slate-500 dark:text-gray-500 font-medium text-sm">
              {generating ? LOADING_MSGS[msgIndex] : 'Loading your evaluation…'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const swotData          = parseSwot(evalData?.swotAnalysis)
  const recommendations   = parseRecommendations(evalData?.recommendations)
  const redFlags          = Array.isArray(evalData?.redFlags) ? evalData.redFlags : []
  const verdictKey        = getVerdict(evalData?.overallScore, evalData?.riskLevel)
  const vc                = verdictKey ? VERDICT_CONFIG[verdictKey] : null
  const evalFailed        = !evalData || evalData.overallScore === 0

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Back link + header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{idea?.title}</h1>
          <p className="text-sm text-slate-500 dark:text-gray-500 mt-1 capitalize">
            {idea?.sector?.replace(/_/g, ' ')} · {idea?.businessType || 'B2C'} · Evaluation Results
          </p>
        </motion.div>

        <div className="space-y-4">

          {/* ─── LAYER 1: Verdict ─────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>

            {evalFailed ? (
              /* Failed evaluation */
              <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
                <p className="font-bold text-red-800 dark:text-red-300 text-lg mb-2">Evaluation unavailable</p>
                <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                  The AI analysis didn't complete successfully. This can happen when the idea description is too short or the service was temporarily unavailable.
                </p>
                <Button onClick={handleRetry} loading={retrying} variant="danger" size="sm">
                  Try Again
                </Button>
              </div>
            ) : (
              /* Verdict banner */
              <div className={`rounded-2xl border ${vc?.bg} ${vc?.border} p-6`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{vc?.icon}</span>
                  <div className="flex-1">
                    <h2 className={`text-lg font-bold ${vc?.title_color} mb-1`}>{vc?.title}</h2>
                    {evalData?.verdict && (
                      <p className={`text-sm ${vc?.text_color} leading-relaxed`}>{evalData.verdict}</p>
                    )}
                  </div>
                </div>

                {/* Red flags */}
                {redFlags.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {redFlags.map((flag, i) => (
                      <div key={i} className="flex items-start gap-2.5 bg-white/60 dark:bg-black/20 rounded-xl p-3 border border-amber-200/60 dark:border-amber-800/40">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠️</span>
                        <p className="text-sm text-slate-700 dark:text-gray-300">{flag}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* ─── LAYER 2: Scores ──────────────────────────────────────── */}
          {!evalFailed && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <ExpandableSection title="See your scores">
                <div className="pt-6 space-y-6">
                  <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                    <div className="flex flex-col items-center gap-2">
                      <Tooltip text={TOOLTIPS.noveltyScore}>
                        <ScoreCircle
                          score={evalData?.noveltyScore || 0}
                          label="How original is your idea"
                        />
                      </Tooltip>
                      <p className="text-xs text-slate-500 dark:text-gray-500 text-center max-w-[130px]">
                        {scoreDesc(evalData?.noveltyScore || 0, 'novelty')}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Tooltip text={TOOLTIPS.marketPotential}>
                        <ScoreCircle
                          score={evalData?.marketPotentialScore || 0}
                          label="Market opportunity"
                        />
                      </Tooltip>
                      <p className="text-xs text-slate-500 dark:text-gray-500 text-center max-w-[130px]">
                        {scoreDesc(evalData?.marketPotentialScore || 0, 'market')}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Tooltip text={TOOLTIPS.overallScore}>
                        <ScoreCircle
                          score={evalData?.overallScore || 0}
                          label="Overall viability score"
                          size={160}
                        />
                      </Tooltip>
                      <p className="text-xs text-slate-500 dark:text-gray-500 text-center max-w-[130px]">
                        {scoreDesc(evalData?.overallScore || 0, 'overall')}
                      </p>
                    </div>
                  </div>

                  {evalData?.riskLevel && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <span className="text-sm text-slate-500 dark:text-gray-400">Risk assessment:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${RISK_BADGE_COLOR[evalData.riskLevel] || RISK_BADGE_COLOR['Medium Risk']}`}>
                        {evalData.riskLevel}
                      </span>
                    </div>
                  )}
                </div>
              </ExpandableSection>
            </motion.div>
          )}

          {/* ─── LAYER 3: Full Analysis ───────────────────────────────── */}
          {!evalFailed && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <ExpandableSection title="See full analysis">
                <div className="pt-6 space-y-8">

                  {/* SWOT */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-4">
                      SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
                    </h3>
                    <SwotGrid swotData={swotData} />
                  </div>

                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-4">
                        What to do next
                      </h3>
                      <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 rounded-2xl p-5">
                        <ol className="space-y-3">
                          {recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-indigo-800 dark:text-indigo-300">
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{rec}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}

                  {/* Assumptions note */}
                  <div className="bg-slate-50 dark:bg-gray-800 rounded-2xl p-5 border border-slate-200 dark:border-gray-700">
                    <p className="text-xs text-slate-500 dark:text-gray-500 leading-relaxed">
                      All benchmarks are based on research into Amman's market (2025). Results may vary for other cities or unusual business models.
                    </p>
                  </div>
                </div>
              </ExpandableSection>
            </motion.div>
          )}

          {/* ─── Actions ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <Button onClick={() => navigate(`/financial/${ideaId}`)} className="flex-1">
              View Financial Analysis
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/business-plan/${ideaId}`)} className="flex-1">
              Download Business Plan PDF
            </Button>
          </motion.div>

          {/* Re-evaluate */}
          {!evalFailed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <button
                onClick={handleReEvaluate}
                disabled={retrying}
                className="w-full text-xs text-slate-400 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 disabled:opacity-50"
              >
                {retrying ? 'Re-evaluating…' : 'Not satisfied with results? Re-evaluate this idea →'}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Evaluation
