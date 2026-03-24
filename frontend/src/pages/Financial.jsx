import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { financial as finApi, ideas as ideasApi } from '../services/api'
import Navbar from '../components/layout/Navbar'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Spinner } from '../components/ui/Loading'
import { RevenueVsCostsChart, CashFlowChart, ProfitMarginChart } from '../components/shared/FinancialChart'
import { formatCurrency } from '../utils/helpers'

const Financial = () => {
  const { ideaId } = useParams()
  const [idea, setIdea] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      initialInvestment: '', monthlyRevenue: '',
      rent: '', salaries: '', utilities: '', insurance: '', marketing: '',
      cogsPercent: ''
    }
  })

  useEffect(() => {
    loadData()
  }, [ideaId])

  const loadData = async () => {
    try {
      const ideaRes = await ideasApi.getById(ideaId)
      setIdea(ideaRes.data)
      try {
        const finRes = await finApi.get(ideaId)
        setResult(finRes.data)
      } catch (e) { /* No financial plan yet */ }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setCalculating(true)
    setError('')
    try {
      const payload = {
        initialInvestment: parseFloat(data.initialInvestment),
        monthlyRevenue: parseFloat(data.monthlyRevenue),
        rent: parseFloat(data.rent) || 0,
        salaries: parseFloat(data.salaries) || 0,
        utilities: parseFloat(data.utilities) || 0,
        insurance: parseFloat(data.insurance) || 0,
        marketing: parseFloat(data.marketing) || 0,
        cogsPercent: parseFloat(data.cogsPercent) || 0,
      }
      const res = await finApi.create(ideaId, payload)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Calculation failed.')
    } finally {
      setCalculating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
        <Navbar />
        <div className="flex justify-center py-32"><Spinner size="lg" /></div>
      </div>
    )
  }

  const projections = result?.financialSummary ? (typeof result.financialSummary === 'string' ? JSON.parse(result.financialSummary) : result.financialSummary) : null
  const chartData = projections?.monthlyProjections?.map((p, i) => ({
    month: `M${i + 1}`,
    revenue: Math.round(p.revenue),
    costs: Math.round(p.costs),
    profit: Math.round(p.profit),
    cumulativeCash: Math.round(p.cumulativeCash),
  })) || []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{idea?.title}</h1>
          <p className="text-slate-500 dark:text-gray-500 mt-1">Financial Planning & Projections</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
          {/* Input Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Financial Inputs</h2>
              {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Initial Investment (JOD)" type="number" placeholder="e.g., 25000" required
                  error={errors.initialInvestment?.message}
                  {...register('initialInvestment', { required: 'Required', min: { value: 1, message: 'Must be positive' } })} />
                <Input label="Expected Monthly Revenue (JOD)" type="number" placeholder="e.g., 8000" required
                  error={errors.monthlyRevenue?.message}
                  {...register('monthlyRevenue', { required: 'Required', min: { value: 1, message: 'Must be positive' } })} />

                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3">Fixed Monthly Costs (JOD)</h3>
                  <div className="space-y-3">
                    <Input label="Rent" type="number" placeholder="0" {...register('rent')} />
                    <Input label="Salaries" type="number" placeholder="0" {...register('salaries')} />
                    <Input label="Utilities" type="number" placeholder="0" {...register('utilities')} />
                    <Input label="Insurance" type="number" placeholder="0" {...register('insurance')} />
                    <Input label="Marketing" type="number" placeholder="0" {...register('marketing')} />
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3">Variable Costs</h3>
                  <Input label="Cost of Goods Sold (%)" type="number" placeholder="e.g., 30"
                    {...register('cogsPercent', { min: { value: 0, message: 'Min 0' }, max: { value: 100, message: 'Max 100' } })} />
                </div>

                <Button type="submit" loading={calculating} className="w-full" size="lg">
                  Calculate Projections
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
            {result ? (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Monthly Revenue', value: formatCurrency(result.monthlyRevenue), color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Monthly Costs', value: formatCurrency(result.monthlyCosts), color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Monthly Profit', value: formatCurrency(result.monthlyRevenue - result.monthlyCosts), color: result.monthlyRevenue - result.monthlyCosts >= 0 ? 'text-emerald-600' : 'text-red-600', bg: result.monthlyRevenue - result.monthlyCosts >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
                    { label: 'Break-Even', value: result.breakEvenMonths > 0 ? `${result.breakEvenMonths} months` : 'N/A', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: '2-Year ROI', value: `${result.roiPercentage?.toFixed(1)}%`, color: result.roiPercentage >= 0 ? 'text-emerald-600' : 'text-red-600', bg: result.roiPercentage >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
                  ].map(m => (
                    <Card key={m.label} className={`!p-4 ${m.bg} !border-transparent`}>
                      <p className="text-xs font-medium text-slate-500 dark:text-gray-400">{m.label}</p>
                      <p className={`text-lg font-bold ${m.color} mt-1`}>{m.value}</p>
                    </Card>
                  ))}
                </div>

                {/* Charts */}
                {chartData.length > 0 && (
                  <>
                    <Card>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Revenue vs Costs (24 months)</h3>
                      <RevenueVsCostsChart data={chartData} />
                    </Card>
                    <Card>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Cumulative Cash Flow</h3>
                      <CashFlowChart data={chartData} />
                    </Card>
                    <Card>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Monthly Profit</h3>
                      <ProfitMarginChart data={chartData} />
                    </Card>
                  </>
                )}

                {/* Summary Table */}
                {projections?.yearSummary && (
                  <Card>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">2-Year Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-gray-800">
                            <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-gray-400">Metric</th>
                            <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-gray-400">Year 1</th>
                            <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-gray-400">Year 2</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ['Revenue', projections.yearSummary.year1Revenue, projections.yearSummary.year2Revenue],
                            ['Costs', projections.yearSummary.year1Costs, projections.yearSummary.year2Costs],
                            ['Profit', projections.yearSummary.year1Profit, projections.yearSummary.year2Profit],
                          ].map(([label, y1, y2]) => (
                            <tr key={label} className="border-b border-slate-100 dark:border-gray-800">
                              <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{label}</td>
                              <td className="py-3 px-4 text-right text-slate-700 dark:text-gray-300">{formatCurrency(y1)}</td>
                              <td className="py-3 px-4 text-right text-slate-700 dark:text-gray-300">{formatCurrency(y2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                <div className="flex gap-3">
                  <Link to={`/business-plan/${ideaId}`} className="flex-1">
                    <Button className="w-full">View Business Plan</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Card className="flex items-center justify-center py-24 text-center">
                <div>
                  <div className="text-4xl mb-4">{'\uD83D\uDCCA'}</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No projections yet</h3>
                  <p className="text-slate-500 dark:text-gray-500">Fill in the form and click Calculate to see your financial projections.</p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Financial
