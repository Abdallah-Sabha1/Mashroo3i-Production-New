import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function RiskGauge({ riskLevel, overallScore }) {
  const riskConfig = {
    'Low Risk': { 
      color: '#10b981', 
      textColor: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200 text-green-800',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      message: 'This idea has strong fundamentals and good market potential.',
      percentage: Math.min(overallScore, 50)
    },
    'Medium Risk': { 
      color: '#f59e0b', 
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200 text-amber-800',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      message: 'This idea has potential but requires careful planning and execution.',
      percentage: Math.min(Math.max(overallScore - 50, 0), 50) + 50
    },
    'High Risk': { 
      color: '#ef4444', 
      textColor: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200 text-red-800',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      message: 'This idea faces significant challenges. Thorough validation is recommended.',
      percentage: Math.min(overallScore, 100)
    }
  }

  const config = riskConfig[riskLevel] || riskConfig['Medium Risk']
  const percentage = (overallScore / 100) * 360

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="relative w-48 h-48">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--gauge-track, #f1f5f9)"
            strokeWidth="8"
            className="dark:[--gauge-track:#1f2937]"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={config.color}
            strokeWidth="8"
            strokeDasharray={`${(percentage / 360) * 251.2} 251.2`}
            strokeLinecap="round"
            initial={{ strokeDasharray: '0 251.2' }}
            animate={{ strokeDasharray: `${(percentage / 360) * 251.2} 251.2` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-center"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">Risk Level</p>
            <p className={`text-xl font-bold ${config.textColor}`}>
              {riskLevel}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {overallScore}
          <span className="text-sm font-medium text-gray-500 dark:text-gray-300 ml-1">/100</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Overall Score</p>
      </div>

      <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${config.bgColor}`}>
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.iconPath} />
        </svg>
        <p className="text-sm leading-relaxed">
          {config.message}
        </p>
      </div>
    </motion.div>
  )
}
