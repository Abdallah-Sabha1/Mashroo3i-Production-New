const ScenarioCard = ({ title, value, unit = '', color = 'indigo', icon, subtitle }) => {
  const colorMap = {
    indigo: { bg: 'bg-primary-50 dark:bg-primary-900/30/30', text: 'text-primary-700 dark:text-primary-300', icon: 'text-primary-500' },
    green:  { bg: 'bg-green-50  dark:bg-green-950/30',  text: 'text-green-700  dark:text-green-300',  icon: 'text-green-500'  },
    amber:  { bg: 'bg-amber-50  dark:bg-amber-950/30',  text: 'text-amber-700  dark:text-amber-300',  icon: 'text-amber-500'  },
    red:    { bg: 'bg-red-50    dark:bg-red-950/30',    text: 'text-red-700    dark:text-red-300',    icon: 'text-red-500'    },
    slate:  { bg: 'bg-slate-50  dark:bg-slate-900/50',  text: 'text-slate-700  dark:text-slate-300',  icon: 'text-slate-500'  },
  }
  const c = colorMap[color] ?? colorMap.indigo

  return (
    <div className={`rounded-xl p-4 ${c.bg}`}>
      {icon && <div className={`mb-2 ${c.icon}`}>{icon}</div>}
      <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mb-1">{title}</p>
      <p className={`text-xl font-bold ${c.text} tabular-nums`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  )
}

export default ScenarioCard
