import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import IndustrySelectionStep from '../components/wizard/IndustrySelectionStep'
import BusinessModelSelectionStep from '../components/wizard/BusinessModelSelectionStep'
import FinancialProjectionsStep from '../components/wizard/FinancialProjectionsStep'

// ── Steps config ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'القطاع',        labelEn: 'Industry'       },
  { id: 2, label: 'نموذج الأعمال', labelEn: 'Business Model' },
  { id: 3, label: 'التوقعات',      labelEn: 'Projections'    },
]

// ── Progress bar ─────────────────────────────────────────────────────────────

function StepProgress({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const done    = step.id < current
        const active  = step.id === current
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className={`flex flex-col items-center`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                done   ? 'bg-indigo-600 text-white' :
                active ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950/60' :
                         'bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500'
              }`}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.id}
              </div>
              <span className={`text-xs mt-1 font-medium ${
                active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-gray-500'
              }`} dir="rtl">
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${
                done ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const FinancialProjections = () => {
  const { ideaId } = useParams()
  const [step, setStep]                 = useState(1)
  const [industryType, setIndustryType] = useState('')
  const [businessModel, setBusinessModel] = useState('')

  const canAdvance = step === 1 ? !!industryType
                   : step === 2 ? !!businessModel
                   : false

  const stepTitle = step === 1 ? 'اختر قطاع مشروعك'
                  : step === 2 ? 'اختر نموذج الأعمال'
                  : 'توقعاتك المالية لـ 12 شهراً'

  const stepSubtitle = step === 1 ? 'بناءً على قطاع مشروعك، سنستخدم بيانات مرجعية من مشاريع مماثلة في عمّان'
                     : step === 2 ? 'هل تبيع للأفراد أم للشركات؟ يؤثر ذلك على نموذج التسعير والتوقعات'
                     : 'قارن بين السيناريوهات المحتملة وخصّص الافتراضات حسب خططك'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Back link */}
        <Link
          to={`/evaluation/${ideaId}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-gray-500
            hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          العودة إلى التحليل
        </Link>

        {/* Progress */}
        <StepProgress current={step} />

        {/* Step header */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-6"
          dir="rtl"
        >
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{stepTitle}</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{stepSubtitle}</p>
        </motion.div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
          >
            {step === 1 && (
              <IndustrySelectionStep
                selected={industryType}
                onSelect={setIndustryType}
              />
            )}
            {step === 2 && (
              <BusinessModelSelectionStep
                industryType={industryType}
                selected={businessModel}
                onSelect={setBusinessModel}
              />
            )}
            {step === 3 && (
              <FinancialProjectionsStep
                ideaId={parseInt(ideaId)}
                industryType={industryType}
                businessModel={businessModel}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex justify-between gap-3"
            dir="rtl"
          >
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700
                  text-sm font-medium text-slate-600 dark:text-gray-400
                  hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              >
                السابق
              </button>
            )}
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance}
              className="mr-auto flex items-center gap-2 px-6 py-2.5 rounded-xl
                bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed
                text-white text-sm font-semibold transition-colors"
            >
              التالي
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default FinancialProjections
