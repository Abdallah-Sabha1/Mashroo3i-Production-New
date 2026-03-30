// components/shared/OnboardingModal.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const ICONS = [
  (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
]

const OnboardingModal = ({ onClose }) => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()

  const STEPS = t('onboarding.steps', { returnObjects: true })

  const finish = () => {
    localStorage.setItem('mashroo3i_onboarded', 'true')
    onClose()
    navigate('/submit-idea')
  }

  const skip = () => {
    localStorage.setItem('mashroo3i_onboarded', 'true')
    onClose()
  }

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      finish()
    }
  }

  const step = STEPS[currentStep]
  const isLast = currentStep === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-sm w-full shadow-2xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950
                flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                {ICONS[currentStep]}
              </div>
            </div>

            {/* Text */}
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 text-center">
              {step.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed mb-6 text-center">
              {step.body}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-5 bg-indigo-600'
                  : 'w-2 bg-slate-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={skip}
            className="text-sm text-slate-400 dark:text-gray-500
              hover:text-slate-600 dark:hover:text-gray-300 transition-colors px-2 py-2"
          >
            {t('onboarding.skip')}
          </button>
          <button
            onClick={next}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white
              text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            {isLast ? t('onboarding.startNow') : t('onboarding.next')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default OnboardingModal
