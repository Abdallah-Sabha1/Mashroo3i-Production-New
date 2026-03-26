import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ideas as ideasApi, evaluation as evalApi, financial as finApi, businessPlan as bpApi } from '../services/api'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { Spinner } from '../components/ui/Loading'
import { formatCurrency, formatDate } from '../utils/helpers'
import useAuthStore from '../store/authStore'

const BusinessPlan = () => {
  const { ideaId } = useParams()
  const { user } = useAuthStore()
  const [idea, setIdea] = useState(null)
  const [evalData, setEvalData] = useState(null)
  const [finData, setFinData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadAll()
  }, [ideaId])

  const loadAll = async () => {
    try {
      const [ideaRes] = await Promise.all([ideasApi.getById(ideaId)])
      setIdea(ideaRes.data)
      try {
        const evalRes = await evalApi.get(ideaId)
        setEvalData(evalRes.data)
      } catch (e) {}
      try {
        const finRes = await finApi.get(ideaId)
        setFinData(finRes.data)
      } catch (e) {}
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await bpApi.download(ideaId)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${idea?.title || 'business-plan'}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => window.print()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
        <Navbar />
        <div className="flex justify-center py-32"><Spinner size="lg" /></div>
      </div>
    )
  }

  const swot = evalData?.swotAnalysis ? (typeof evalData.swotAnalysis === 'string' ? JSON.parse(evalData.swotAnalysis) : evalData.swotAnalysis) : {}
  const finSummary = finData?.financialSummary ? (typeof finData.financialSummary === 'string' ? JSON.parse(finData.financialSummary) : finData.financialSummary) : null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Business Plan</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline" size="sm">Print</Button>
              <Button onClick={handleDownload} loading={downloading} size="sm">Download PDF</Button>
            </div>
          </div>
        </motion.div>

        {/* Document */}
        <div className="space-y-6 print:space-y-4" id="business-plan">
          {/* Cover Page */}
          <Card className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <p className="text-sm font-medium text-primary-600 uppercase tracking-widest mb-4">Business Plan</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{idea?.title}</h2>
            <Badge color="purple" size="lg">{idea?.sector}</Badge>
            <div className="mt-8 text-sm text-slate-500 dark:text-gray-500 space-y-1">
              <p>Prepared by: {user?.fullName}</p>
              <p>Date: {formatDate(new Date().toISOString())}</p>
              <p>Market: Amman, Jordan</p>
            </div>
          </Card>

          {/* Table of Contents */}
          <Card>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Table of Contents</h2>
            <ol className="space-y-2 text-sm">
              {['Executive Summary', 'Business Description', 'AI Verdict', 'Evaluation Scores', 'SWOT Analysis', 'What to do next', 'Financial Projections'].map((s, i) => (
                <li key={s} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-gray-800 last:border-0">
                  <span className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-semibold text-sm">{i + 1}</span>
                  <span className="text-slate-700 dark:text-gray-300">{s}</span>
                </li>
              ))}
            </ol>
          </Card>

          {/* 1. Executive Summary */}
          <Card>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">1</span>
              Executive Summary
            </h2>
            <div className="prose prose-sm prose-slate dark:prose-invert max-w-none space-y-3">
              <p className="text-slate-700 dark:text-gray-300 leading-relaxed">{idea?.description}</p>
              {idea?.problemStatement && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Problem Statement</h4>
                  <p className="text-slate-700 dark:text-gray-300">{idea.problemStatement}</p>
                </div>
              )}
              {idea?.usp && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Unique Selling Point</h4>
                  <p className="text-slate-700 dark:text-gray-300">{idea.usp}</p>
                </div>
              )}
            </div>
          </Card>

          {/* 2. Business Description */}
          <Card>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">2</span>
              Business Description
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Sector', idea?.sector],
                ['Region', (idea?.ammanRegion || '') + ' Amman'],
                ['Starting Budget', formatCurrency(idea?.estimatedBudget || 0)],
                ['Competition', idea?.competitionLevel],
                ['Target Audience', idea?.targetAudience],
                ['Market Size', idea?.marketSize],
              ].map(([label, val]) => (
                <div key={label} className="bg-slate-50 dark:bg-gray-900 rounded-xl p-4">
                  <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mb-1">{label}</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{val || 'N/A'}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* 3. AI Evaluation */}
          {evalData && (
            <Card>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">3</span>
                AI Verdict
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ['How original', evalData.noveltyScore],
                  ['Market opportunity', evalData.marketPotentialScore],
                  ['Overall score', evalData.overallScore],
                  ['Risk assessment', evalData.riskLevel],
                ].map(([label, val]) => (
                  <div key={label} className="bg-slate-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                    <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mb-1">{label}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{val}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 4. SWOT */}
          {evalData && (
            <Card>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">4</span>
                SWOT Analysis
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'strengths', title: 'Strengths', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
                  { key: 'weaknesses', title: 'Weaknesses', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
                  { key: 'opportunities', title: 'Opportunities', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
                  { key: 'threats', title: 'Threats', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
                ].map(q => (
                  <div key={q.key} className={`${q.bg} rounded-xl p-4`}>
                    <h4 className={`font-semibold ${q.text} mb-2`}>{q.title}</h4>
                    <ul className="space-y-1">
                      {(swot[q.key] || []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-gray-300">
                          <span className={`w-1.5 h-1.5 rounded-full ${q.dot} mt-1.5 flex-shrink-0`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 5. Market Analysis */}
          <Card>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">5</span>
              Market Analysis
            </h2>
            <div className="space-y-4 text-sm text-slate-700 dark:text-gray-300">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Target Market</h4>
                <p>{idea?.targetAudience || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Market Size</h4>
                <p>{idea?.marketSize || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Competition Level</h4>
                <p>{idea?.competitionLevel || 'Not assessed'}</p>
              </div>
            </div>
          </Card>

          {/* 6. Financial Projections */}
          {finData && (
            <Card>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">6</span>
                Financial Projections
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  ['Starting budget', formatCurrency(finData.initialInvestment)],
                  ['Monthly income', formatCurrency(finData.monthlyRevenue)],
                  ['Monthly expenses', formatCurrency(finData.monthlyCosts)],
                  ['Time to break even', finData.breakEvenMonths > 0 ? `${finData.breakEvenMonths} months` : 'N/A'],
                  ['2-year return on investment (ROI)', `${finData.roiPercentage?.toFixed(1)}%`],
                ].map(([label, val]) => (
                  <div key={label} className="bg-slate-50 dark:bg-gray-900 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mb-1">{label}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{val}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 7. Recommendations */}
          {evalData?.recommendations && (
            <Card className="!bg-blue-50 dark:!bg-blue-950 !border-blue-200 dark:!border-blue-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">7</span>
                What to do next
              </h2>
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{evalData.recommendations}</p>
            </Card>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3 mt-8">
          <Button onClick={handleDownload} loading={downloading} className="flex-1" size="lg">
            Download PDF
          </Button>
          <Button onClick={handlePrint} variant="outline" className="flex-1" size="lg">
            Print
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BusinessPlan
