import { motion } from 'framer-motion'
import Card from '../ui/Card'

export default function SWOTVisualization({ swotData }) {
  if (!swotData) return null

  const sections = [
    {
      key: 'strengths',
      title: 'Strengths',
      iconPath: 'M13 7h8m0 0v8m`0-8l-8 8-4-4-6 6',
      items: swotData.strengths || [],
      color: 'green',
      bg: 'bg-green-50',
      border: 'border-l-4 border-green-500',
      textBold: 'text-green-900',
      textLight: 'text-green-800',
    },
    {
      key: 'weaknesses',
      title: 'Weaknesses',
      iconPath: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
      items: swotData.weaknesses || [],
      color: 'red',
      bg: 'bg-red-50',
      border: 'border-l-4 border-red-500',
      textBold: 'text-red-900',
      textLight: 'text-red-800',
    },
    {
      key: 'opportunities',
      title: 'Opportunities',
      iconPath: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
      items: swotData.opportunities || [],
      color: 'blue',
      bg: 'bg-primary-50',
      border: 'border-l-4 border-blue-500',
      textBold: 'text-primary-900',
      textLight: 'text-primary-800',
    },
    {
      key: 'threats',
      title: 'Threats',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      items: swotData.threats || [],
      color: 'orange',
      bg: 'bg-orange-50',
      border: 'border-l-4 border-orange-500',
      textBold: 'text-orange-900',
      textLight: 'text-orange-800',
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map((section, idx) => (
        <motion.div
          key={section.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className={`${section.bg} ${section.border} p-6 h-full`}>
            <div className="flex items-center gap-3 mb-4">
              <svg className={`w-6 h-6 ${section.textBold}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={section.iconPath} />
              </svg>
              <h3 className={`text-lg font-semibold ${section.textBold}`}>
                {section.title}
              </h3>
            </div>

            <ul className="space-y-3">
              {section.items.length > 0 ? (
                section.items.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (idx * 0.1) + (i * 0.05) }}
                    className={`flex items-start gap-2 ${section.textLight}`}
                  >
                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current opacity-70`} />
                    <span className="text-sm leading-relaxed">{item}</span>
                  </motion.li>
                ))
              ) : (
                <p className={`text-sm ${section.textLight} italic`}>No items</p>
              )}
            </ul>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
