// pages/SubmitIdea.jsx — 4-Step Business Wizard
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import api, { ideas as ideasApi, getErrorMessage } from '../services/api'
import { useToast } from '../components/ui/Toast'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

// ─── ProgressBar ──────────────────────────────────────────────────────────────

function ProgressBar({ step }) {
  const { t } = useTranslation()
  const STEP_NAMES = t('submitIdea.steps', { returnObjects: true })
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500 dark:text-gray-400">
          {t('submitIdea.stepOf', { step: step + 1, total: STEP_NAMES.length })}
        </span>
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{STEP_NAMES[step]}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-indigo-600 to-blue-600 h-2 rounded-full"
          initial={false}
          animate={{ width: `${((step + 1) / STEP_NAMES.length) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>
      <div className="hidden sm:flex justify-between mt-1.5">
        {STEP_NAMES.map((name, i) => (
          <span
            key={name}
            className={`text-xs ${i <= step ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-400 dark:text-gray-600'}`}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Step 0: Your Idea ────────────────────────────────────────────────────────

function Step0({ title, setTitle, description, setDescription, selectedSector, setSelectedSector, onNext, loading }) {
  const { t } = useTranslation()
  const [sectorError, setSectorError] = useState(false)
  const descLeft = Math.max(0, 100 - description.length)
  const titleValid = title.trim().length >= 5
  const descValid  = description.trim().length >= 100

  const SECTORS = [
    'food_and_beverage',
    'retail_ecommerce',
    'tech_and_software',
    'education_and_training',
    'health_and_wellness',
    'professional_services',
    'other',
  ]

  const handleNext = () => {
    if (!selectedSector) { setSectorError(true); return }
    setSectorError(false)
    onNext()
  }

  return (
    <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-1.5">
          {t('submitIdea.step0.titleLabel')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('submitIdea.step0.titlePlaceholder')}
          maxLength={200}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        {title.length > 0 && title.length < 5 && (
          <p className="text-xs text-red-500 mt-1">{t('submitIdea.step0.titleMin')}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-1">
          {t('submitIdea.step0.descLabel')} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 dark:text-gray-500 mb-2">
          {t('submitIdea.step0.descHint')}
        </p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={6}
          placeholder={t('submitIdea.step0.descPlaceholder')}
          maxLength={2000}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          {descLeft > 0
            ? <p className="text-xs text-orange-500">{t('submitIdea.step0.descMore', { count: descLeft })}</p>
            : <p className="text-xs text-green-600 dark:text-green-400">{t('submitIdea.step0.descGood')}</p>
          }
          <p className="text-xs text-slate-400">{t('submitIdea.step0.descChars', { count: description.length })}</p>
        </div>
      </div>

      {/* Sector */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-3">
          {t('submitIdea.step0.sectorLabel')} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {SECTORS.slice(0, -1).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => { setSelectedSector(s); setSectorError(false) }}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedSector === s
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                  : 'border-slate-200 dark:border-gray-700 hover:border-slate-300 bg-white dark:bg-gray-800'
              }`}
            >
              <p className={`font-medium text-sm ${selectedSector === s ? 'text-indigo-800 dark:text-indigo-200' : 'text-slate-800 dark:text-gray-200'}`}>
                {t(`submitIdea.step0.sectors.${s}.label`)}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{t(`submitIdea.step0.sectors.${s}.desc`)}</p>
            </button>
          ))}
          {/* "Other" spans full width */}
          <button
            type="button"
            onClick={() => { setSelectedSector('other'); setSectorError(false) }}
            className={`col-span-2 text-left p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedSector === 'other'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                : 'border-slate-200 dark:border-gray-700 hover:border-slate-300 bg-white dark:bg-gray-800'
            }`}
          >
            <p className={`font-medium text-sm ${selectedSector === 'other' ? 'text-indigo-800 dark:text-indigo-200' : 'text-slate-800 dark:text-gray-200'}`}>
              {t('submitIdea.step0.sectors.other.label')}
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{t('submitIdea.step0.sectors.other.desc')}</p>
          </button>
        </div>
        {sectorError && (
          <p className="text-xs text-red-500 mt-2">{t('submitIdea.step0.sectorError')}</p>
        )}
      </div>

      <Button onClick={handleNext} disabled={!titleValid || !descValid || loading} loading={loading} className="w-full" size="lg">
        {t('submitIdea.step0.analyzeBtn')}
      </Button>
    </motion.div>
  )
}

// ─── Step 1: AI Analysis ──────────────────────────────────────────────────────

function Step1({ aiInsights, setAiInsights, aiLoading, confirmedBusinessType, setConfirmedBusinessType, onNext, onBack }) {
  const { t } = useTranslation()
  const LOADING_MSGS = t('submitIdea.step1.loading', { returnObjects: true })
  const [msgIdx, setMsgIdx] = useState(0)
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue]       = useState('')

  useEffect(() => {
    if (!aiLoading) return
    const timer = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MSGS.length), 1500)
    return () => clearInterval(timer)
  }, [aiLoading])

  const cards = [
    { key: 'problemStatement',   label: t('submitIdea.step1.cards.problemStatement') },
    { key: 'uniqueSellingPoint', label: t('submitIdea.step1.cards.uniqueSellingPoint') },
    { key: 'targetAudience',     label: t('submitIdea.step1.cards.targetAudience') },
  ]

  const startEdit = (key) => { setEditingField(key); setEditValue(aiInsights?.[key] || '') }
  const doneEdit  = () => {
    if (editingField) setAiInsights(prev => ({ ...prev, [editingField]: editValue }))
    setEditingField(null)
    setEditValue('')
  }

  if (aiLoading) {
    return (
      <motion.div key="s1-load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-medium text-slate-700 dark:text-gray-300 text-center"
          >
            {LOADING_MSGS[msgIdx]}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1.5">
          {LOADING_MSGS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i === msgIdx ? 'bg-indigo-600 w-4' : 'bg-slate-200 dark:bg-gray-700'}`} />
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div key="s1-done" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">

      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 text-sm font-medium px-4 py-2 rounded-full border border-green-200 dark:border-green-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t('submitIdea.step1.analysisComplete')}
        </span>
      </div>

      {/* Insight cards */}
      <div className="bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 space-y-5">
        <h3 className="font-bold text-slate-900 dark:text-white">{t('submitIdea.step1.insightsTitle')}</h3>
        {cards.map(({ key, label }, i) => (
          <div key={key} className={i < cards.length - 1 ? 'pb-5 border-b border-slate-200 dark:border-gray-800' : ''}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{label}</p>
              {editingField !== key && (
                <button
                  type="button"
                  onClick={() => startEdit(key)}
                  className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 py-0.5 rounded-md border border-slate-200 dark:border-gray-700 hover:border-indigo-300"
                >
                  {t('submitIdea.step1.editBtn')}
                </button>
              )}
            </div>
            {editingField === key ? (
              <div>
                <textarea
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  rows={3}
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <button
                  type="button"
                  onClick={doneEdit}
                  className="mt-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {t('submitIdea.step1.doneBtn')}
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">{aiInsights?.[key] || '—'}</p>
            )}
          </div>
        ))}
      </div>

      {/* Business type confirmation */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900">
        <p className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
          {t('submitIdea.step1.bizTypeIntro')}
          <strong className="text-indigo-600 dark:text-indigo-400 mx-1">
            {aiInsights?.suggestedBusinessType === 'B2B'
              ? t('submitIdea.step1.b2bLabel')
              : t('submitIdea.step1.b2cLabel')}
          </strong>
        </p>
        {aiInsights?.businessTypeReason && (
          <p className="text-xs text-slate-500 dark:text-gray-400">{aiInsights.businessTypeReason}</p>
        )}
        <p className="text-xs font-medium text-slate-600 dark:text-gray-300 mt-3 mb-2">
          {t('submitIdea.step1.confirm')}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmedBusinessType('B2C')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
              confirmedBusinessType === 'B2C'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-700'
            }`}
          >
            {t('submitIdea.step1.yesB2C')}
          </button>
          <button
            type="button"
            onClick={() => setConfirmedBusinessType('B2B')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
              confirmedBusinessType === 'B2B'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-700'
            }`}
          >
            {t('submitIdea.step1.noB2B')}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Button onClick={onNext} disabled={!confirmedBusinessType} className="w-full" size="lg">
          {t('submitIdea.step1.continueBtn')}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-slate-500 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition-colors text-center"
        >
          {t('submitIdea.step1.editDesc')}
        </button>
      </div>
    </motion.div>
  )
}

// ─── Step 2: Your Business ────────────────────────────────────────────────────

function Step2({ selectedSector, estimatedBudget, setEstimatedBudget, ammanRegion, setAmmanRegion, onNext, onBack }) {
  const { t } = useTranslation()
  const valid = (parseFloat(estimatedBudget) || 0) > 0 && !!ammanRegion

  const REGIONS = ['west', 'central', 'east']

  return (
    <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-7">

      {/* Budget */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-1.5">
          {t('submitIdea.step2.budgetLabel')} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={estimatedBudget}
          onChange={e => setEstimatedBudget(e.target.value)}
          placeholder={t('submitIdea.step2.budgetPlaceholder')}
          min="1"
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        {selectedSector && t(`submitIdea.step0.budgetHints.${selectedSector}`, { defaultValue: '' }) && (
          <p className="text-xs text-slate-500 mt-1">{t(`submitIdea.step0.budgetHints.${selectedSector}`)}</p>
        )}
      </div>

      {/* Region */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-3">
          {t('submitIdea.step2.regionLabel')} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {REGIONS.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setAmmanRegion(r)}
              className={`py-3 px-3 rounded-lg text-sm border transition-all text-left ${
                ammanRegion === r
                  ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:border-slate-300'
              }`}
            >
              <p className={`font-medium text-xs ${ammanRegion === r ? 'text-indigo-800 dark:text-indigo-200' : 'text-slate-800 dark:text-gray-200'}`}>
                {t(`submitIdea.step2.regions.${r}.label`)}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">{t(`submitIdea.step2.regions.${r}.sub`)}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
        >
          {t('submitIdea.step2.back')}
        </button>
        <Button onClick={onNext} disabled={!valid} className="flex-1" size="lg">
          {t('submitIdea.step2.continue')}
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Step 3: Review ───────────────────────────────────────────────────────────

function Step3({ title, selectedSector, aiInsights, confirmedBusinessType, estimatedBudget, ammanRegion, onSubmit, onBack, loading }) {
  const { t } = useTranslation()
  const sectorLabel = t(`submitIdea.step0.sectors.${selectedSector}.label`, { defaultValue: selectedSector })
  const regionLabel = t(`submitIdea.step2.regions.${ammanRegion}.label`, { defaultValue: ammanRegion })
  const truncate = (str, n) => str && str.length > n ? str.slice(0, n) + '...' : (str || '—')

  return (
    <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">

      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t('submitIdea.step3.title')}</h3>
        <p className="text-sm text-slate-500 dark:text-gray-500">{t('submitIdea.step3.subtitle')}</p>
      </div>

      {/* Your Idea */}
      <div className="rounded-xl border border-slate-200 dark:border-gray-700 p-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">{t('submitIdea.step3.sectionIdea')}</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          {sectorLabel}
        </span>
      </div>

      {/* AI Insights */}
      <div className="rounded-xl border border-slate-200 dark:border-gray-700 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">{t('submitIdea.step3.sectionAI')}</p>
        <div>
          <p className="text-xs text-slate-500 dark:text-gray-500 mb-0.5">{t('submitIdea.step3.problem')}</p>
          <p className="text-sm text-slate-700 dark:text-gray-300">{truncate(aiInsights?.problemStatement, 80)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-gray-500 mb-0.5">{t('submitIdea.step3.different')}</p>
          <p className="text-sm text-slate-700 dark:text-gray-300">{truncate(aiInsights?.uniqueSellingPoint, 80)}</p>
        </div>
      </div>

      {/* Business Type */}
      <div className="rounded-xl border border-slate-200 dark:border-gray-700 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2">{t('submitIdea.step3.sectionBizType')}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-gray-200">
          {confirmedBusinessType === 'B2B'
            ? t('submitIdea.step3.b2b')
            : t('submitIdea.step3.b2c')}
        </p>
      </div>

      {/* Your Details */}
      <div className="rounded-xl border border-slate-200 dark:border-gray-700 p-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">{t('submitIdea.step3.sectionDetails')}</p>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 dark:text-gray-500">{t('submitIdea.step3.budget')}</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {parseFloat(estimatedBudget).toLocaleString()} JOD
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 dark:text-gray-500">{t('submitIdea.step3.location')}</span>
          <span className="font-medium text-slate-900 dark:text-white">{regionLabel}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
        >
          {t('submitIdea.step3.back')}
        </button>
        <Button onClick={onSubmit} loading={loading} className="flex-1" size="lg">
          {loading ? t('submitIdea.step3.submitting') : t('submitIdea.step3.submitBtn')}
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SubmitIdea = () => {
  const { t } = useTranslation()
  const [step,                   setStep]                   = useState(0)
  const [title,                  setTitle]                  = useState('')
  const [description,            setDescription]            = useState('')
  const [selectedSector,         setSelectedSector]         = useState('')
  const [aiInsights,             setAiInsights]             = useState(null)
  const [aiLoading,              setAiLoading]              = useState(false)
  const [confirmedBusinessType,  setConfirmedBusinessType]  = useState('')
  const [estimatedBudget,        setEstimatedBudget]        = useState('')
  const [ammanRegion,            setAmmanRegion]            = useState('central')
  const [submitLoading,          setSubmitLoading]          = useState(false)
  const [error,                  setError]                  = useState('')

  const navigate = useNavigate()
  const { addToast } = useToast()

  // Pre-select business type from AI suggestion when step 1 loads
  useEffect(() => {
    if (step === 1 && aiInsights?.suggestedBusinessType && !confirmedBusinessType) {
      setConfirmedBusinessType(aiInsights.suggestedBusinessType.toUpperCase())
    }
  }, [step, aiInsights]) // eslint-disable-line react-hooks/exhaustive-deps

  // Step 0 → 1: Run AI analysis
  const handleAnalyze = async () => {
    setError('')
    setAiLoading(true)
    setStep(1)
    try {
      const res = await api.post('/ideas/analyze', {
        title,
        description,
        sector: selectedSector,
      })
      setAiInsights(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
      setStep(0)
    } finally {
      setAiLoading(false)
    }
  }

  // Final submit
  const handleSubmit = async () => {
    setError('')
    setSubmitLoading(true)
    try {
      await ideasApi.create({
        title,
        description,
        problemStatement:   aiInsights?.problemStatement,
        usp:                aiInsights?.uniqueSellingPoint,
        targetAudience:     aiInsights?.targetAudience,
        businessType:       confirmedBusinessType,
        businessTypeReason: aiInsights?.businessTypeReason,
        sector:             selectedSector,
        ammanRegion,
        estimatedBudget:    parseFloat(estimatedBudget),
      })
      addToast(t('submitIdea.step3.successToast'), 'success')
      navigate('/dashboard?welcome=true')
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {t('submitIdea.title')}
          </h1>
          <p className="text-slate-500 dark:text-gray-500 mb-8 text-sm">
            {t('submitIdea.subtitle')}
          </p>

          <ProgressBar step={step} />

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <Card className="border border-slate-200 dark:border-gray-800 shadow-lg">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <Step0
                  title={title}
                  setTitle={setTitle}
                  description={description}
                  setDescription={setDescription}
                  selectedSector={selectedSector}
                  setSelectedSector={setSelectedSector}
                  onNext={handleAnalyze}
                  loading={aiLoading}
                />
              )}
              {step === 1 && (
                <Step1
                  aiInsights={aiInsights}
                  setAiInsights={setAiInsights}
                  aiLoading={aiLoading}
                  confirmedBusinessType={confirmedBusinessType}
                  setConfirmedBusinessType={setConfirmedBusinessType}
                  onNext={() => setStep(2)}
                  onBack={() => { setStep(0); setAiLoading(false) }}
                />
              )}
              {step === 2 && (
                <Step2
                  selectedSector={selectedSector}
                  estimatedBudget={estimatedBudget}
                  setEstimatedBudget={setEstimatedBudget}
                  ammanRegion={ammanRegion}
                  setAmmanRegion={setAmmanRegion}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <Step3
                  title={title}
                  selectedSector={selectedSector}
                  aiInsights={aiInsights}
                  confirmedBusinessType={confirmedBusinessType}
                  estimatedBudget={estimatedBudget}
                  ammanRegion={ammanRegion}
                  onSubmit={handleSubmit}
                  onBack={() => setStep(2)}
                  loading={submitLoading}
                />
              )}
            </AnimatePresence>
          </Card>

          <p className="text-center text-xs text-slate-400 dark:text-gray-600 mt-6">
            {t('submitIdea.footer')}
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default SubmitIdea
