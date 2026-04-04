import Tooltip from '../ui/Tooltip'

const MetricCard = ({ label, value, tooltip, subtitle, colorClass = 'text-gray-900 dark:text-gray-50' }) => (
  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800">
    <div className="mb-2">
      {tooltip ? (
        <Tooltip text={tooltip}>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-300">{label}</p>
        </Tooltip>
      ) : (
        <p className="text-xs font-medium text-gray-500 dark:text-gray-300">{label}</p>
      )}
    </div>
    <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    {subtitle && <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{subtitle}</p>}
  </div>
)

export default MetricCard
