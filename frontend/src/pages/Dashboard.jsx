import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ideas as ideasApi, evaluation as evalApi } from '../services/api'
import useAuthStore from '../store/authStore'
import Navbar from '../components/layout/Navbar'
import StatsCard from '../components/shared/StatsCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { Spinner } from '../components/ui/Loading'
import { formatDate, formatCurrency, getScoreColor, getSectorLabel } from '../utils/helpers'

const Dashboard = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIdeas()
  }, [])

  const loadIdeas = async () => {
    try {
      const res = await ideasApi.getAll()
      setIdeas(res.data)
    } catch (err) {
      console.error('Failed to load ideas:', err)
    } finally {
      setLoading(false)
    }
  }

  const evaluated = ideas.filter(i => i.evaluation)
  const avgScore = evaluated.length > 0
    ? Math.round(evaluated.reduce((sum, i) => sum + (i.evaluation?.overallScore || 0), 0) / evaluated.length)
    : 0
  const successRate = evaluated.length > 0
    ? Math.round((evaluated.filter(i => (i.evaluation?.overallScore || 0) >= 60).length / evaluated.length) * 100)
    : 0

  const handleEvaluate = async (ideaId) => {
    try {
      await evalApi.generate(ideaId)
      navigate(`/evaluation/${ideaId}`)
    } catch (err) {
      if (err.response?.status === 409) {
        navigate(`/evaluation/${ideaId}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Entrepreneur'}
          </h1>
          <p className="text-slate-600 dark:text-gray-400">Here's an overview of your business ideas</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard label="Total Ideas" value={ideas.length} description="All submitted ideas" delay={0} />
          <StatsCard label="Evaluations" value={evaluated.length} description={`${ideas.length > 0 ? Math.round(evaluated.length/ideas.length*100) : 0}% completion`} delay={0.1} />
          <StatsCard label="Avg Score" value={avgScore} description="Out of 100" delay={0.2} />
          <StatsCard label="Success Rate" value={`${successRate}%`} description="Score above 60" delay={0.3} />
        </div>

        {/* Quick Action */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">Ready to validate your next idea?</h2>
                <p className="text-white/70 text-sm">Submit a business idea and get AI-powered analysis instantly</p>
              </div>
              <Link to="/submit-idea">
                <button className="px-6 py-2.5 rounded-xl bg-white text-indigo-600 font-medium hover:shadow-md transition-all flex items-center gap-2 whitespace-nowrap">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Idea
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Ideas List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Your Ideas</h2>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : ideas.length === 0 ? (
            <Card className="text-center py-16">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No ideas yet</h3>
              <p className="text-slate-500 dark:text-gray-500 mb-6 text-sm">Submit your first business idea to get started.</p>
              <Link to="/submit-idea"><Button>Submit Your First Idea</Button></Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {ideas.map((idea, idx) => (
                <motion.div key={idea.ideaId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card hover className="!p-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate">{idea.title}</h3>
                          <Badge color="purple" size="sm">{getSectorLabel(idea.sector)}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-gray-500">
                          <span>{formatDate(idea.createdAt)}</span>
                          <span>{formatCurrency(idea.estimatedBudget)}</span>
                          {idea.evaluation && (
                            <span className={`font-semibold ${getScoreColor(idea.evaluation.overallScore)}`}>
                              Viability: {idea.evaluation.overallScore}/100
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {idea.evaluation ? (
                          <>
                            <Link to={`/evaluation/${idea.ideaId}`}>
                              <Button variant="ghost" size="sm">View Results</Button>
                            </Link>
                            <Link to={`/financial/${idea.ideaId}`}>
                              <Button variant="secondary" size="sm">Financial Plan</Button>
                            </Link>
                          </>
                        ) : (
                          <Button size="sm" onClick={() => handleEvaluate(idea.ideaId)}>Evaluate</Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
