// pages/SubmitIdea.jsx — 5-Step Business Wizard (Phase 3)
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api, { ideas as ideasApi, financial as financialApi } from '../services/api'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_NAMES = ['Your Idea', 'AI Analysis', 'Business Type', 'Your Customer', 'Your Numbers']

const SECTORS = [
  { value: 'food_and_beverage',      emoji: '🍕', label: 'Food & Beverage',       desc: 'Restaurants, cafés, catering, food delivery' },
  { value: 'retail_ecommerce',       emoji: '🛍️', label: 'Retail & E-commerce',   desc: 'Online or physical store, products, reselling' },
  { value: 'tech_and_software',      emoji: '💻', label: 'Tech & Software',        desc: 'Apps, websites, digital tools, software' },
  { value: 'education_and_training', emoji: '📚', label: 'Education & Training',   desc: 'Tutoring, courses, coaching, training' },
  { value: 'health_and_wellness',    emoji: '💪', label: 'Health & Wellness',      desc: 'Gym, clinic, nutrition, beauty, personal care' },
  { value: 'professional_services',  emoji: '🔧', label: 'Professional Services',  desc: 'Consulting, marketing, accounting, design, IT' },
  { value: 'other',                  emoji: '❓', label: 'Other',                  desc: "My idea doesn't fit the above categories" },
]
const SECTOR_MAP = Object.fromEntries(SECTORS.map(s => [s.value, s.label]))

const B2C_CHANNELS = [
  { value: 'referral', emoji: '🗣️', label: 'Word of mouth / personal network', desc: 'Tell friends and family, ask for referrals' },
  { value: 'social',   emoji: '📱', label: 'Social media (organic)',            desc: 'Post on Instagram, TikTok — no paid ads' },
  { value: 'paid',     emoji: '📢', label: 'Paid ads',                          desc: 'Run ads on Instagram, Google, or TikTok' },
  { value: 'events',   emoji: '🤝', label: 'Partnerships or referrals',         desc: 'Partner with other businesses or join referral programs' },
  { value: 'seo',      emoji: '🔍', label: 'SEO / search engine',               desc: 'Get found on Google when people search' },
]
const B2B_CHANNELS = [
  ...B2C_CHANNELS,
  { value: 'cold_outreach', emoji: '📞', label: 'Direct sales / cold outreach', desc: 'Call or email potential clients directly' },
]

const DECISION_MAKERS = [
  { value: 'owner',      emoji: '👤', label: 'Owner / Founder' },
  { value: 'manager',    emoji: '👔', label: 'Manager / Director' },
  { value: 'technical',  emoji: '💻', label: 'IT / Technical lead' },
  { value: 'operations', emoji: '📦', label: 'Procurement / Operations' },
]

const B2C_SALES_RANGES  = ['1–10', '10–50', '50–200', '200+']
const B2B_CLIENT_RANGES = ['1–3', '4–10', '11–30', '30+']
const DEAL_OPTIONS = [
  { label: 'Less than 1 month', value: '0.5' },
  { label: '1–3 months',        value: '2'   },
  { label: '3–6 months',        value: '4.5' },
  { label: '6+ months',         value: '8'   },
]

const REGIONS = [
  { value: 'west',    emoji: '🏙️', label: 'West Amman',    desc: 'Abdoun, Sweifieh, Shmeisani — premium customers, higher costs',       rentHint: 'Typical rent: 800–1,500 JOD/month' },
  { value: 'central', emoji: '🕌', label: 'Central Amman', desc: 'Downtown, Jabal Amman, Lweibdeh — mixed, medium pricing',              rentHint: 'Typical rent: 500–900 JOD/month' },
  { value: 'east',    emoji: '🏘️', label: 'East Amman',    desc: 'Zarqa Road, Marka, Qweismeh — price-sensitive market, lower costs',    rentHint: 'Typical rent: 300–600 JOD/month' },
]

const STARTUP_HINTS = {
  food_and_beverage:      'Typical for this sector in Amman: 8,000–40,000 JOD',
  retail_ecommerce:       'Typical: 2,000–30,000 JOD',
  tech_and_software:      'Typical: 3,000–25,000 JOD',
  education_and_training: 'Typical: 1,500–20,000 JOD',
  health_and_wellness:    'Typical: 5,000–60,000 JOD',
  professional_services:  'Typical: 500–8,000 JOD',
}

const PRICE_PLACEHOLDERS = {
  food_and_beverage:      'e.g. 8 JOD per meal',
  retail_ecommerce:       'e.g. 25 JOD per item',
  tech_and_software:      'e.g. 15 JOD per month',
  education_and_training: 'e.g. 50 JOD per month',
  health_and_wellness:    'e.g. 40 JOD per month',
  professional_services:  'e.g. 300 JOD per project',
}
const COST_PLACEHOLDERS = {
  food_and_beverage:      'e.g. 3 JOD ingredients per meal',
  retail_ecommerce:       'e.g. 12 JOD product cost',
  professional_services:  "e.g. 0 if it's just your time",
}

const UNSUPPORTED_B2B = ['food_and_beverage', 'retail_ecommerce', 'health_and_wellness']

const LOADING_MSGS = [
  'Reading your idea...',
  'Thinking about the Amman market...',
  'Identifying your customers...',
]

const INITIAL_DATA = {
  title: '', description: '', sector: '',
  problemStatement: '', uniqueSellingPoint: '', targetAudience: '',
  suggestedBusinessType: '', businessTypeReason: '', suggestedMonthlySalesRange: '',
  businessType: '',
  customerDescription: '', decisionMaker: '', acquisitionChannel: '',
  estimatedMonthlySalesRange: '', targetClientsYear1Range: '', estimatedDealClosingMonths: '2',
  plannedPrice: '', costToDeliver: '',
  hasPhysicalLocation: null, rent: '',
  hasEmployees: null, numEmployees: '', salaryPerEmployee: '', otherCosts: '',
  initialInvestment: '', ammanRegion: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeFixedCosts(data) {
  let total = 0
  if (data.hasPhysicalLocation === true) total += parseFloat(data.rent) || 0
  if (data.hasEmployees === true) {
    const n = parseInt(data.numEmployees) || 0
    const s = parseFloat(data.salaryPerEmployee) || 0
    total += n * s * 1.1425
  }
  total += parseFloat(data.otherCosts) || 0
  return Math.round(total)
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function CardGrid({ options, value, onChange, cols = 2 }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-${cols} gap-3`}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`text-left p-4 rounded-xl border-2 transition-all duration-200 min-h-[56px] ${
            value === opt.value
              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:border-indigo-500'
              : 'border-slate-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
            <span className={`font-semibold text-sm ${value === opt.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-gray-200'}`}>
              {opt.label}
            </span>
          </div>
          {opt.desc && <p className="text-xs text-slate-500 dark:text-gray-500 mt-1 ml-8">{opt.desc}</p>}
        </button>
      ))}
    </div>
  )
}

function RangePills({ options, value, onChange, suggestedValue }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const selected  = value === opt
        const suggested = !value && opt === suggestedValue
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
              selected   ? 'border-indigo-600 bg-indigo-600 text-white' :
              suggested  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' :
                           'border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:border-indigo-300 bg-white dark:bg-gray-900'
            }`}
          >
            {opt}{suggested && <span className="ml-1.5 text-xs opacity-75">(AI)</span>}
          </button>
        )
      })}
    </div>
  )
}

function YesNo({ value, onChange, yesLabel = 'Yes', noLabel = 'No' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {[{ label: yesLabel, v: true }, { label: noLabel, v: false }].map(({ label, v }) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
            value === v
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:border-indigo-300 bg-white dark:bg-gray-900'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function NumberInput({ label, helper, hint, prefix = 'JOD', placeholder, value, onChange, small }) {
  return (
    <div>
      {label && <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-1">{label}</label>}
      {helper && <p className="text-xs text-slate-500 dark:text-gray-500 mb-1.5">{helper}</p>}
      {hint && <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1.5">{hint}</p>}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 text-sm font-medium pointer-events-none">{prefix}</span>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min="0"
          className={`w-full pl-14 pr-4 ${small ? 'py-2' : 'py-3'} rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
        />
      </div>
    </div>
  )
}

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{children}</h3>
      {sub && <p className="text-xs text-slate-500 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function NavButtons({ onBack, onNext, nextLabel = 'Continue →', disabled, loading }) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
        >
          ← Back
        </button>
      )}
      <Button onClick={onNext} disabled={disabled || loading} loading={loading} className="flex-1" size="lg">
        {nextLabel}
      </Button>
    </div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

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
          <span key={name} className={`text-xs ${i <= step ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-400 dark:text-gray-600'}`}>
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Step 1: Your Idea ────────────────────────────────────────────────────────

function Step1({ data, setField, onNext, loading }) {
  const valid = data.title.trim().length >= 5 && data.description.trim().length >= 100 && !!data.sector
  const descLeft = Math.max(0, 100 - data.description.length)

  return (
    <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-1.5">
          What is your business idea called? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.title}
          onChange={e => setField('title', e.target.value)}
          placeholder="e.g. Home cleaning service, Online tutoring, Coffee shop"
          maxLength={200}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        {data.title.length > 0 && data.title.length < 5 && (
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
          value={data.description}
          onChange={e => setField('description', e.target.value)}
          rows={6}
          placeholder="e.g. I want to open a café in Sweifieh that focuses on specialty coffee and remote work space. Many young professionals in Amman struggle to find quiet, well-designed places to work from..."
          maxLength={2000}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          {descLeft > 0 ? (
            <p className="text-xs text-orange-500">{descLeft} more characters needed</p>
          ) : (
            <p className="text-xs text-green-600 dark:text-green-400">Good length</p>
          )}
          <p className="text-xs text-slate-400">{data.description.length} chars</p>
        </div>
      </div>

      {/* Sector */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-3">
          What field is your idea in? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SECTORS.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setField('sector', s.value)}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                data.sector === s.value
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:border-indigo-500'
                  : 'border-slate-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{s.emoji}</span>
                <span className={`font-semibold text-sm ${data.sector === s.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-gray-200'}`}>
                  {s.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1 ml-8">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={onNext} disabled={!valid || loading} loading={loading} className="w-full" size="lg">
        Analyze My Idea →
      </Button>
    </motion.div>
  )
}

// ─── Step 2: AI Analysis ──────────────────────────────────────────────────────

function Step2({ data, aiLoading, onNext, onBack }) {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    if (!aiLoading) return
    const t = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MSGS.length), 1600)
    return () => clearInterval(t)
  }, [aiLoading])

  if (aiLoading) {
    return (
      <motion.div key="s2-load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <path className="opacity-25" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
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
    <motion.div key="s2-done" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 text-sm font-medium px-4 py-2 rounded-full border border-green-200 dark:border-green-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Analysis complete
        </span>
      </div>

      <div className="bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 space-y-5">
        <h3 className="font-bold text-slate-900 dark:text-white">Here's what we understand about your idea</h3>

        {[
          { label: 'The Problem You\'re Solving', text: data.problemStatement },
          { label: 'What Makes It Different',     text: data.uniqueSellingPoint },
          { label: 'Who It\'s For',               text: data.targetAudience },
        ].map(({ label, text }, i, arr) => (
          <div key={label} className={i < arr.length - 1 ? 'pb-5 border-b border-slate-200 dark:border-gray-800' : ''}>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">{label}</p>
            <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">{text || '—'}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Button onClick={onNext} className="w-full" size="lg">
          Looks right, continue →
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

// ─── Step 3: Confirm Business Type ────────────────────────────────────────────

function Step3({ data, onConfirm, onBack, showModal, onModalChoice }) {
  const suggested   = (data.suggestedBusinessType || 'B2C').toUpperCase()
  const isB2C       = suggested === 'B2C'
  const sectorLabel = SECTOR_MAP[data.sector] || 'your sector'

  return (
    <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">

      <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-2">Based on your idea, this looks like a</p>
        <p className="text-xl font-bold text-slate-900 dark:text-white mb-3">
          {isB2C
            ? 'B2C business — selling directly to people'
            : 'B2B business — selling to other companies'}
        </p>
        {data.businessTypeReason && (
          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">{data.businessTypeReason}</p>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3">Does this sound right?</p>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => onConfirm('B2C')}
            className="w-full text-left p-5 rounded-xl border-2 border-slate-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-gray-900 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-semibold text-slate-800 dark:text-gray-200 text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  Yes, I'm selling to people (B2C)
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-0.5">Customers pay you directly — retail, subscriptions, services</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onConfirm('B2B')}
            className="w-full text-left p-5 rounded-xl border-2 border-slate-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-gray-900 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏢</span>
              <div>
                <p className="font-semibold text-slate-800 dark:text-gray-200 text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  No, I'm selling to businesses (B2B)
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-0.5">Your clients are companies, not individual people</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-slate-500 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        ← Back
      </button>

      {/* B2B + Unsupported Sector Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-7 max-w-md w-full shadow-2xl border border-slate-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3 mb-5">
                <span className="text-3xl mt-0.5">⚠️</span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">A quick note</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                    Most <strong className="text-slate-800 dark:text-gray-200">{sectorLabel}</strong> businesses in Amman sell directly to customers (B2C).
                  </p>
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed mt-2">
                    If you're planning to supply other businesses — like supplying restaurants, clinics, or retailers — your idea works better as a Professional Services B2B.
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 mt-4 mb-3">What fits your idea better?</p>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onModalChoice('keep_b2c')}
                  className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-gray-700 hover:border-indigo-400 bg-white dark:bg-gray-800 text-sm font-medium text-slate-800 dark:text-gray-200 text-left transition-all"
                >
                  Keep as B2C — I sell directly to customers
                </button>
                <button
                  type="button"
                  onClick={() => onModalChoice('switch')}
                  className="w-full p-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-sm font-medium text-indigo-700 dark:text-indigo-300 text-left transition-all"
                >
                  Switch to Professional Services B2B
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Step 4: Your Customer ────────────────────────────────────────────────────

function Step4({ data, setField, onNext, onBack }) {
  const isB2B = data.businessType === 'B2B'
  const suggested = B2C_SALES_RANGES.includes(data.suggestedMonthlySalesRange) ? data.suggestedMonthlySalesRange : null

  const valid = isB2B
    ? !!(data.customerDescription && data.acquisitionChannel && data.targetClientsYear1Range && data.estimatedDealClosingMonths)
    : !!(data.customerDescription && data.acquisitionChannel && data.estimatedMonthlySalesRange)

  return (
    <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-7">

      {/* Q1: Customer description */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-1.5">
          {isB2B ? 'What kind of company will you sell to?' : 'Who is your typical customer?'}{' '}
          <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 dark:text-gray-500 mb-2">
          {isB2B
            ? 'Describe the type of company, industry, and size'
            : 'Think about: age, what they do, where they live in Amman, what they want'}
        </p>
        <textarea
          value={data.customerDescription}
          onChange={e => setField('customerDescription', e.target.value)}
          rows={3}
          placeholder={isB2B
            ? 'e.g. Small restaurants in Amman that need accounting software'
            : 'e.g. Young professionals in West Amman aged 25–35 who work remotely'}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
        />
      </div>

      {/* B2B only: Decision maker */}
      {isB2B && (
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-3">
            Who usually makes the buying decision in these companies?
          </label>
          <CardGrid
            options={DECISION_MAKERS}
            value={data.decisionMaker}
            onChange={v => setField('decisionMaker', v)}
            cols={2}
          />
        </div>
      )}

      {/* Q2: Acquisition channel */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-3">
          How do you plan to {isB2B ? 'reach your first clients' : 'find your first customers'}?{' '}
          <span className="text-red-500">*</span>
        </label>
        <CardGrid
          options={isB2B ? B2B_CHANNELS : B2C_CHANNELS}
          value={data.acquisitionChannel}
          onChange={v => setField('acquisitionChannel', v)}
          cols={1}
        />
      </div>

      {/* Q3: Sales / Clients range */}
      {isB2B ? (
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-2">
            How many clients are you targeting in your first year? <span className="text-red-500">*</span>
          </label>
          <RangePills
            options={B2B_CLIENT_RANGES}
            value={data.targetClientsYear1Range}
            onChange={v => setField('targetClientsYear1Range', v)}
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-2">
            How many customers do you think you can reach in your first month? <span className="text-red-500">*</span>
          </label>
          <RangePills
            options={B2C_SALES_RANGES}
            value={data.estimatedMonthlySalesRange}
            onChange={v => setField('estimatedMonthlySalesRange', v)}
            suggestedValue={suggested}
          />
          {suggested && !data.estimatedMonthlySalesRange && (
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
              We suggest <strong>{suggested}</strong> based on your idea. You can change this.
            </p>
          )}
        </div>
      )}

      {/* Q4 B2B only: Deal closing time */}
      {isB2B && (
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-3">
            How long do you think it takes to close one deal? <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {DEAL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setField('estimatedDealClosingMonths', opt.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                  data.estimatedDealClosingMonths === opt.value
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:border-indigo-300 bg-white dark:bg-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continue →" disabled={!valid} />
    </motion.div>
  )
}

// ─── Step 5: Your Numbers ─────────────────────────────────────────────────────

function Step5({ data, setField, fixedCosts, onSubmit, onBack, loading }) {
  const sector = data.sector || 'other'
  const isB2B  = data.businessType === 'B2B'
  const rentHint = REGIONS.find(r => r.value === data.ammanRegion)?.rentHint || ''

  const employeeCost = data.hasEmployees === true && data.numEmployees && data.salaryPerEmployee
    ? Math.round(parseInt(data.numEmployees || '0') * parseFloat(data.salaryPerEmployee || '0') * 1.1425)
    : null

  const canSubmit = !!(
    data.plannedPrice &&
    data.costToDeliver &&
    data.initialInvestment &&
    data.ammanRegion &&
    data.hasPhysicalLocation !== null &&
    data.hasEmployees !== null
  )

  return (
    <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8">

      {/* ── Section A: Pricing ── */}
      <section>
        <SectionTitle>Pricing</SectionTitle>
        <div className="space-y-4">
          <NumberInput
            label={isB2B ? 'Monthly price per client *' : 'Price per product or service *'}
            placeholder={PRICE_PLACEHOLDERS[sector] || 'e.g. 50 JOD'}
            value={data.plannedPrice}
            onChange={v => setField('plannedPrice', v)}
          />
          <NumberInput
            label="Your cost per sale *"
            helper="The direct cost to make or deliver one product/service — not rent or salaries"
            placeholder={COST_PLACEHOLDERS[sector] || 'e.g. 20 JOD'}
            value={data.costToDeliver}
            onChange={v => setField('costToDeliver', v)}
          />
        </div>
      </section>

      <hr className="border-slate-200 dark:border-gray-800" />

      {/* ── Section B: Fixed Costs ── */}
      <section>
        <SectionTitle sub="These are costs you pay every month regardless of how much you sell">
          Monthly Fixed Costs
        </SectionTitle>

        {/* Physical location */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-800 dark:text-gray-200 mb-3">Do you plan to have a physical location?</p>
          <YesNo
            value={data.hasPhysicalLocation}
            onChange={v => setField('hasPhysicalLocation', v)}
            yesLabel="Yes"
            noLabel="No, I'll operate online or from home"
          />
          <AnimatePresence>
            {data.hasPhysicalLocation === true && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <NumberInput
                  label="Estimated monthly rent"
                  hint={rentHint || 'Select your region below to see a rent estimate'}
                  placeholder="e.g. 700"
                  value={data.rent}
                  onChange={v => setField('rent', v)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Employees */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-800 dark:text-gray-200 mb-3">Do you plan to hire anyone in the first 6 months?</p>
          <YesNo
            value={data.hasEmployees}
            onChange={v => setField('hasEmployees', v)}
            yesLabel="Yes"
            noLabel="No, just me for now"
          />
          <AnimatePresence>
            {data.hasEmployees === true && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4 overflow-hidden"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">How many people?</label>
                  <input
                    type="number"
                    value={data.numEmployees}
                    onChange={e => setField('numEmployees', e.target.value)}
                    placeholder="e.g. 2"
                    min="1" max="50"
                    className="w-28 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <NumberInput
                  label="Estimated monthly salary per person"
                  helper="Minimum wage in Amman is 290 JOD/month. Skilled workers: 400–700 JOD/month."
                  placeholder="e.g. 400"
                  value={data.salaryPerEmployee}
                  onChange={v => setField('salaryPerEmployee', v)}
                />
                {employeeCost !== null && employeeCost > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm text-blue-700 dark:text-blue-300">Total employment cost:</span>
                      <span className="text-lg font-bold text-blue-800 dark:text-blue-200">{employeeCost.toLocaleString()} JOD/month</span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">(includes 14.25% social security)</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Other costs */}
        <div className="mb-6">
          <NumberInput
            label="Any other monthly costs? (utilities, software, phone, supplies)"
            placeholder="e.g. 100"
            value={data.otherCosts}
            onChange={v => setField('otherCosts', v)}
          />
        </div>

        {/* Total */}
        {fixedCosts > 0 && (
          <div className="bg-slate-50 dark:bg-gray-800 rounded-xl p-4 border border-slate-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-gray-400">Your estimated monthly fixed costs</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">{fixedCosts.toLocaleString()} JOD</span>
            </div>
          </div>
        )}
      </section>

      <hr className="border-slate-200 dark:border-gray-800" />

      {/* ── Section C: Starting Capital ── */}
      <section>
        <SectionTitle>Starting Capital</SectionTitle>
        <NumberInput
          label="How much are you willing to invest to start this business? *"
          helper="This is the total budget you have available to launch"
          hint={STARTUP_HINTS[sector]}
          placeholder="e.g. 15000"
          value={data.initialInvestment}
          onChange={v => setField('initialInvestment', v)}
        />
      </section>

      <hr className="border-slate-200 dark:border-gray-800" />

      {/* ── Section D: Amman Region ── */}
      <section>
        <SectionTitle sub="If you're operating online, choose where most of your customers are">
          Where in Amman do you plan to operate? *
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {REGIONS.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => setField('ammanRegion', r.value)}
              className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                data.ammanRegion === r.value
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:border-indigo-500'
                  : 'border-slate-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-900'
              }`}
            >
              <div className="text-2xl mb-2">{r.emoji}</div>
              <p className={`font-bold text-sm ${data.ammanRegion === r.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-gray-200'}`}>
                {r.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1 leading-tight">{r.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <NavButtons
        onBack={onBack}
        onNext={onSubmit}
        nextLabel="See My Results →"
        disabled={!canSubmit}
        loading={loading}
      />
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SubmitIdea = () => {
  const [step,        setStep]        = useState(0)
  const [data,        setData]        = useState(INITIAL_DATA)
  const [aiLoading,   setAiLoading]   = useState(false)
  const [submitLoad,  setSubmitLoad]  = useState(false)
  const [error,       setError]       = useState('')
  const [showModal,   setShowModal]   = useState(false)
  const navigate = useNavigate()

  const setField = useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }, [])

  const fixedCosts = computeFixedCosts(data)

  // ── Step 1 → 2: Run AI analysis ──
  const handleStep1Next = async () => {
    setError('')
    setAiLoading(true)
    setStep(1) // show loading state immediately
    try {
      const res = await api.post('/ideas/analyze', {
        title:       data.title,
        description: data.description,
        sector:      data.sector,
      })
      const ai = res.data
      setData(prev => ({
        ...prev,
        problemStatement:          ai.problemStatement         || '',
        uniqueSellingPoint:        ai.uniqueSellingPoint        || '',
        targetAudience:            ai.targetAudience            || '',
        suggestedBusinessType:     ai.suggestedBusinessType     || 'B2C',
        businessTypeReason:        ai.businessTypeReason        || '',
        suggestedMonthlySalesRange: ai.suggestedMonthlySalesRange || '',
      }))
    } catch {
      setError('AI analysis failed. Please check your connection and try again.')
      setStep(0)
    } finally {
      setAiLoading(false)
    }
  }

  // ── Step 3: Business type confirmed ──
  const handleConfirmType = (businessType) => {
    if (businessType === 'B2B' && UNSUPPORTED_B2B.includes(data.sector)) {
      setField('businessType', 'B2B')
      setShowModal(true)
    } else {
      setField('businessType', businessType)
      setStep(3)
    }
  }

  const handleModalChoice = (choice) => {
    setShowModal(false)
    if (choice === 'switch') {
      setData(prev => ({ ...prev, sector: 'professional_services', businessType: 'B2B' }))
    } else {
      setField('businessType', 'B2C')
    }
    setStep(3)
  }

  // ── Final submit ──
  const handleSubmit = async () => {
    setError('')
    setSubmitLoad(true)
    try {
      const ideaRes = await ideasApi.create({
        title:             data.title,
        description:       data.description,
        problemStatement:  data.problemStatement,
        usp:               data.uniqueSellingPoint,
        targetAudience:    data.customerDescription || data.targetAudience,
        businessType:      data.businessType,
        sector:            data.sector,
        ammanRegion:       data.ammanRegion,
        businessTypeReason: data.businessTypeReason,
        estimatedBudget:   parseFloat(data.initialInvestment) || 0,
        marketSize:        '',
        competitionLevel:  '',
      })

      const ideaId = ideaRes.data.ideaId

      const fin = {
        initialInvestment: parseFloat(data.initialInvestment) || 0,
        plannedPrice:      parseFloat(data.plannedPrice)      || 0,
        costToDeliver:     parseFloat(data.costToDeliver)     || 0,
        acquisitionChannel: data.acquisitionChannel || 'social',
      }
      if (data.businessType === 'B2C') {
        fin.estimatedMonthlySalesRange = data.estimatedMonthlySalesRange || '10-50'
      } else {
        fin.targetClientsYear1Range      = data.targetClientsYear1Range || '4-10'
        fin.estimatedDealClosingMonths   = parseFloat(data.estimatedDealClosingMonths) || 2
      }

      await financialApi.create(ideaId, fin)
      navigate('/dashboard')
    } catch (e) {
      setError(e.response?.data?.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitLoad(false)
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
                <Step1
                  data={data}
                  setField={setField}
                  onNext={handleStep1Next}
                  loading={aiLoading}
                />
              )}
              {step === 1 && (
                <Step2
                  data={data}
                  aiLoading={aiLoading}
                  onNext={() => setStep(2)}
                  onBack={() => { setStep(0); setAiLoading(false) }}
                />
              )}
              {step === 2 && (
                <Step3
                  data={data}
                  onConfirm={handleConfirmType}
                  onBack={() => setStep(1)}
                  showModal={showModal}
                  onModalChoice={handleModalChoice}
                />
              )}
              {step === 3 && (
                <Step4
                  data={data}
                  setField={setField}
                  onNext={() => setStep(4)}
                  onBack={() => setStep(2)}
                />
              )}
              {step === 4 && (
                <Step5
                  data={data}
                  setField={setField}
                  fixedCosts={fixedCosts}
                  onSubmit={handleSubmit}
                  onBack={() => setStep(3)}
                  loading={submitLoad}
                />
              )}
            </AnimatePresence>
          </Card>

          <p className="text-center text-xs text-slate-400 dark:text-gray-600 mt-6">
            Mashroo3i is built for entrepreneurs in Amman, Jordan
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default SubmitIdea
