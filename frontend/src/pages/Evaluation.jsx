import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { evaluation as evalApi, ideas as ideasApi } from '../services/api'
import Navbar from '../components/layout/Navbar'
import ScoreCircle from '../components/shared/ScoreCircle'
import SwotGrid from '../components/shared/SwotGrid'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { Spinner } from '../components/ui/Loading'
import { RISK_COLORS } from '../utils/constants'

const Evaluation = () => {
  const { ideaId } = useParams()
  const navigate = useNavigate()
  const [evalData, setEvalData] = useState(null)
  const [idea, setIdea] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadData()
  }, [ideaId])

  const loadData = async () => {
    try {
      const ideaRes = await ideasApi.getById(ideaId)
      setIdea(ideaRes.data)

      try {
        const evalRes = await evalApi.get(ideaId)
        setEvalData(evalRes.data)
      } catch (err) {
        if (err.response?.status === 404) {
          setGenerating(true)
          const genRes = await evalApi.generate(ideaId)
          setEvalData(genRes.data)
          setGenerating(false)
        }
      }
    } catch (err) {
      console.error('Error loading evaluation:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-slate-500 font-medium">
              {generating ? 'AI is analyzing your business idea...' : 'Loading evaluation...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const swotData = evalData?.swotAnalysis ? (typeof evalData.swotAnalysis === 'string' ? JSON.parse(evalData.swotAnalysis) : evalData.swotAnalysis) : {}
  const riskStyle = RISK_COLORS[evalData?.riskLevel] || RISK_COLORS['Medium Risk']

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{idea?.title}</h1>
          <p className="text-slate-500 mt-1">AI Evaluation Results</p>
        </motion.div>

        {/* Scores */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
              <ScoreCircle score={evalData?.noveltyScore || 0} label="Novelty Score" />
              <ScoreCircle score={evalData?.marketPotentialScore || 0} label="Market Potential" />
              <ScoreCircle score={evalData?.overallScore || 0} label="Overall Score" size={160} />
            </div>
          </Card>
        </motion.div>

        {/* Risk Level */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <Card className="text-center">
            <p className="text-sm font-medium text-slate-500 mb-3">Risk Assessment</p>
            <Badge color={riskStyle.badge} size="lg" className="text-lg px-6 py-2">
              {evalData?.riskLevel}
            </Badge>
          </Card>
        </motion.div>

        {/* SWOT Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">SWOT Analysis</h2>
          <SwotGrid swotData={swotData} />
        </motion.div>

        {/* Recommendations */}
        {evalData?.recommendations && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
            <Card className="!bg-blue-50 !border-blue-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{'\uD83D\uDCA1'}</span>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">AI Recommendations</h3>
                  <p className="text-sm text-blue-800 leading-relaxed">{evalData.recommendations}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button onClick={() => navigate(`/financial/${ideaId}`)} className="flex-1">
            Continue to Financial Planning
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
          <Button variant="outline" onClick={() => navigate(`/business-plan/${ideaId}`)} className="flex-1">
            View Business Plan
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default Evaluation
