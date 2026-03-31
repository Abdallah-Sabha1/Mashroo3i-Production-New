// pages/Financial.jsx — 3-Layer Results Design (Phase 4)
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { financial as finApi, ideas as ideasApi, getErrorMessage } from '../services/api'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import MetricCard from '../components/shared/MetricCard'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Tooltip, { TOOLTIPS } from '../components/ui/Tooltip'
import { Spinner } from '../components/ui/Loading'
import { formatCurrency } from '../utils/helpers'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtJOD(n) {
  if (!n && n !== 0) return '—'
  return `${Math.round(n).toLocaleString()} JOD`
}

function bepColor(months) {
  if (months <= 0 || months > 9998) return 'text-red-600 dark:text-red-400'
  if (months <= 12) return 'text-green-600 dark:text-green-400'
  if (months <= 18) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function ltvCacColor(ratio) {
  if (ratio >= 3) return 'text-green-600 dark:text-green-400'
  if (ratio >= 1) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function statusLabel(status) {
  if (status === 'ok')      return { text: 'Good',  cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' }
  if (status === 'warning') return { text: 'Watch', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' }
  return                           { text: 'Risk',  cls: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400' }
}

// ✅ FIX #10: Validate numeric inputs to ensure non-negative, finite values
function validatePrice(value) {
  const num = parseFloat(value)
  return !isNaN(num) && isFinite(num) && num >= 0
}

const CustomChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-slate-200 dark:border-gray-700 p-3 text-xs">
      <p className="font-semibold text-slate-700 dark:text-gray-300 mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} style={{ color: item.color }}>
          {item.name}: {Math.round(item.value).toLocaleString()} JOD
        </p>
      ))}
    </div>
  )
}

// ─── Expandable Section ───────────────────────────────────────────────────────

function ExpandableSection({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
        <svg className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-gray-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Scenario Card ────────────────────────────────────────────────────────────

function ScenarioCard({ label, subtitle, data, highlight }) {
  if (!data) return null
  const profit = data.monthlyProfit
  return (
    <div className={`flex-1 rounded-2xl border-2 p-5 ${
      highlight
        ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50'
        : 'border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900'
    }`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${
        highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-gray-400'
      }`}>{label}</p>
      <p className="text-xs text-slate-400 dark:text-gray-500 mb-4">{subtitle}</p>
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-slate-500 dark:text-gray-400">Monthly income</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-gray-200">{fmtJOD(data.monthlyRevenue)}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-slate-500 dark:text-gray-400">Monthly expenses</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-gray-200">{fmtJOD(data.monthlyCosts)}</span>
        </div>
        <div className="flex justify-between items-baseline pt-1 border-t border-slate-100 dark:border-gray-800">
          <span className="text-xs font-medium text-slate-600 dark:text-gray-300">Monthly profit</span>
          <span className={`text-sm font-bold ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {fmtJOD(profit)}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-slate-500 dark:text-gray-400">Time to break even</span>
          <span className={`text-sm font-semibold ${bepColor(data.breakEvenMonths)}`}>
            {data.breakEvenMonths > 0 && data.breakEvenMonths < 9999 ? `${data.breakEvenMonths} mo` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Financial = () => {
  const { ideaId }  = useParams()
  const [idea,      setIdea]      = useState(null)
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(true)

  // ── Form state ────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([{ name: '', price: '', cost: '' }])
  const [customersPerDay, setCustomersPerDay] = useState('')
  const [acquisitionChannel, setAcquisitionChannel] = useState('word_of_mouth')
  const [ammanRegion, setAmmanRegion] = useState('central')
  const [targetClientsRange, setTargetClientsRange] = useState('4_10')
  const [calculating, setCalculating] = useState(false)
  const [formError, setFormError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { initialInvestment: '' }
  })

  const onSubmit = async (data) => {
    const validProducts = products.filter(p => p.name && parseFloat(p.price) > 0)
    if (validProducts.length === 0) {
      setFormError('Please add at least one product or service with a name and price.')
      return
    }
    setCalculating(true)
    setFormError('')
    try {
      const isB2B = idea?.businessType === 'B2B'
      const payload = {
        initialInvestment: parseFloat(data.initialInvestment),
        products: validProducts.map(p => ({
          name: p.name,
          price: parseFloat(p.price) || 0,
          cost: parseFloat(p.cost) || 0,
        })),
        acquisitionChannel,
        ammanRegion,
        customersPerDay: !isB2B ? (parseFloat(customersPerDay) || 10) : undefined,
        targetClientsYear1Range: isB2B ? targetClientsRange : undefined,
        estimatedDealClosingMonths: isB2B ? 2 : undefined,
      }
      const res = await finApi.create(ideaId, payload)
      setResult(res.data)
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setCalculating(false)
    }
  }

  useEffect(() => { loadData() }, [ideaId])

  const loadData = async () => {
    try {
      const [ideaRes] = await Promise.all([ideasApi.getById(ideaId)])
      setIdea(ideaRes.data)
      try {
        const finRes = await finApi.get(ideaId)
        setResult(finRes.data)
      } catch { /* No financial plan yet */ }
    } catch (err) {
      console.error('Error loading financial data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="flex justify-center py-32"><Spinner size="lg" /></div>
      </div>
    )
  }

  // Chart data — first 12 months
  const chartData = (result?.monthlyProjections || []).slice(0, 12).map((p, i) => ({
    month:          `M${p.month || i + 1}`,
    Revenue:        Math.round(p.revenue  || 0),
    Expenses:       Math.round(p.costs    || 0),
    Profit:         Math.round(p.profit   || 0),
    cumulativeCash: Math.round(p.cumulativeCash || 0),
  }))

  const bep        = result?.breakEvenMonths || 0
  const bepLabel   = bep > 0 && bep <= 12 ? `M${bep}` : null
  const redFlags   = Array.isArray(result?.redFlags) ? result.redFlags : []
  const benchmarks = Array.isArray(result?.benchmarkComparisons) ? result.benchmarkComparisons : []
  const assumptions= Array.isArray(result?.assumptionsLog) ? result.assumptionsLog : []
  const gmPct      = result?.grossMarginPct || 0
  const gmExample  = gmPct > 0 ? (gmPct / 10).toFixed(1) : null

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
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
          <p className="text-sm text-slate-500 dark:text-gray-500 mt-1">
            Financial Analysis · {result?.businessType || 'B2C'}
          </p>
        </motion.div>

        {!result ? (
          /* ── Financial Input Form ── */
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Build your financial plan</h2>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                  Answer a few questions and we will calculate your revenue, break-even, and more.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Product / Service Table */}
                <div>
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-200">
                      What will you sell?
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                      Add your products or services — up to 5 items
                    </p>
                  </div>

                  <div className="space-y-2">
                    {/* Header row */}
                    <div className="grid grid-cols-12 gap-2 px-1">
                      <span className="col-span-5 text-xs font-medium text-slate-500 dark:text-gray-400">Name</span>
                      <span className="col-span-3 text-xs font-medium text-slate-500 dark:text-gray-400">Price (JOD)</span>
                      <span className="col-span-3 text-xs font-medium text-slate-500 dark:text-gray-400">Cost (JOD)</span>
                      <span className="col-span-1" />
                    </div>

                    {products.map((product, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          className="col-span-5 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder={idx === 0 ? 'e.g. Coffee' : 'e.g. Sandwich'}
                          value={product.name}
                          onChange={e => {
                            const updated = [...products]
                            updated[idx] = { ...updated[idx], name: e.target.value }
                            setProducts(updated)
                          }}
                        />
                        <input
                          type="number" min="0" step="0.01"
                          className="col-span-3 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="e.g. 3"
                          value={product.price}
                          onChange={e => {
                            if (validatePrice(e.target.value) || e.target.value === '') {
                              const updated = [...products]
                              updated[idx] = { ...updated[idx], price: e.target.value }
                              setProducts(updated)
                            }
                          }}
                        />
                        <input
                          type="number" min="0" step="0.01"
                          className="col-span-3 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="e.g. 1"
                          value={product.cost}
                          onChange={e => {
                            if (validatePrice(e.target.value) || e.target.value === '') {
                              const updated = [...products]
                              updated[idx] = { ...updated[idx], cost: e.target.value }
                              setProducts(updated)
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => { if (products.length > 1) setProducts(products.filter((_, i) => i !== idx)) }}
                          className="col-span-1 flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {products.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setProducts([...products, { name: '', price: '', cost: '' }])}
                      className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add another item
                    </button>
                  )}

                  {/* Live margin preview */}
                  {(() => {
                    const valid = products.filter(p => parseFloat(p.price) > 0)
                    if (valid.length === 0) return null
                    const avgPrice = valid.reduce((s, p) => s + parseFloat(p.price || 0), 0) / valid.length
                    const avgCost  = valid.reduce((s, p) => s + parseFloat(p.cost  || 0), 0) / valid.length
                    const margin   = avgPrice > 0 ? Math.round((avgPrice - avgCost) / avgPrice * 100) : 0
                    const keep     = (avgPrice - avgCost).toFixed(2)
                    return (
                      <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700">
                        <p className="text-xs text-slate-600 dark:text-gray-300">
                          For every <strong>{avgPrice.toFixed(2)} JOD</strong> average sale, you keep{' '}
                          <strong className="text-emerald-600">{keep} JOD</strong> after costs
                          <span className="text-slate-400 dark:text-gray-500 ml-1">({margin}% margin)</span>
                        </p>
                      </div>
                    )
                  })()}
                </div>

                {/* Customers per day (B2C) or Clients range (B2B) */}
                {idea?.businessType !== 'B2B' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                      How many customers do you expect per day?
                    </label>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mb-3">
                      Think about a typical day when you are open and running
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: '1–5',  value: 3 },
                        { label: '5–20', value: 12 },
                        { label: '20–50',value: 35 },
                        { label: '50+',  value: 75 },
                      ].map(opt => (
                        <button
                          key={opt.label} type="button"
                          onClick={() => setCustomersPerDay(opt.value)}
                          className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                            customersPerDay === opt.value
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-700 hover:border-indigo-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {customersPerDay && (
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
                        That is approximately {customersPerDay * 30} customers per month
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-3">
                      How many clients are you targeting in year 1?
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['1–3', '4–10', '11–30', '30+'].map((label, i) => {
                        const val = ['1_3', '4_10', '11_30', '30_plus'][i]
                        return (
                          <button key={val} type="button"
                            onClick={() => setTargetClientsRange(val)}
                            className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                              targetClientsRange === val
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-700 hover:border-indigo-300'
                            }`}
                          >{label}</button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Starting investment */}
                <Input
                  label="How much are you willing to invest to start? (JOD)"
                  type="number"
                  placeholder="e.g. 15000"
                  required
                  error={errors.initialInvestment?.message}
                  {...register('initialInvestment', {
                    required: 'Required',
                    min: { value: 1, message: 'Must be positive' }
                  })}
                />

                {/* Acquisition channel */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-3">
                    How will you find your first customers?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'word_of_mouth',        label: 'Word of mouth / personal network' },
                      { value: 'social_media_organic', label: 'Social media (Instagram, TikTok)' },
                      { value: 'paid_ads',             label: 'Paid ads (Instagram, Google)' },
                      { value: 'partnerships',         label: 'Partnerships or referrals' },
                      ...(idea?.businessType === 'B2B'
                        ? [{ value: 'direct_sales', label: 'Direct sales / cold outreach' }]
                        : []),
                    ].map(ch => (
                      <button
                        key={ch.value} type="button"
                        onClick={() => setAcquisitionChannel(ch.value)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border transition-all flex items-center gap-3 ${
                          acquisitionChannel === ch.value
                            ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200'
                            : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:border-slate-300'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          acquisitionChannel === ch.value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-gray-600'
                        }`} />
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amman region */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-3">
                    Where in Amman?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'west',    label: 'West Amman',  sub: 'Abdoun, Sweifieh' },
                      { value: 'central', label: 'Central',     sub: 'Downtown, Jabal' },
                      { value: 'east',    label: 'East Amman',  sub: 'Zarqa Road, Marka' },
                    ].map(r => (
                      <button
                        key={r.value} type="button"
                        onClick={() => setAmmanRegion(r.value)}
                        className={`py-3 px-3 rounded-lg text-sm border transition-all text-left ${
                          ammanRegion === r.value
                            ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-700'
                            : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:border-slate-300'
                        }`}
                      >
                        <p className={`font-medium text-xs ${
                          ammanRegion === r.value
                            ? 'text-indigo-800 dark:text-indigo-200'
                            : 'text-slate-800 dark:text-gray-200'
                        }`}>{r.label}</p>
                        <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">{r.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error message */}
                {formError && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3">
                    <p className="text-sm text-red-700 dark:text-red-400">{formError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={calculating}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {calculating ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Calculating...
                    </>
                  ) : 'Calculate My Financial Plan'}
                </button>

              </form>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">

            {/* Red flags */}
            {redFlags.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="rounded-xl border border-amber-200 dark:border-amber-800/50
                  bg-white dark:bg-gray-900 overflow-hidden">
                  {redFlags.map((flag, i) => (
                    <div key={i} className={`flex items-start gap-3 px-4 py-3 ${
                      i < redFlags.length - 1
                        ? 'border-b border-amber-100 dark:border-amber-900/50'
                        : ''
                    }`}>
                      <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">{flag}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Key metrics — clean row list */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="rounded-xl border border-slate-200 dark:border-gray-800
                bg-white dark:bg-gray-900 overflow-hidden">
                {[
                  {
                    label: 'Monthly income',
                    sub:   'Based on your products × estimated customers',
                    value: fmtJOD(result.monthlyRevenue),
                    good:  true,
                  },
                  {
                    label: 'Monthly expenses',
                    sub:   'Products cost + estimated fixed costs',
                    value: fmtJOD(result.monthlyCosts),
                    good:  false,
                  },
                  {
                    label:  'Monthly profit',
                    sub:    (result.monthlyRevenue - result.monthlyCosts) >= 0
                              ? 'What remains after all costs'
                              : 'You are spending more than you earn',
                    value:  fmtJOD(Math.abs(result.monthlyRevenue - result.monthlyCosts)),
                    good:   (result.monthlyRevenue - result.monthlyCosts) >= 0,
                    prefix: (result.monthlyRevenue - result.monthlyCosts) < 0 ? '−' : '',
                  },
                  {
                    label: 'Time to break even',
                    sub:   'When your total income covers your investment',
                    value: result.breakEvenMonths > 0 && result.breakEvenMonths < 999
                             ? `${result.breakEvenMonths} months`
                             : 'Not reached in 2 years',
                    good:  result.breakEvenMonths > 0 && result.breakEvenMonths <= 18,
                  },
                ].map((m, i, arr) => (
                  <div key={m.label}
                    className={`flex items-center justify-between px-5 py-4 ${
                      i < arr.length - 1
                        ? 'border-b border-slate-100 dark:border-gray-800'
                        : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-gray-200">{m.label}</p>
                      <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">{m.sub}</p>
                    </div>
                    <p className={`text-base font-semibold tabular-nums ${
                      m.good
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {m.prefix}{m.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Gross margin plain language */}
            {gmExample && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="rounded-xl border border-slate-200 dark:border-gray-800
                  bg-white dark:bg-gray-900 px-5 py-4">
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                    For every{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">10 JOD</span>{' '}
                    you earn, approximately{' '}
                    <span className="font-semibold text-emerald-600">{gmExample} JOD</span>{' '}
                    remains after the cost of your products.{' '}
                    <span className="text-slate-400 dark:text-gray-500 text-xs">
                      (Gross margin: {gmPct.toFixed(1)}%)
                    </span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* 3 Scenarios */}
            {result.realistic && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="rounded-xl border border-slate-200 dark:border-gray-800
                  bg-white dark:bg-gray-900 overflow-hidden">

                  <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Three possible outcomes
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                      The future is uncertain — here are three scenarios.
                    </p>
                  </div>

                  {/* Realistic — prominent */}
                  <div className="px-5 py-4 bg-indigo-50/40 dark:bg-indigo-950/20
                    border-b border-slate-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">As planned</p>
                        <p className="text-xs text-slate-400 dark:text-gray-500">Based on your inputs</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full
                        bg-indigo-100 dark:bg-indigo-900
                        text-indigo-700 dark:text-indigo-300 font-medium">
                        Most likely
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Monthly income', value: fmtJOD(result.realistic.monthlyRevenue), good: true },
                        { label: 'Monthly profit',  value: fmtJOD(result.realistic.monthlyProfit),  good: result.realistic.monthlyProfit >= 0 },
                        {
                          label: 'Break even',
                          value: result.realistic.breakEvenMonths > 0 && result.realistic.breakEvenMonths < 999
                            ? `${result.realistic.breakEvenMonths} mo` : 'N/A',
                          good: true,
                        },
                      ].map(item => (
                        <div key={item.label}>
                          <p className="text-xs text-slate-400 dark:text-gray-500">{item.label}</p>
                          <p className={`text-sm font-semibold mt-0.5 ${
                            item.good ? 'text-slate-900 dark:text-white' : 'text-red-600 dark:text-red-400'
                          }`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conservative + Optimistic */}
                  <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-gray-800">
                    {[
                      { key: 'conservative', label: 'If things are slower', sub: 'Fewer customers, higher costs' },
                      { key: 'optimistic',   label: 'If growth is strong',  sub: '40% more customers' },
                    ].map(({ key, label, sub }) => {
                      const s = result[key]
                      if (!s) return null
                      return (
                        <div key={key} className="px-5 py-4">
                          <p className="text-xs font-medium text-slate-700 dark:text-gray-300">{label}</p>
                          <p className="text-xs text-slate-400 dark:text-gray-500 mb-3">{sub}</p>
                          <p className="text-xs text-slate-400 dark:text-gray-500">Monthly profit</p>
                          <p className={`text-sm font-semibold mt-0.5 ${
                            s.monthlyProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {fmtJOD(s.monthlyProfit)}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-gray-500 mt-2">Break even</p>
                          <p className="text-xs font-medium text-slate-700 dark:text-gray-300">
                            {s.breakEvenMonths > 0 && s.breakEvenMonths < 999
                              ? `${s.breakEvenMonths} months` : 'N/A'}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Benchmark comparisons */}
            {benchmarks.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="rounded-xl border border-slate-200 dark:border-gray-800
                  bg-white dark:bg-gray-900 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      How you compare to similar businesses in Amman
                    </h3>
                  </div>
                  {benchmarks.map((item, i) => {
                    const sl = statusLabel(item.status)
                    return (
                      <div key={i}
                        className={`flex items-center justify-between px-5 py-3 ${
                          i < benchmarks.length - 1
                            ? 'border-b border-slate-100 dark:border-gray-800'
                            : ''
                        }`}
                      >
                        <p className="text-sm text-slate-600 dark:text-gray-400">{item.metric}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {item.yourValue}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-gray-500">
                            vs {item.benchmarkTypical}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sl.cls}`}>
                            {sl.text}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Assumptions log */}
            {assumptions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <details className="group">
                  <summary className="cursor-pointer text-xs text-slate-400 dark:text-gray-600
                    hover:text-slate-600 dark:hover:text-gray-400 flex items-center gap-2 py-1 list-none">
                    <svg className="w-3 h-3 group-open:rotate-90 transition-transform"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    What we assumed in this calculation
                  </summary>
                  <div className="mt-3 space-y-1.5 pl-5 border-l-2 border-slate-100 dark:border-gray-800">
                    {assumptions.map((a, i) => (
                      <p key={i} className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed">{a}</p>
                    ))}
                    <p className="text-xs text-slate-300 dark:text-gray-700 italic mt-2">
                      Based on Amman market research (2025). Results are estimates.
                    </p>
                  </div>
                </details>
              </motion.div>
            )}

            {/* Chart */}
            {chartData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="rounded-xl border border-slate-200 dark:border-gray-800
                  bg-white dark:bg-gray-900 p-5">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-4">
                    Revenue vs costs — 12 months
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" width={55}
                        tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {bepLabel && (
                        <ReferenceLine
                          x={bepLabel}
                          stroke="#16a34a"
                          strokeDasharray="4 2"
                          label={{ value: 'Break-even', position: 'top', fontSize: 10, fill: '#16a34a' }}
                        />
                      )}
                      <Line type="monotone" dataKey="Revenue"  name="Monthly income"   stroke="#6366f1" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Expenses" name="Monthly expenses"  stroke="#ef4444" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Profit"   name="Monthly profit"   stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Action */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Link to={`/business-plan/${ideaId}`} className="block">
                <Button className="w-full" variant="secondary">
                  Download Business Plan (PDF)
                </Button>
              </Link>
            </motion.div>

          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Financial
