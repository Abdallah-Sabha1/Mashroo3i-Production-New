const fmt = (n) =>
  typeof n === 'number' ? `${Math.round(n).toLocaleString()} JOD` : '—'

const ProjectionTable = ({ monthlyData = [] }) => {
  if (!monthlyData.length) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-gray-700">
      <table className="w-full text-xs min-w-[640px]">
        <thead>
          <tr className="bg-slate-50 dark:bg-gray-800 text-slate-500 dark:text-gray-400">
            {['الشهر', 'الإيرادات', 'التكاليف', 'الربح', 'نسبة الهامش', 'التدفق النقدي التراكمي'].map(h => (
              <th key={h} className="px-3 py-2.5 text-right font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
          {monthlyData.map((m) => {
            const isProfit = m.profit > 0
            const rowClass = isProfit
              ? 'bg-green-50/40 dark:bg-green-950/10'
              : m.profit < 0
              ? 'bg-red-50/40 dark:bg-red-950/10'
              : ''
            return (
              <tr key={m.month} className={`${rowClass} hover:bg-slate-50/80 dark:hover:bg-gray-800/60 transition-colors`}>
                <td className="px-3 py-2 font-medium text-slate-700 dark:text-gray-300 text-right">
                  {m.month}
                </td>
                <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400 text-right tabular-nums">
                  {fmt(m.revenue)}
                </td>
                <td className="px-3 py-2 text-red-600 dark:text-red-400 text-right tabular-nums">
                  {fmt(m.costs)}
                </td>
                <td className={`px-3 py-2 font-semibold text-right tabular-nums ${
                  isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {fmt(m.profit)}
                </td>
                <td className={`px-3 py-2 text-right tabular-nums ${
                  m.marginPercent >= 0 ? 'text-slate-600 dark:text-gray-300' : 'text-red-500'
                }`}>
                  {m.marginPercent?.toFixed(1)}%
                </td>
                <td className={`px-3 py-2 font-semibold text-right tabular-nums ${
                  m.cumulativeCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {fmt(m.cumulativeCashFlow)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ProjectionTable
