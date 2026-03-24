import { motion } from 'framer-motion'

const getColor = (score) => {
  if (score >= 80) return { stroke: '#16A34A', text: 'text-green-600' }
  if (score >= 60) return { stroke: '#D97706', text: 'text-amber-600' }
  return { stroke: '#DC2626', text: 'text-red-600' }
}

const ScoreCircle = ({ score = 0, label = '', size = 140 }) => {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const colors = getColor(score)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={colors.stroke} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`text-3xl font-bold ${colors.text}`}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wide">{label}</span>
    </div>
  )
}

export default ScoreCircle
