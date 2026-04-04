import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const confidenceStyle = {
  HIGH:   'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  LOW:    'bg-red-100   text-red-700   dark:bg-red-950   dark:text-red-400',
}

const BenchmarkInfoCard = ({ benchmark }) => {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  if (!benchmark) return null

  const isArabic = i18n.language === 'ar'
  const industryName = isArabic ? benchmark.industryNameAr : benchmark.industryNameEn

  const confidenceLabel = {
    HIGH:   t('financialWizard.benchmark.confidence.HIGH'),
    MEDIUM: t('financialWizard.benchmark.confidence.MEDIUM'),
    LOW:    t('financialWizard.benchmark.confidence.LOW'),
  }

  let sources = []
  try { sources = JSON.parse(benchmark.dataSourcesJson || '[]') } catch { sources = [] }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              {industryName}
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              · {benchmark.businessModel === 'B2B'
                ? t('financialWizard.benchmark.forBusinesses')
                : t('financialWizard.benchmark.forIndividuals')}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              confidenceStyle[benchmark.confidenceLevel] ?? confidenceStyle.MEDIUM
            }`}>
              {t('financialWizard.benchmark.accuracy')} {confidenceLabel[benchmark.confidenceLevel] ?? confidenceLabel.MEDIUM}
            </span>
          </div>
          {benchmark.notesAndContext && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
              {benchmark.notesAndContext}
            </p>
          )}
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline flex-shrink-0"
        >
          {t('financialWizard.benchmark.details')}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 space-y-4">
          {/* Cost ranges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('financialWizard.benchmark.startupCost'), low: benchmark.startupCostLow, mid: benchmark.startupCostMid, high: benchmark.startupCostHigh },
              { label: t('financialWizard.benchmark.monthlyCost'), low: benchmark.monthlyCostLow, mid: benchmark.monthlyCostTypical, high: benchmark.monthlyCostHigh },
            ].map(({ label, low, mid, high }) => (
              <div key={label} className="col-span-3 sm:col-span-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">{label}</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {Math.round(low).toLocaleString()} – {Math.round(high).toLocaleString()} JOD
                  <span className="text-xs text-gray-400 ms-1">({t('financialWizard.benchmark.typical')}: {Math.round(mid).toLocaleString()})</span>
                </p>
              </div>
            ))}
            <div className="col-span-3 sm:col-span-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">{t('financialWizard.benchmark.grossMargin')}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {benchmark.grossMarginLow}% – {benchmark.grossMarginHigh}%
                <span className="text-xs text-gray-400 ms-1">({t('financialWizard.benchmark.typical')}: {benchmark.grossMarginTypical}%)</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">{t('financialWizard.benchmark.breakEven')}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {benchmark.breakEvenMonthsLow}–{benchmark.breakEvenMonthsHigh} {t('financialWizard.benchmark.months')}
                <span className="text-xs text-gray-400 ms-1">({t('financialWizard.benchmark.typical')}: {benchmark.breakEvenMonthsTypical})</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">{t('financialWizard.benchmark.monthlyGrowth')}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{benchmark.monthlyGrowthRatePercent}%</p>
            </div>
          </div>

          {sources.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">{t('financialWizard.benchmark.dataSources')}</p>
              <ul className="space-y-0.5">
                {sources.map((s, i) => (
                  <li key={i} className="text-xs text-gray-500 dark:text-gray-300 flex items-start gap-1">
                    <span className="text-primary-400 mt-0.5">•</span> {s}
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
