export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <svg className={`animate-spin ${sizes[size]} text-indigo-600 ${className}`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
)

export const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center space-y-4">
      <Spinner size="lg" />
      <p className="text-sm text-slate-500 font-medium">Loading...</p>
    </div>
  </div>
)
