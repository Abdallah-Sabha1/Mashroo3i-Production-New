import { forwardRef } from 'react'

const Input = forwardRef(({ label, type = 'text', placeholder, error, required, name, className = '', icon, ...props }, ref) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={name} className="block text-xs font-medium text-slate-700 uppercase tracking-wide mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-slate-900
            placeholder:text-slate-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-300 hover:border-slate-400'}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
