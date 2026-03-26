// pages/Financial.jsx — 3-Layer Results Design (Phase 4)
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { financial as finApi, ideas as ideasApi } from '../services/api'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
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

function statusIcon(status) {
  if (status === 'ok')      return <span className="text-green-600 font-bold">✅</span>
  if (status === 'warning') return <span className="text-amber-500 font-bold">⚠️</span>
  return                           <span className="text-red-600 font-bold">🔴</span>
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
          /* No financial plan */
          <Card className="text-center py-20">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No financial analysis yet</h3>
            <p className="text-sm text-slate-500 dark:text-gray-500 mb-6">
              Submit a new idea through the wizard to get a complete financial analysis.
            </p>
            <Link to="/submit-idea">
              <Button>Submit a New Idea</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">

            {/* ─── LAYER 1: Summary ─────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-4">

              {/* Red flags */}
              {redFlags.length > 0 && (
                <div className="space-y-2">
                  {redFlags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                      <span className="text-amber-500 flex-shrink-0">⚠️</span>
                      <p className="text-sm text-amber-800 dark:text-amber-300">{flag}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 3 Key Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Monthly Revenue */}
                <div className="rounded-2xl border border-slate-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900">
                  <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mb-2">Monthly income</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{fmtJOD(result.monthlyRevenue)}</p>
                  <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">Based on your price × estimated sales volume</p>
                </div>

                {/* Break-Even */}
                <div className="rounded-2xl border border-slate-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900">
                  <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mb-2">
                    <Tooltip text={TOOLTIPS.breakEven}>Time to break even</Tooltip>
                  </p>
                  <p className={`text-2xl font-bold ${bepColor(result.breakEvenMonths)}`}>
                    {result.breakEvenMonths > 0 && result.breakEvenMonths < 9999
                      ? `${result.breakEvenMonths} months`
                      : 'Not reached'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">When your income starts covering all costs</p>
                </div>

                {/* LTV:CAC */}
                <div className="rounded-2xl border border-slate-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900">
                  <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mb-2">
                    <Tooltip text={TOOLTIPS.ltvCac}>Return on customer acquisition</Tooltip>
                  </p>
                  <p className={`text-2xl font-bold ${ltvCacColor(result.ltvCacRatio)}`}>
                    {result.ltvCacRatio > 0 ? `${result.ltvCacRatio.toFixed(1)}:1` : '—'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">
                    <Tooltip text={TOOLTIPS.ltvCac}>How much a customer is worth vs. cost to acquire</Tooltip>
                  </p>
                </div>
              </div>

              {/* Gross margin statement */}
              {gmExample && (
                <div className="bg-slate-50 dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 px-5 py-4">
                  <p className="text-sm text-slate-600 dark:text-gray-400">
                    For every <strong>10 JOD</strong> you earn, approximately{' '}
                    <strong className="text-slate-800 dark:text-gray-200">{gmExample} JOD</strong> remains after your direct costs.{' '}
                    <span className="text-xs text-slate-400 dark:text-gray-500">
                      (<Tooltip text={TOOLTIPS.grossMargin}>Gross margin</Tooltip>: {gmPct.toFixed(1)}%)
                    </span>
                  </p>
                </div>
              )}
            </motion.div>

            {/* ─── LAYER 2: Scenarios + Chart ───────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <ExpandableSection title="See financial scenarios">
                <div className="pt-5 space-y-6">

                  {/* 3 Scenario cards */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <ScenarioCard
                      label="Conservative"
                      subtitle="careful estimate"
                      data={result.conservative}
                    />
                    <ScenarioCard
                      label="Realistic"
                      subtitle="as planned"
                      data={result.realistic}
                      highlight
                    />
                    <ScenarioCard
                      label="Optimistic"
                      subtitle="strong growth"
                      data={result.optimistic}
                    />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-gray-500 leading-relaxed">
                    <strong>Conservative</strong> assumes fewer sales with higher costs.{' '}
                    <strong>Realistic</strong> is based on your inputs.{' '}
                    <strong>Optimistic</strong> assumes 40% more sales and lower costs.
                  </p>

                  {/* 12-Month Projection Chart */}
                  {chartData.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-4">
                        12-Month Income vs Expenses
                      </h4>
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
                  )}
                </div>
              </ExpandableSection>
            </motion.div>

            {/* ─── LAYER 3: Benchmarks + Assumptions ────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <ExpandableSection title="See how you compare to similar businesses">
                <div className="pt-5 space-y-6">

                  {/* Benchmark Table */}
                  {benchmarks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3">
                        Amman Market Benchmark Comparison
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-gray-700">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 dark:bg-gray-800">
                            <tr>
                              {['What', 'Your Value', 'Amman Benchmark', 'Status'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {benchmarks.map((row, i) => (
                              <tr key={i} className={`border-t border-slate-100 dark:border-gray-800 ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-gray-800/30' : ''}`}>
                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-gray-200 text-sm">{row.metric}</td>
                                <td className="px-4 py-3 text-slate-700 dark:text-gray-300 font-semibold">{row.yourValue}</td>
                                <td className="px-4 py-3 text-slate-500 dark:text-gray-500">{row.benchmarkTypical}</td>
                                <td className="px-4 py-3">{statusIcon(row.status)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Assumptions Log */}
                  {assumptions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1">
                        What we assumed in this calculation
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-gray-500 mb-3">
                        These estimates come from Amman market benchmarks. If your situation is different, submit a new idea with updated inputs.
                      </p>
                      <div className="bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-4">
                        <ul className="space-y-2">
                          {assumptions.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-gray-400">
                              <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <p className="text-xs text-slate-400 dark:text-gray-600 mt-3 leading-relaxed">
                        All benchmarks are based on research into Amman's market (2025). Results may vary for other cities or unusual business models.
                      </p>
                    </div>
                  )}
                </div>
              </ExpandableSection>
            </motion.div>

            {/* ─── Action ───────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Link to={`/business-plan/${ideaId}`} className="block">
                <Button className="w-full" size="lg">
                  Download Business Plan PDF
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
