const Card = ({ children, className = '', hover = false, glass = false, padding = true }) => {
  return (
    <div
      className={`
        rounded-2xl
        ${glass ? 'bg-white/70 backdrop-blur-xl border border-white/20' : 'bg-white border border-slate-200/60'}
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 cursor-pointer' : 'shadow-sm'}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Card
