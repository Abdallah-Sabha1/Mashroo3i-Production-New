import { forwardRef } from 'react'

const Select = forwardRef(({ label, options = [], error, required, name, placeholder = 'Select an option', className = '', ...props }, ref) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={name} className="block text-xs font-medium text-slate-700 uppercase tracking-wide mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={name}
        name={name}
        className={`
          w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-slate-900
          appearance-none cursor-pointer
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500
          ${error ? 'border-red-300' : 'border-slate-300 hover:border-slate-400'}
          bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]
          bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'
export default Select
