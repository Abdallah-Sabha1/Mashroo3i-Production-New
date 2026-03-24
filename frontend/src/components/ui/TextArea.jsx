import { forwardRef } from 'react'

const TextArea = forwardRef(({ label, placeholder, error, required, name, rows = 4, className = '', ...props }, ref) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={name} className="block text-xs font-medium text-slate-700 dark:text-gray-300 uppercase tracking-wide mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-900 text-sm text-slate-900 dark:text-white
          placeholder:text-slate-500 dark:placeholder:text-gray-500 resize-none
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500
          ${error ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-300 dark:border-gray-700 hover:border-slate-400 dark:hover:border-gray-600'}
        `}
        {...props}
      />
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

TextArea.displayName = 'TextArea'
export default TextArea
