import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../ui/Loading'
import financialProjectionService from '../../services/financialProjectionService'

const colorMap = {
  indigo:  { border: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-indigo-100 dark:shadow-indigo-950/30', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300', title: 'text-indigo-700 dark:text-indigo-300' },
  emerald: { border: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 shadow-emerald-100 dark:shadow-emerald-950/30', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', title: 'text-emerald-700 dark:text-emerald-300' },
}

const BusinessModelSelectionStep = ({ industryType, selected, onSelect }) => {
  const { t } = useTranslation()
  const [benchmarkPreviews, setBenchmarkPreviews] = useState({})
  const [loadingBm, setLoadingBm] = useState(false)

  const MODELS = [
    {
      key: 'B2C',
      title: t('financialWizard.businessModel.b2c.title'),
      subtitle: t('financialWizard.businessModel.b2c.titleAr'),
      desc: t('financialWizard.businessModel.b2c.desc'),
      examples: t('financialWizard.businessModel.b2c.examples', { returnObjects: true }),
      color: 'indigo',
    },
    {
      key: 'B2B',
      title: t('financialWizard.businessModel.b2b.title'),
      subtitle: t('financialWizard.businessModel.b2b.titleAr'),
      desc: t('financialWizard.businessModel.b2b.desc'),
      examples: t('financialWizard.businessModel.b2b.examples', { returnObjects: true }),
      color: 'emerald',
    },
  ]

  useEffect(() => {
    if (!industryType) return
    let active = true
    setLoadingBm(true)
    setBenchmarkPreviews({})

    Promise.allSettled(
      MODELS.map(m => financialProjectionService.getBenchmark(industryType, m.key))
    ).then(results => {
      if (!active) return
      const previews = {}
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') previews[MODELS[i].key] = r.value.data
      })
      setBenchmarkPreviews(previews)
    }).finally(() => { if (active) setLoadingBm(false) })

    return () => { active = false }
  }, [industryType])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {MODELS.map((model, idx) => {
        const isActive = selected === model.key
        const bm = benchmarkPreviews[model.key]
        const c = colorMap[model.color]

        return (
          <motion.button
            key={model.key}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            onClick={() => onSelect(model.key)}
            className={`text-start p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer
              ${isActive
                ? `${c.border} border-2 shadow-md`
                : 'border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-gray-800'
              }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isActive ? c.badge : 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {model.title}
              </span>
              <span className={`font-semibold text-sm ${
                isActive ? c.title : 'text-slate-800 dark:text-gray-200'
              }`}>
                {model.subtitle}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed mb-3">
              {model.desc}
            </p>

            <div className="flex flex-wrap gap-1 mb-3">
              {model.examples.map(ex => (
                <span key={ex} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400">
                  {ex}
                </span>
              ))}
            </div>

            {/* Benchmark preview */}
            {loadingBm ? (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-gray-800">
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            ) : bm ? (
              <div className="pt-2 border-t border-slate-100 dark:border-gray-800 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 dark:text-gray-500">{t('financialWizard.businessModel.benchmark.startupCost')}</span>
                  <span className="text-slate-700 dark:text-gray-300 font-medium">
                    {bm.startupCostLow?.toLocaleString()} – {bm.startupCostHigh?.toLocaleString()} JOD
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 dark:text-gray-500">{t('financialWizard.businessModel.benchmark.grossMargin')}</span>
                  <span className="text-slate-700 dark:text-gray-300 font-medium">
                    {bm.grossMarginLow}% – {bm.grossMarginHigh}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 dark:text-gray-500">{t('financialWizard.businessModel.benchmark.breakEven')}</span>
                  <span className="text-slate-700 dark:text-gray-300 font-medium">
                    {bm.breakEvenMonthsLow}–{bm.breakEvenMonthsHigh} {t('financialWizard.businessModel.benchmark.months')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-300 dark:text-gray-600 pt-2 border-t border-slate-100 dark:border-gray-800">
                {t('financialWizard.businessModel.benchmark.noData')}
              </p>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

export default BusinessModelSelectionStep
