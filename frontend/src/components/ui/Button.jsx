import { forwardRef } from 'react'

const variants = {
  primary: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-md hover:shadow-blue-500/20',
  secondary: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
  outline: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  success: 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md hover:shadow-green-500/20',
  danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md hover:shadow-red-500/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3 text-sm rounded-xl',
}

const Button = forwardRef(({ children, variant = 'primary', size = 'md', onClick, disabled, className = '', type = 'button', loading = false, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]} ${sizes[size]}
        font-medium inline-flex items-center justify-center gap-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'
export default Button
