import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const quadrants = [
  {
    key:        'strengths',
    i18nKey:    'evaluation.strengths',
    column:     'internal',
    bar:        'border-s-emerald-500',
    dot:        'bg-emerald-500',
    label:      'text-emerald-700 dark:text-emerald-400',
    bg:         'bg-emerald-50/40 dark:bg-emerald-950/20',
  },
  {
    key:        'weaknesses',
    i18nKey:    'evaluation.weaknesses',
    column:     'internal',
    bar:        'border-s-red-400',
    dot:        'bg-red-400',
    label:      'text-red-700 dark:text-red-400',
    bg:         'bg-red-50/40 dark:bg-red-950/20',
  },
  {
    key:        'opportunities',
    i18nKey:    'evaluation.opportunities',
    column:     'external',
    bar:        'border-s-blue-500',
    dot:        'bg-primary-500',
    label:      'text-primary-700 dark:text-primary-400',
    bg:         'bg-primary-50/40 dark:bg-primary-900/20',
  },
  {
    key:        'threats',
    i18nKey:    'evaluation.threats',
    column:     'external',
    bar:        'border-s-amber-400',
    dot:        'bg-amber-400',
    label:      'text-amber-700 dark:text-amber-400',
    bg:         'bg-amber-50/40 dark:bg-amber-950/20',
  },
]

const cardVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const listVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden:  { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
}

const QuadrantCard = ({ quadrant, swotData }) => {
  const { t } = useTranslation()
  const items = swotData[quadrant.key] || []

  return (
    <motion.div
      variants={cardVariants}
      className={`
        ${quadrant.bg} border border-gray-200/80 dark:border-gray-700
        border-s-4 ${quadrant.bar} rounded-xl p-5
      `}
    >
      <h4 className={`text-xs font-bold uppercase tracking-widest ${quadrant.label} mb-3 text-start`}>
        {t(quadrant.i18nKey)}
      </h4>

      <motion.ul
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {items.length > 0 ? items.map((item, i) => (
          <motion.li
            key={i}
            variants={itemVariants}
            className="flex items-start gap-2.5"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${quadrant.dot} mt-2 flex-shrink-0`} />
            <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-start">
              {item}
            </span>
          </motion.li>
        )) : (
          <li className="text-xs text-gray-400 dark:text-gray-600 italic text-start">—</li>
        )}
      </motion.ul>
    </motion.div>
  )
}

const columnVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const SwotGrid = ({ swotData = {} }) => {
  const { t } = useTranslation()

  const internal = quadrants.filter(q => q.column === 'internal')
  const external = quadrants.filter(q => q.column === 'external')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Internal Factors */}
      <motion.div
        variants={columnVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-start ps-1">
          {t('evaluation.internalFactors')}
        </p>
        {internal.map(q => (
          <QuadrantCard key={q.key} quadrant={q} swotData={swotData} />
        ))}
      </motion.div>

      {/* External Factors */}
      <motion.div
        variants={columnVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-start ps-1">
          {t('evaluation.externalFactors')}
        </p>
        {external.map(q => (
          <QuadrantCard key={q.key} quadrant={q} swotData={swotData} />
        ))}
      </motion.div>

    </div>
  )
}

export default SwotGrid
