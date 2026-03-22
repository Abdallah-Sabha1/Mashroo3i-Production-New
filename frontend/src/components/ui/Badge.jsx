const colorMap = {
  primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  secondary: 'bg-slate-100 text-slate-600 border-slate-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

const Badge = ({ children, color = 'primary', size = 'md', className = '' }) => {
  return (
    <span
      className={`
        ${colorMap[color]} ${sizes[size]}
        inline-flex items-center gap-1 font-medium rounded-full border
        ${className}
      `}
    >
      {children}
    </span>
  )
}

export default Badge
