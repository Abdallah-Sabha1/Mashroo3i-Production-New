import { forwardRef } from 'react'

const Input = forwardRef(({ label, type = 'text', placeholder, error, required, name, className = '', icon, ...props }, ref) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={name} className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 dark:text-emerald-400">
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
            w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
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
