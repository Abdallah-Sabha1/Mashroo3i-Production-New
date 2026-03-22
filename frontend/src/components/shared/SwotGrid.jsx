import { motion } from 'framer-motion'

const quadrants = [
  { key: 'strengths', title: 'Strengths', icon: '\uD83D\uDCAA', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', titleColor: 'text-emerald-700', dotColor: 'bg-emerald-500' },
  { key: 'weaknesses', title: 'Weaknesses', icon: '\u26A0\uFE0F', bgColor: 'bg-red-50', borderColor: 'border-red-200', titleColor: 'text-red-700', dotColor: 'bg-red-500' },
  { key: 'opportunities', title: 'Opportunities', icon: '\uD83D\uDE80', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', titleColor: 'text-blue-700', dotColor: 'bg-blue-500' },
  { key: 'threats', title: 'Threats', icon: '\u26A1', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', titleColor: 'text-orange-700', dotColor: 'bg-orange-500' },
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
          className={`${q.bgColor} ${q.borderColor} border rounded-2xl p-5`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{q.icon}</span>
            <h3 className={`font-semibold ${q.titleColor}`}>{q.title}</h3>
          </div>
          <ul className="space-y-2">
            {(swotData[q.key] || []).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
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
