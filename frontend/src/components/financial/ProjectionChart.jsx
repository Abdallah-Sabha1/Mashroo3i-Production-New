import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useTranslation } from 'react-i18next'

const ProjectionChart = ({ monthlyData = [], scenarioName }) => {
  const { t } = useTranslation()

  const labelRevenue  = t('financialWizard.projections.chart.revenue')
  const labelCosts    = t('financialWizard.projections.chart.costs')
  const labelProfit   = t('financialWizard.projections.chart.profit')
  const labelCashFlow = t('financialWizard.projections.chart.cashFlow')

  const data = monthlyData.map(m => ({
    month: m.month,
    [labelRevenue]:  Math.round(m.revenue),
    [labelCosts]:    Math.round(m.costs),
    [labelProfit]:   Math.round(m.profit),
    [labelCashFlow]: Math.round(m.cumulativeCashFlow),
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-slate-200 dark:border-gray-700 p-3 text-xs">
        <p className="font-semibold text-slate-700 dark:text-gray-300 mb-1">
          {t('financialWizard.projections.table.month')} {label}
        </p>
        {payload.map((item, i) => (
          <p key={i} style={{ color: item.color }}>
            {item.name}: {Math.round(item.value).toLocaleString()} JOD
          </p>
        ))}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-800" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11 }}
          stroke="#94a3b8"
          tickFormatter={v => `${v}`}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          stroke="#94a3b8"
          width={60}
          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 2" />
        <Line type="monotone" dataKey={labelRevenue}  stroke="#6366f1" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey={labelCosts}    stroke="#ef4444" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey={labelProfit}   stroke="#10b981" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey={labelCashFlow} stroke="#8b5cf6" strokeWidth={2} dot={false} strokeDasharray="5 3" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default ProjectionChart
