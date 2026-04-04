export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <svg className={`animate-spin ${sizes[size]} text-primary-600 ${className}`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
)

/* Layout-matching skeleton for Dashboard ideas list */
export const DashboardSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="rounded-2xl border border-gray-200/70 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <div className="skeleton h-5 w-48 rounded-md" />
              <div className="skeleton h-5 w-16 rounded-full" />
            </div>
            <div className="skeleton h-4 w-32 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <div className="skeleton h-8 w-24 rounded-lg" />
            <div className="skeleton h-8 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

/* Layout-matching skeleton for Evaluation page — mirrors strategic split-view */
export const EvaluationSkeleton = () => (
  <div className="space-y-6">
    {/* Score row */}
    <div className="rounded-xl border border-gray-200/70 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="skeleton h-4 w-32 rounded-md" />
      </div>
      <div className="flex flex-col md:flex-row items-center justify-around gap-8 px-5 py-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="skeleton h-3 w-24 rounded-md" />
            <div className="skeleton h-16 w-16 rounded-full" />
            <div className="skeleton h-3 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
    {/* Strategic SWOT split-view */}
    <div className="rounded-xl border border-gray-200/70 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="skeleton h-4 w-28 rounded-md" />
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, col) => (
          <div key={col} className="space-y-4">
            <div className="skeleton h-3 w-24 rounded-md" />
            {[...Array(2)].map((_, card) => (
              <div key={card} className="border border-gray-200/80 dark:border-gray-700 border-s-4 border-s-gray-200 dark:border-s-gray-700 rounded-xl p-5 space-y-2">
                <div className="skeleton h-3 w-20 rounded-md" />
                <div className="skeleton h-4 w-full rounded-md" />
                <div className="skeleton h-4 w-5/6 rounded-md" />
                <div className="skeleton h-4 w-4/5 rounded-md" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center space-y-4">
      <Spinner size="lg" />
    </div>
  </div>
)
