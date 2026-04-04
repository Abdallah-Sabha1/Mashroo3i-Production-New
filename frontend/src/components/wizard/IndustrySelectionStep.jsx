import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../ui/Loading'
import financialProjectionService from '../../services/financialProjectionService'

const INDUSTRY_ICONS = {
  food_and_beverage:     '🍕',
  retail_ecommerce:      '🛒',
  professional_services: '💼',
  technology:            '💻',
  health_wellness:       '🏥',
  education:             '📚',
}

const IndustrySelectionStep = ({ selected, onSelect }) => {
  const { t, i18n } = useTranslation()
  const [industries, setIndustries] = useState([])
  const [loading, setLoading]       = useState(true)
  const isArabic = i18n.language === 'ar'

  useEffect(() => {
    let active = true
    financialProjectionService.getBenchmarks()
      .then(res => { if (active) setIndustries(res.data) })
      .catch(() => {
        // Fallback to static list if API unavailable
        if (active) setIndustries(
          Object.entries(INDUSTRY_ICONS).map(([type]) => ({
            industryType:   type,
            industryNameAr: type,
            industryNameEn: type,
            availableModels: ['B2C'],
          }))
        )
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {industries.map((ind, idx) => {
        const icon    = INDUSTRY_ICONS[ind.industryType] ?? '🏢'
        const isActive = selected === ind.industryType
        const primaryName   = isArabic ? ind.industryNameAr : ind.industryNameEn
        const secondaryName = isArabic ? ind.industryNameEn : ind.industryNameAr
        return (
          <motion.button
            key={ind.industryType}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelect(ind.industryType)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center
              transition-all duration-200 cursor-pointer
              ${isActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30/40 shadow-md shadow-primary-100 dark:shadow-primary-900/30'
                : 'border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-gray-800'
              }`}
          >
            <span className="text-3xl">{icon}</span>
            <span className={`text-sm font-semibold leading-tight ${
              isActive ? 'text-primary-700 dark:text-primary-300' : 'text-slate-800 dark:text-gray-200'
            }`}>
              {primaryName}
            </span>
            <span className="text-xs text-slate-400 dark:text-gray-500">{secondaryName}</span>
            {ind.availableModels?.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-center mt-1">
                {ind.availableModels.map(m => (
                  <span key={m}
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

export default IndustrySelectionStep
