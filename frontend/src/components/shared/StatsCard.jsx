import { motion } from 'framer-motion'

const StatsCard = ({ label, value, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md hover:shadow-blue-500/5 transition-all duration-200"
    >
      <p className="text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
      {description && <p className="text-xs text-slate-500 dark:text-gray-500">{description}</p>}
    </motion.div>
  )
}

export default StatsCard
