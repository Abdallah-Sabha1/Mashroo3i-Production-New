import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const confidenceStyle = {
  HIGH:   'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  LOW:    'bg-red-100   text-red-700   dark:bg-red-950   dark:text-red-400',
}

const confidenceLabel = { HIGH: 'عالية', MEDIUM: 'متوسطة', LOW: 'منخفضة' }

const BenchmarkInfoCard = ({ benchmark }) => {
  const [open, setOpen] = useState(false)
  if (!benchmark) return null

  let sources = []
  try { sources = JSON.parse(benchmark.dataSourcesJson || '[]') } catch { sources = [] }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {benchmark.industryNameAr}
            </h3>
            <span className="text-xs text-slate-400 dark:text-gray-500">
              · {benchmark.businessModel === 'B2B' ? 'للشركات' : 'للأفراد'}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              confidenceStyle[benchmark.confidenceLevel] ?? confidenceStyle.MEDIUM
            }`}>
              دقة {confidenceLabel[benchmark.confidenceLevel] ?? 'متوسطة'}
            </span>
          </div>
          {benchmark.notesAndContext && (
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5 line-clamp-1" dir="rtl">
              {benchmark.notesAndContext}
            </p>
          )}
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
        >
          تفاصيل المرجع
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 dark:border-gray-800 px-5 py-4 space-y-4" dir="rtl">
          {/* Cost ranges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'تكلفة التأسيس', low: benchmark.startupCostLow, mid: benchmark.startupCostMid, high: benchmark.startupCostHigh },
              { label: 'التكلفة الشهرية', low: benchmark.monthlyCostLow, mid: benchmark.monthlyCostTypical, high: benchmark.monthlyCostHigh },
            ].map(({ label, low, mid, high }) => (
              <div key={label} className="col-span-3 sm:col-span-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">{label}</p>
                <p className="text-sm font-medium text-slate-800 dark:text-gray-200">
                  {Math.round(low).toLocaleString()} – {Math.round(high).toLocaleString()} JOD
                  <span className="text-xs text-slate-400 ml-1">(نموذجي: {Math.round(mid).toLocaleString()})</span>
                </p>
              </div>
            ))}
            <div className="col-span-3 sm:col-span-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">هامش الربح الإجمالي</p>
              <p className="text-sm font-medium text-slate-800 dark:text-gray-200">
                {benchmark.grossMarginLow}% – {benchmark.grossMarginHigh}%
                <span className="text-xs text-slate-400 ml-1">(نموذجي: {benchmark.grossMarginTypical}%)</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">نقطة التعادل</p>
              <p className="text-sm text-slate-700 dark:text-gray-300">
                {benchmark.breakEvenMonthsLow}–{benchmark.breakEvenMonthsHigh} شهراً
                <span className="text-xs text-slate-400 mr-1">(نموذجي: {benchmark.breakEvenMonthsTypical})</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">معدل نمو شهري</p>
              <p className="text-sm text-slate-700 dark:text-gray-300">{benchmark.monthlyGrowthRatePercent}%</p>
            </div>
          </div>

          {sources.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">مصادر البيانات</p>
              <ul className="space-y-0.5">
                {sources.map((s, i) => (
                  <li key={i} className="text-xs text-slate-500 dark:text-gray-400 flex items-start gap-1">
                    <span className="text-indigo-400 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BenchmarkInfoCard
