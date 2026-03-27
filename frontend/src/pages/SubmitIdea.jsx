// pages/SubmitIdea.jsx — 4-Step Business Wizard
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api, { ideas as ideasApi, getErrorMessage } from '../services/api'
import { useToast } from '../components/ui/Toast'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_NAMES = ['Your Idea', 'AI Analysis', 'Your Business', 'Review']

const SECTORS = [
  { value: 'food_and_beverage',      label: 'Food & Beverage',       desc: 'Restaurants, cafés, catering, food delivery' },
  { value: 'retail_ecommerce',       label: 'Retail & E-commerce',   desc: 'Online or physical store, products, reselling' },
  { value: 'tech_and_software',      label: 'Tech & Software',       desc: 'Apps, websites, digital tools, software' },
  { value: 'education_and_training', label: 'Education & Training',  desc: 'Tutoring, courses, coaching, training' },
  { value: 'health_and_wellness',    label: 'Health & Wellness',     desc: 'Gym, clinic, nutrition, beauty, personal care' },
  { value: 'professional_services',  label: 'Professional Services', desc: 'Consulting, marketing, accounting, design, IT' },
  { value: 'other',                  label: 'Other',                 desc: "Doesn't fit the above categories" },
]

const BUDGET_HINTS = {
  food_and_beverage:      'Typical in Amman: 8,000–40,000 JOD',
  retail_ecommerce:       'Typical in Amman: 2,000–30,000 JOD',
  tech_and_software:      'Typical in Amman: 3,000–25,000 JOD',
  education_and_training: 'Typical in Amman: 1,500–20,000 JOD',
  health_and_wellness:    'Typical in Amman: 5,000–60,000 JOD',
  professional_services:  'Typical in Amman: 500–8,000 JOD',
  other:                  'Typical for small businesses in Amman: 2,000–20,000 JOD',
}

const AMMAN_REGIONS = [
  { value: 'west',    label: 'West Amman',    sub: 'Abdoun, Sweifieh' },
  { value: 'central', label: 'Central Amman', sub: 'Downtown, Jabal' },
  { value: 'east',    label: 'East Amman',    sub: 'Zarqa Road, Marka' },
]

const LOADING_MSGS = [
  'Reading your idea...',
  'Thinking about Amman market...',
  'Identifying your customers...',
  'Almost ready...',
]

// ─── ProgressBar ──────────────────────────────────────────────────────────────

function ProgressBar({ step }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500 dark:text-gray-400">
          Step <span className="font-semibold text-slate-700 dark:text-gray-200">{step + 1}</span> of {STEP_NAMES.length}
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
  const [sectorError, setSectorError] = useState(false)
  const descLeft = Math.max(0, 100 - description.length)
  const titleValid = title.trim().length >= 5
  const descValid  = description.trim().length >= 100

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
          What is your business idea called? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Specialty coffee shop in Abdoun"
          maxLength={200}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        {title.length > 0 && title.length < 5 && (
          <p className="text-xs text-red-500 mt-1">Enter at least 5 characters</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-1">
          Describe your idea <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 dark:text-gray-500 mb-2">
          What does it do? What problem does it solve? The more detail you give, the better our analysis.
        </p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={6}
          placeholder="e.g. I want to open a café in Sweifieh that focuses on specialty coffee and remote work space. Many young professionals in Amman struggle to find quiet, well-designed places to work from..."
          maxLength={2000}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          {descLeft > 0
            ? <p className="text-xs text-orange-500">{descLeft} more characters needed</p>
            : <p className="text-xs text-green-600 dark:text-green-400">Good length</p>
          }
          <p className="text-xs text-slate-400">{description.length} chars</p>
        </div>
      </div>

      {/* Sector */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-3">
          What field is your idea in? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {SECTORS.slice(0, -1).map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => { setSelectedSector(s.value); setSectorError(false) }}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedSector === s.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                  : 'border-slate-200 dark:border-gray-700 hover:border-slate-300 bg-white dark:bg-gray-800'
              }`}
            >
              <p className={`font-medium text-sm ${selectedSector === s.value ? 'text-indigo-800 dark:text-indigo-200' : 'text-slate-800 dark:text-gray-200'}`}>
                {s.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{s.desc}</p>
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
              Other
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Doesn't fit the above categories</p>
          </button>
        </div>
        {sectorError && (
          <p className="text-xs text-red-500 mt-2">Please select a sector to continue</p>
        )}
      </div>

      <Button onClick={handleNext} disabled={!titleValid || !descValid || loading} loading={loading} className="w-full" size="lg">
        Analyze My Idea →
      </Button>
    </motion.div>
  )
}

// ─── Step 1: AI Analysis ──────────────────────────────────────────────────────

function Step1({ aiInsights, setAiInsights, aiLoading, confirmedBusinessType, setConfirmedBusinessType, onNext, onBack }) {
  const [msgIdx, setMsgIdx] = useState(0)
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue]       = useState('')

  useEffect(() => {
    if (!aiLoading) return
    const t = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MSGS.length), 1500)
    return () => clearInterval(t)
  }, [aiLoading])

  const cards = [
    { key: 'problemStatement',   label: "The problem you're solving" },
    { key: 'uniqueSellingPoint', label: 'What makes it different' },
    { key: 'targetAudience',     label: "Who it's for" },
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
          Analysis complete
        </span>
      </div>

      {/* Insight cards */}
      <div className="bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 space-y-5">
        <h3 className="font-bold text-slate-900 dark:text-white">Here's what we understand about your idea</h3>
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
                  Edit
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
                  Done
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
          Based on your idea, this looks like a
          <strong className="text-indigo-600 dark:text-indigo-400 mx-1">
            {aiInsights?.suggestedBusinessType === 'B2B'
              ? 'B2B business (selling to other businesses)'
              : 'B2C business (selling directly to people)'}
          </strong>
        </p>
        {aiInsights?.businessTypeReason && (
          <p className="text-xs text-slate-500 dark:text-gray-400">{aiInsights.businessTypeReason}</p>
        )}
        <p className="text-xs font-medium text-slate-600 dark:text-gray-300 mt-3 mb-2">
          Does this sound right?
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
            Yes, selling to people
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
            No, selling to businesses
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Button onClick={onNext} disabled={!confirmedBusinessType} className="w-full" size="lg">
          Continue →
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-slate-500 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition-colors text-center"
        >
          Edit my description
        </button>
      </div>
    </motion.div>
  )
}

// ─── Step 2: Your Business ────────────────────────────────────────────────────

function Step2({ selectedSector, estimatedBudget, setEstimatedBudget, ammanRegion, setAmmanRegion, onNext, onBack }) {
  const valid = (parseFloat(estimatedBudget) || 0) > 0 && !!ammanRegion

  return (
    <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-7">

      {/* Budget */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-1.5">
          How much money do you have to start? (JOD) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={estimatedBudget}
          onChange={e => setEstimatedBudget(e.target.value)}
          placeholder="e.g. 15000"
          min="1"
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        {BUDGET_HINTS[selectedSector] && (
          <p className="text-xs text-slate-500 mt-1">{BUDGET_HINTS[selectedSector]}</p>
        )}
      </div>

      {/* Region */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-3">
          Where in Amman will you operate? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {AMMAN_REGIONS.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => setAmmanRegion(r.value)}
              className={`py-3 px-3 rounded-lg text-sm border transition-all text-left ${
                ammanRegion === r.value
                  ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:border-slate-300'
              }`}
            >
              <p className={`font-medium text-xs ${ammanRegion === r.value ? 'text-indigo-800 dark:text-indigo-200' : 'text-slate-800 dark:text-gray-200'}`}>
                {r.label}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">{r.sub}</p>
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
          ← Back
        </button>
        <Button onClick={onNext} disabled={!valid} className="flex-1" size="lg">
          Continue →
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Step 3: Review ───────────────────────────────────────────────────────────

function Step3({ title, selectedSector, aiInsights, confirmedBusinessType, estimatedBudget, ammanRegion, onSubmit, onBack, loading }) {
  const sectorLabel = SECTORS.find(s => s.value === selectedSector)?.label || selectedSector
  const regionLabel = AMMAN_REGIONS.find(r => r.value === ammanRegion)?.label || ammanRegion
  const truncate = (str, n) => str && str.length > n ? str.slice(0, n) + '...' : (str || '—')

  return (
    <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">

      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Review before submitting</h3>
        <p className="text-sm text-slate-500 dark:text-gray-500">Make sure everything looks right.</p>
      </div>

      {/* Your Idea */}
      <div className="rounded-xl border border-slate-200 dark:border-gray-700 p-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">Your Idea</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          {sectorLabel}
        </span>
      </div>

      {/* AI Insights */}
      <div className="rounded-xl border border-slate-200 dark:border-gray-700 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">AI Insights</p>
        <div>
          <p className="text-xs text-slate-500 dark:text-gray-500 mb-0.5">Problem</p>
          <p className="text-sm text-slate-700 dark:text-gray-300">{truncate(aiInsights?.problemStatement, 80)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-gray-500 mb-0.5">What makes it different</p>
          <p className="text-sm text-slate-700 dark:text-gray-300">{truncate(aiInsights?.uniqueSellingPoint, 80)}</p>
        </div>
      </div>

      {/* Business Type */}
      <div className="rounded-xl border border-slate-200 dark:border-gray-700 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2">Business Type</p>
        <p className="text-sm font-medium text-slate-800 dark:text-gray-200">
          {confirmedBusinessType === 'B2B'
            ? 'Selling to businesses (B2B)'
            : 'Selling to people (B2C)'}
        </p>
      </div>

      {/* Your Details */}
      <div className="rounded-xl border border-slate-200 dark:border-gray-700 p-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">Your Details</p>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 dark:text-gray-500">Starting budget</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {parseFloat(estimatedBudget).toLocaleString()} JOD
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 dark:text-gray-500">Location</span>
          <span className="font-medium text-slate-900 dark:text-white">{regionLabel}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
        >
          ← Back
        </button>
        <Button onClick={onSubmit} loading={loading} className="flex-1" size="lg">
          {loading ? 'Submitting...' : 'Submit for Evaluation →'}
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SubmitIdea = () => {
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
      addToast('Idea submitted successfully!', 'success')
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
            Tell us about your idea
          </h1>
          <p className="text-slate-500 dark:text-gray-500 mb-8 text-sm">
            We'll analyze it and build a financial model tailored to the Amman market.
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
            📍 Mashroo3i is built for entrepreneurs in Amman, Jordan
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default SubmitIdea
