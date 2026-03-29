import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, RotateCcw } from 'lucide-react'
import financialProjectionService from '../../services/financialProjectionService'
import BenchmarkInfoCard from '../financial/BenchmarkInfoCard'
import ScenarioCard from '../financial/ScenarioCard'
import ProjectionChart from '../financial/ProjectionChart'
import ProjectionTable from '../financial/ProjectionTable'
import { Skeleton } from '../ui/Loading'

const SCENARIO_TABS = [
  { key: 'optimisticScenario',   label: 'متفائل',  en: 'Optimistic',  color: 'green'  },
  { key: 'realisticScenario',    label: 'واقعي',   en: 'Realistic',   color: 'indigo' },
  { key: 'pessimisticScenario',  label: 'متحفظ',   en: 'Pessimistic', color: 'red'    },
]

const tabStyle = {
  green:  { active: 'bg-green-600  text-white', inactive: 'text-green-600  dark:text-green-400  hover:bg-green-50  dark:hover:bg-green-950/20'  },
  indigo: { active: 'bg-indigo-600 text-white', inactive: 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20' },
  red:    { active: 'bg-red-500    text-white', inactive: 'text-red-500    dark:text-red-400    hover:bg-red-50    dark:hover:bg-red-950/20'    },
}

const fmtJOD = n =>
  typeof n === 'number' ? `${Math.round(n).toLocaleString()}` : '—'

const FinancialProjectionsStep = ({ ideaId, industryType, businessModel }) => {
  const [projection, setProjection] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [error, setError]           = useState(null)
  const [activeTab, setActiveTab]   = useState('realisticScenario')
  const [showTable, setShowTable]   = useState(false)

  // Editable assumptions
  const [investment, setInvestment]   = useState('')
  const [revenue, setRevenue]         = useState('')
  const [margin, setMargin]           = useState('')
  const [growth, setGrowth]           = useState('')

  // Initial load — create projection from benchmark
  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    // Try to get existing, else create
    financialProjectionService.getProjection(ideaId)
      .then(res => {
        if (!active) return
        setProjection(res.data)
        syncFormFromProjection(res.data)
      })
      .catch(() => {
        // Create fresh projection
        financialProjectionService.createProjection(ideaId, { industryType, businessModel })
          .then(res => {
            if (!active) return
            setProjection(res.data)
            syncFormFromProjection(res.data)
          })
          .catch(err => { if (active) setError('تعذّر حساب التوقعات. تحقق من اتصالك وحاول مرة أخرى.') })
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [ideaId, industryType, businessModel])

  const syncFormFromProjection = (proj) => {
    setInvestment(proj.userInitialInvestment ?? proj.effectiveInitialInvestment ?? '')
    setRevenue(proj.userMonthlyRevenueAssumption ?? proj.effectiveMonthlyRevenue ?? '')
    setMargin(proj.userProfitMarginAssumption ?? proj.effectiveGrossMargin ?? '')
    setGrowth(proj.userMonthlyGrowthRate ?? proj.benchmark?.monthlyGrowthRatePercent ?? '')
  }

  const handleRecalculate = async () => {
    setRecalculating(true)
    setError(null)
    try {
      const res = await financialProjectionService.updateProjection(ideaId, {
        initialInvestment: investment ? parseFloat(investment) : undefined,
        monthlyRevenue:    revenue    ? parseFloat(revenue)    : undefined,
        profitMargin:      margin     ? parseFloat(margin)     : undefined,
        growthRate:        growth     ? parseFloat(growth)     : undefined,
      })
      setProjection(res.data)
    } catch {
      setError('فشل إعادة الحساب. يرجى المحاولة مرة أخرى.')
    } finally {
      setRecalculating(false)
    }
  }

  const handleReset = () => {
    if (!projection) return
    syncFormFromProjection({ ...projection, userInitialInvestment: null, userMonthlyRevenueAssumption: null, userProfitMarginAssumption: null, userMonthlyGrowthRate: null })
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
        إعادة المحاولة
      </button>
    </div>
  )

  const bm    = projection?.benchmark
  const scene = projection?.[activeTab]
  const tab   = SCENARIO_TABS.find(t => t.key === activeTab)

  return (
    <div className="space-y-5" dir="rtl">

      {/* 1 ── Benchmark banner */}
      {bm && <BenchmarkInfoCard benchmark={bm} />}

      {/* 2 ── Editable assumptions */}
      <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">الافتراضات المالية</h3>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
              القيم الافتراضية من البيانات المرجعية — يمكنك تعديلها
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            إعادة تعيين
          </button>
        </div>

        <div className="p-5 grid grid-cols-2 gap-4">
          {[
            { label: 'الاستثمار الأولي (JOD)', value: investment, set: setInvestment, ph: bm ? Math.round(bm.startupCostMid) : '' },
            { label: 'الإيرادات الشهرية المتوقعة (JOD)', value: revenue, set: setRevenue, ph: projection ? Math.round(projection.effectiveMonthlyRevenue) : '' },
            { label: 'هامش الربح الإجمالي (%)', value: margin, set: setMargin, ph: bm ? bm.grossMarginTypical : '' },
            { label: 'معدل النمو الشهري (%)', value: growth, set: setGrowth, ph: bm ? bm.monthlyGrowthRatePercent : '' },
          ].map(({ label, value, set, ph }) => (
            <div key={label} className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">{label}</label>
              <input
                type="number"
                min="0"
                step="any"
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={String(ph)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-gray-700
                  bg-white dark:bg-gray-800 text-slate-900 dark:text-white
                  placeholder-slate-300 dark:placeholder-gray-600
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed
              text-white text-sm font-semibold transition-colors"
          >
            {recalculating
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> جاري الحساب...</>
              : <><RefreshCw className="w-4 h-4" /> إعادة الحساب</>
            }
          </button>
        </div>
      </div>

      {/* 3 ── Scenario tabs */}
      <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">

        {/* Tab switcher */}
        <div className="flex gap-1 p-2 bg-slate-50 dark:bg-gray-800 border-b border-slate-100 dark:border-gray-800">
          {SCENARIO_TABS.map(t => {
            const s = tabStyle[t.color]
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === t.key ? s.active : `bg-transparent ${s.inactive}`
                }`}
              >
                {t.label}
                <span className="block text-[10px] font-normal opacity-70">{t.en}</span>
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
                  title="نقطة التعادل"
                  value={scene.breakEvenMonth <= 12 ? `${scene.breakEvenMonth} شهر` : '> 12 شهر'}
                  color={scene.breakEvenMonth <= 6 ? 'green' : scene.breakEvenMonth <= 12 ? 'amber' : 'red'}
                />
                <ScenarioCard
                  title="العائد على الاستثمار (12 شهر)"
                  value={scene.roi?.toFixed(1)}
                  unit="%"
                  color={scene.roi > 50 ? 'green' : scene.roi > 0 ? 'indigo' : 'red'}
                />
                <ScenarioCard
                  title="إجمالي الربح (12 شهر)"
                  value={fmtJOD(scene.totalProfit)}
                  unit="JOD"
                  color={scene.totalProfit > 0 ? 'green' : 'red'}
                />
                <ScenarioCard
                  title="التدفق النقدي النهائي"
                  value={fmtJOD(scene.cumulativeCashFlow)}
                  unit="JOD"
                  color={scene.cumulativeCashFlow > 0 ? 'green' : 'red'}
                />
              </div>

              {/* Chart */}
              {scene.monthlyData?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    التوقعات الشهرية — 12 شهراً
                  </p>
                  <ProjectionChart monthlyData={scene.monthlyData} scenarioName={tab?.en} />
                </div>
              )}

              {/* Monthly table (collapsible) */}
              <div>
                <button
                  onClick={() => setShowTable(s => !s)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mb-2"
                >
                  {showTable ? 'إخفاء الجدول الشهري ↑' : 'عرض الجدول الشهري ↓'}
                </button>
                {showTable && <ProjectionTable monthlyData={scene.monthlyData} />}
              </div>
            </motion.div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-400 dark:text-gray-500">
              لا توجد بيانات لهذا السيناريو
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-300 dark:text-gray-600 text-center">
        هذه التوقعات تقديرية مبنية على بيانات مرجعية من مشاريع مماثلة في عمّان ولا تُعدّ ضماناً للنتائج الفعلية
      </p>
    </div>
  )
}

export default FinancialProjectionsStep
