const Card = ({ children, className = '', hover = false, padding = true, glass = false }) => {
  const base = glass
    ? 'card-glass'
    : 'bg-white dark:bg-gray-900 border border-slate-200/70 dark:border-gray-800 shadow-card'
  return (
    <div
      className={`
        rounded-2xl transition-all duration-300
        ${base}
        ${padding ? 'p-6' : ''}
        ${hover ? 'floating-card cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Card
