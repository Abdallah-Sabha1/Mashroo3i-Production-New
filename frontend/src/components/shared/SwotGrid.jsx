import { motion } from 'framer-motion'

const quadrants = [
  { key: 'strengths', title: 'Strengths', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-200 dark:border-green-800', titleColor: 'text-green-800 dark:text-green-400', dotColor: 'bg-green-500' },
  { key: 'weaknesses', title: 'Weaknesses', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-200 dark:border-red-800', titleColor: 'text-red-800 dark:text-red-400', dotColor: 'bg-red-500' },
  { key: 'opportunities', title: 'Opportunities', bgColor: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-200 dark:border-blue-800', titleColor: 'text-blue-800 dark:text-blue-400', dotColor: 'bg-blue-500' },
  { key: 'threats', title: 'Threats', bgColor: 'bg-amber-50 dark:bg-amber-950', borderColor: 'border-amber-200 dark:border-amber-800', titleColor: 'text-amber-800 dark:text-amber-400', dotColor: 'bg-amber-500' },
]

const SwotGrid = ({ swotData = {} }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quadrants.map((q, idx) => (
        <motion.div
          key={q.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          className={`${q.bgColor} ${q.borderColor} border rounded-2xl p-6`}
        >
          <h4 className={`font-semibold ${q.titleColor} mb-4`}>{q.title}</h4>
          <ul className="space-y-2">
            {(swotData[q.key] || []).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-gray-300">
                <span className={`w-1.5 h-1.5 rounded-full ${q.dotColor} mt-1.5 flex-shrink-0`} />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  )
}

export default SwotGrid
