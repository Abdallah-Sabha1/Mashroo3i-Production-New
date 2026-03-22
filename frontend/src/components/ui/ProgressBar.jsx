import { motion } from 'framer-motion'

export const LinearProgress = ({ value = 0, max = 100, className = '', color = 'primary' }) => {
  const percentage = Math.min((value / max) * 100, 100)
  const colors = {
    primary: 'from-primary-500 to-purple-500',
    success: 'from-emerald-500 to-green-500',
    danger: 'from-red-500 to-rose-500',
    warning: 'from-amber-500 to-yellow-500',
  }

  return (
    <div className={`w-full bg-slate-100 rounded-full h-2.5 overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r ${colors[color]}`}
      />
    </div>
  )
}

export const CircularProgress = ({ value = 0, size = 120, strokeWidth = 8, color = '#6366f1' }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </svg>
  )
}
