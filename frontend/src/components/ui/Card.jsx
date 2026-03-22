const Card = ({ children, className = '', hover = false, padding = true }) => {
  return (
    <div
      className={`
        rounded-2xl border border-slate-200 bg-white shadow-sm
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover:shadow-md hover:shadow-blue-500/5 hover:border-slate-300 cursor-pointer' : ''}
        transition-all duration-200
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Card
