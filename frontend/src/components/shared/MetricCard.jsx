import Tooltip from '../ui/Tooltip'

const MetricCard = ({ label, value, tooltip, subtitle, colorClass = 'text-slate-900 dark:text-white' }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900">
    <div className="mb-2">
      {tooltip ? (
        <Tooltip text={tooltip}>
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400">{label}</p>
        </Tooltip>
      ) : (
        <p className="text-xs font-medium text-slate-500 dark:text-gray-400">{label}</p>
      )}
    </div>
    <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    {subtitle && <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">{subtitle}</p>}
  </div>
)

export default MetricCard
