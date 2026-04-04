import { motion } from 'framer-motion'

const StatsCard = ({ label, value, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="rounded-xl border border-gray-200 dark:border-gray-700
      bg-white dark:bg-gray-800 p-5"
  >
    <p className="text-xs font-medium text-gray-500 dark:text-gray-300 mb-2">
      {label}
    </p>
    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-1">
      {value}
    </p>
    {description && (
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {description}
      </p>
    )}
  </motion.div>
)

export default StatsCard
