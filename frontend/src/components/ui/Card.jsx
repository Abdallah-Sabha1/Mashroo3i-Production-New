const Card = ({ children, className = '', hover = false, padding = true, glass = false }) => {
  const base = glass
    ? 'card-glass'
    : 'bg-white dark:bg-gray-900 border border-slate-200/70 dark:border-gray-800 shadow-card'
  return (
    <div
      className={`
        rounded-2xl transition-all duration-200
        ${base}
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover:shadow-card-hover hover:border-slate-300/80 dark:hover:border-gray-700 cursor-pointer hover:-translate-y-px' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Card
