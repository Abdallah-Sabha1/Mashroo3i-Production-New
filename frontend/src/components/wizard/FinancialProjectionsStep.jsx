import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import financialProjectionService from '../../services/financialProjectionService'
import BenchmarkInfoCard from '../financial/BenchmarkInfoCard'
import ScenarioCard from '../financial/ScenarioCard'
import ProjectionChart from '../financial/ProjectionChart'
import ProjectionTable from '../financial/ProjectionTable'
import { Skeleton } from '../ui/Loading'

const tabStyle = {
  green:  { active: 'bg-green-600  text-white', inactive: 'text-green-600  dark:text-green-400  hover:bg-green-50  dark:hover:bg-green-950/20'  },
  indigo: { active: 'bg-indigo-600 text-white', inactive: 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20' },
  red:    { active: 'bg-red-500    text-white', inactive: 'text-red-500    dark:text-red-400    hover:bg-red-50    dark:hover:bg-red-950/20'    },
}

const fmtJOD = n =>
  typeof n === 'number' ? `${Math.round(n).toLocaleString()}` : '—'

const FinancialProjectionsStep = ({ ideaId, industryType, businessModel }) => {
  const { t } = useTranslation()

  const SCENARIO_TABS = [
    { key: 'optimisticScenario',  label: t('financialWizard.projections.scenarios.optimistic'),  color: 'green'  },
    { key: 'realisticScenario',   label: t('financialWizard.projections.scenarios.realistic'),   color: 'indigo' },
    { key: 'pessimisticScenario', label: t('financialWizard.projections.scenarios.pessimistic'), color: 'red'    },
  ]

  const [projection, setProjection] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [error, setError]           = useState(null)
  const [activeTab, setActiveTab]   = useState('realisticScenario')
  const [showTable, setShowTable]   = useState(false)

  // Adjustment percentages (instead of asking for raw numbers)
  const [investmentAdj, setInvestmentAdj] = useState(0)    // ±% from benchmark
  const [revenueAdj, setRevenueAdj]       = useState(0)    // ±% from benchmark
  const [marginAdj, setMarginAdj]         = useState(0)    // ±% from benchmark
  const [growthAdj, setGrowthAdj]         = useState(0)    // ±% from benchmark
  const [useBenchmark, setUseBenchmark]   = useState(true) // Use benchmark defaults

  // ✅ FIX #4: Add retry tracking to prevent infinite loops
  const [createRetries, setCreateRetries] = useState(0)
  const MAX_RETRIES = 3

  // Initial load — create projection from benchmark
  useEffect(() => {
    // ✅ FIX #4: Validate inputs first
    if (!industryType || !businessModel) {
      setError(t('common.errorLoadingData'))
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    financialProjectionService.getProjection(ideaId)
      .then(res => {
        if (!active) return
        setProjection(res.data)
        setCreateRetries(0)
      })
      .catch(() => {
        // ✅ FIX #4: Check retry limit before creating
        if (createRetries >= MAX_RETRIES) {
          if (active) setError(t('financialWizard.projections.errorMsg'))
          if (active) setLoading(false)
          return
        }

        financialProjectionService.createProjection(ideaId, { industryType, businessModel })
          .then(res => {
            if (!active) return
            setProjection(res.data)
            setCreateRetries(0)
          })
          .catch(() => {
            if (active) {
              setError(t('financialWizard.projections.errorMsg'))
              // ✅ FIX #4: Increment retry count on failure
              setCreateRetries(prev => prev + 1)
            }
          })
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [ideaId, industryType, businessModel, createRetries, t])

  const handleRecalculate = async () => {
    if (useBenchmark && investmentAdj === 0 && revenueAdj === 0 && marginAdj === 0 && growthAdj === 0) {
      // Reset to benchmark — no custom values
      setRecalculating(true)
      setError(null)
      try {
        const res = await financialProjectionService.updateProjection(ideaId, {
          initialInvestment: undefined,
          monthlyRevenue:    undefined,
          profitMargin:      undefined,
          growthRate:        undefined,
        })
        setProjection(res.data)
      } catch {
        setError(t('financialWizard.projections.recalcError'))
      } finally {
        setRecalculating(false)
      }
      return
    }

    // Calculate adjusted values from benchmark
    const bm = projection?.benchmark
    // ✅ FIX #1: Don't silently return - always set error state
    if (!bm || !projection) {
      setError(t('financialWizard.projections.errorMsg'))
      return
    }

    const benchInvest = projection.effectiveInitialInvestment || bm.startupCostMid || 0
    const benchRevenue = projection.effectiveMonthlyRevenue || 0
    const benchMargin = projection.effectiveGrossMargin || bm.grossMarginTypical || 0
    const benchGrowth = bm.monthlyGrowthRatePercent || 0

    const adjustedInvest = benchInvest * (1 + investmentAdj / 100)
    const adjustedRevenue = benchRevenue * (1 + revenueAdj / 100)
    const adjustedMargin = benchMargin + marginAdj
    const adjustedGrowth = benchGrowth + growthAdj

    setRecalculating(true)
    setError(null)
    try {
      const res = await financialProjectionService.updateProjection(ideaId, {
        initialInvestment: adjustedInvest,
        monthlyRevenue:    adjustedRevenue,
        profitMargin:      adjustedMargin,
        growthRate:        adjustedGrowth,
      })
      setProjection(res.data)
    } catch {
      setError(t('financialWizard.projections.recalcError'))
    } finally {
      setRecalculating(false)
    }
  }

  const handleReset = async () => {
    // ✅ FIX #3: Only reset UI state AFTER successful API call
    setRecalculating(true)
    setError(null)

    try {
      const res = await financialProjectionService.updateProjection(ideaId, {
        initialInvestment: undefined,
        monthlyRevenue:    undefined,
        profitMargin:      undefined,
        growthRate:        undefined,
      })
      setProjection(res.data)
      // ✅ Reset UI state AFTER API succeeds (keeps UI and backend in sync)
      setInvestmentAdj(0)
      setRevenueAdj(0)
      setMarginAdj(0)
      setGrowthAdj(0)
      setUseBenchmark(true)
    } catch {
      setError(t('financialWizard.projections.recalcError'))
      // ✅ Don't reset UI if API failed - keeps in sync
    } finally {
      setRecalculating(false)
    }
  }

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-16 rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      <Skeleton className="h-[300px] rounded-xl" />
    </div>
  )

  if (error) return (
    <div className="text-center py-10">
      <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        {t('financialWizard.projections.retry')}
      </button>
    </div>
  )

  const bm    = projection?.benchmark
  const scene = projection?.[activeTab]
  const tab   = SCENARIO_TABS.find(t => t.key === activeTab)

  // Calculate effective benchmark values
  const bmInvest = projection?.effectiveInitialInvestment || bm?.startupCostMid || 0
  const bmRevenue = projection?.effectiveMonthlyRevenue || 0
  const bmMargin = projection?.effectiveGrossMargin || bm?.grossMarginTypical || 0
  const bmGrowth = bm?.monthlyGrowthRatePercent || 0

  const adjustmentFields = [
    {
      label: t('financialWizard.projections.inputs.investment'),
      help: t('financialWizard.projections.help.investment'),
      benchmark: Math.round(bmInvest),
      value: investmentAdj,
      set: setInvestmentAdj,
    },
    {
      label: t('financialWizard.projections.inputs.revenue'),
      help: t('financialWizard.projections.help.revenue'),
      benchmark: Math.round(bmRevenue),
      value: revenueAdj,
      set: setRevenueAdj,
    },
    {
      label: t('financialWizard.projections.inputs.margin'),
      help: t('financialWizard.projections.help.margin'),
      benchmark: Math.round(bmMargin),
      value: marginAdj,
      set: setMarginAdj,
      isPercent: true,
    },
    {
      label: t('financialWizard.projections.inputs.growth'),
      help: t('financialWizard.projections.help.growth'),
      benchmark: Math.round(bmGrowth * 10) / 10,
      value: growthAdj,
      set: setGrowthAdj,
      isPercent: true,
    },
  ]

  return (
    <div className="space-y-5">

      {/* 1 ── Benchmark banner */}
      {bm && <BenchmarkInfoCard benchmark={bm} />}

      {/* 2 ── Benchmark-based assumptions */}
      <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('financialWizard.projections.assumptionsTitle')}</h3>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
              {t('financialWizard.projections.assumptionsSubtitle')}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('financialWizard.projections.reset')}
          </button>
        </div>

        <div className="p-5 space-y-4">
          {adjustmentFields.map(({ label, help, benchmark, value, set, isPercent }) => {
            const adjusted = isPercent
              ? benchmark + value
              : Math.round(benchmark * (1 + value / 100))
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300">{label}</label>
                  <div className="text-xs text-slate-500 dark:text-gray-400">
                    <span className="text-slate-400 dark:text-gray-500">{t('financialWizard.projections.benchmark')}:</span>
                    {' '}
                    <span className="font-semibold text-slate-700 dark:text-gray-300">
                      {benchmark.toLocaleString()}{isPercent ? '%' : ' JOD'}
                    </span>
                    {value !== 0 && (
                      <>
                        {' → '}
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          {adjusted.toLocaleString()}{isPercent ? '%' : ' JOD'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400 dark:text-gray-500 mb-2">{help}</p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={isPercent ? '-50' : '-75'}
                    max={isPercent ? '50' : '75'}
                    step="5"
                    value={value}
                    onChange={e => set(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-indigo-600
                      [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-gray-300 min-w-[3.5rem] text-right">
                    {value > 0 ? '+' : ''}{value}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="px-5 pb-5 pt-2">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed
              text-white text-sm font-semibold transition-colors"
          >
            {recalculating
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> {t('financialWizard.projections.calculating')}</>
              : <><RefreshCw className="w-4 h-4" /> {t('financialWizard.projections.recalculate')}</>
            }
          </button>
        </div>
      </div>

      {/* 3 ── Scenario tabs */}
      <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">

        {/* Tab switcher */}
        <div className="flex gap-1 p-2 bg-slate-50 dark:bg-gray-800 border-b border-slate-100 dark:border-gray-800">
          {SCENARIO_TABS.map(scenarioTab => {
            const s = tabStyle[scenarioTab.color]
            return (
              <button
                key={scenarioTab.key}
                onClick={() => setActiveTab(scenarioTab.key)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === scenarioTab.key ? s.active : `bg-transparent ${s.inactive}`
                }`}
              >
                {scenarioTab.label}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {scene ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="p-5 space-y-5"
            >
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ScenarioCard
                  title={t('financialWizard.projections.cards.breakEven')}
                  value={scene.breakEvenMonth <= 12
                    ? `${scene.breakEvenMonth} ${t('financialWizard.projections.cards.month')}`
                    : t('financialWizard.projections.cards.moreThan12')}
                  color={scene.breakEvenMonth <= 6 ? 'green' : scene.breakEvenMonth <= 12 ? 'amber' : 'red'}
                />
                <ScenarioCard
                  title={t('financialWizard.projections.cards.roi')}
                  value={scene.roi?.toFixed(1)}
                  unit="%"
                  color={scene.roi > 50 ? 'green' : scene.roi > 0 ? 'indigo' : 'red'}
                />
                <ScenarioCard
                  title={t('financialWizard.projections.cards.totalProfit')}
                  value={fmtJOD(scene.totalProfit)}
                  unit="JOD"
                  color={scene.totalProfit > 0 ? 'green' : 'red'}
                />
                <ScenarioCard
                  title={t('financialWizard.projections.cards.cashFlow')}
                  value={fmtJOD(scene.cumulativeCashFlow)}
                  unit="JOD"
                  color={scene.cumulativeCashFlow > 0 ? 'green' : 'red'}
                />
              </div>

              {/* Chart */}
              {scene.monthlyData?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {t('financialWizard.projections.chart.title')}
                  </p>
                  <ProjectionChart monthlyData={scene.monthlyData} scenarioName={tab?.label} />
                </div>
              )}

              {/* Monthly table (collapsible) */}
              <div>
                <button
                  onClick={() => setShowTable(s => !s)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mb-2"
                >
                  {showTable
                    ? t('financialWizard.projections.table.hideMonthly')
                    : t('financialWizard.projections.table.showMonthly')}
                </button>
                {showTable && <ProjectionTable monthlyData={scene.monthlyData} />}
              </div>
            </motion.div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-400 dark:text-gray-500">
              {t('financialWizard.projections.noData')}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-300 dark:text-gray-600 text-center">
        {t('financialWizard.projections.disclaimer')}
      </p>
    </div>
  )
}

export default FinancialProjectionsStep
