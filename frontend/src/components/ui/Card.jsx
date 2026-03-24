const Card = ({ children, className = '', hover = false, padding = true }) => {
  return (
    <div
      className={`
        rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover:shadow-md hover:shadow-blue-500/5 hover:border-slate-300 dark:hover:border-gray-700 cursor-pointer' : ''}
        transition-all duration-200
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Card
