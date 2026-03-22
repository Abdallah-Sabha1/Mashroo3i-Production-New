import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-3">
        <p className="text-sm font-medium text-slate-900 mb-1">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="text-xs" style={{ color: item.color }}>
            {item.name}: {typeof item.value === 'number' ? item.value.toLocaleString() : item.value} JOD
          </p>
        ))}
      </div>
    )
  }
  return null
}

export const RevenueVsCostsChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="costs" name="Costs" stroke="#ef4444" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
)

export const CashFlowChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <Tooltip content={<CustomTooltip />} />
      <Area type="monotone" dataKey="cumulativeCash" name="Cumulative Cash Flow" stroke="#6366f1" fill="#eef2ff" strokeWidth={2} />
    </AreaChart>
  </ResponsiveContainer>
)

export const ProfitMarginChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="profit" name="Monthly Profit" fill="#6366f1" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
)
