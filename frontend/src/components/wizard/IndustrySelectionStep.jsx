import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '../ui/Loading'
import financialProjectionService from '../../services/financialProjectionService'

const INDUSTRY_META = {
  food_and_beverage:     { icon: '🍕', label: 'الأغذية والمشروبات',        en: 'Food & Beverage'        },
  retail_ecommerce:      { icon: '🛒', label: 'التجارة الإلكترونية والتجزئة', en: 'Retail & E-commerce'  },
  professional_services: { icon: '💼', label: 'الخدمات المهنية',             en: 'Professional Services'  },
  technology:            { icon: '💻', label: 'التكنولوجيا والبرمجيات',       en: 'Technology'             },
  health_wellness:       { icon: '🏥', label: 'الصحة والعافية',               en: 'Health & Wellness'      },
  education:             { icon: '📚', label: 'التعليم والتدريب',              en: 'Education & Training'   },
}

const IndustrySelectionStep = ({ selected, onSelect }) => {
  const [industries, setIndustries] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    let active = true
    financialProjectionService.getBenchmarks()
      .then(res => { if (active) setIndustries(res.data) })
      .catch(() => {
        // Fallback to static list if API unavailable
        if (active) setIndustries(
          Object.entries(INDUSTRY_META).map(([type, m]) => ({
            industryType:   type,
            industryNameAr: m.label,
            industryNameEn: m.en,
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
        const meta    = INDUSTRY_META[ind.industryType] ?? { icon: '🏢' }
        const isActive = selected === ind.industryType
        return (
          <motion.button
            key={ind.industryType}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelect(ind.industryType)}
            dir="rtl"
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center
              transition-all duration-200 cursor-pointer
              ${isActive
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-md shadow-indigo-100 dark:shadow-indigo-950/30'
                : 'border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-gray-800'
              }`}
          >
            <span className="text-3xl">{meta.icon}</span>
            <span className={`text-sm font-semibold leading-tight ${
              isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-gray-200'
            }`}>
              {ind.industryNameAr}
            </span>
            <span className="text-xs text-slate-400 dark:text-gray-500">{ind.industryNameEn}</span>
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
