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
import { formatDate, formatCurrency, getScoreColor } from '../utils/helpers'

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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Entrepreneur'}
          </h1>
          <p className="text-slate-500 mt-1">Here's an overview of your business ideas.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard icon={'\uD83D\uDCA1'} label="Total Ideas" value={ideas.length} color="primary" delay={0} />
          <StatsCard icon={'\uD83E\uDD16'} label="Evaluations" value={evaluated.length} color="purple" delay={0.1} />
          <StatsCard icon={'\uD83D\uDCCA'} label="Average Score" value={avgScore} color="success" delay={0.2} />
          <StatsCard icon={'\uD83C\uDFAF'} label="Success Rate" value={`${successRate}%`} color="warning" delay={0.3} />
        </div>

        {/* Quick Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500 p-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00di0yaDR2MnptLTYgMGgtNHYtMmg0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Ready to launch your next idea?</h2>
                <p className="text-white/70 mt-1">Get AI-powered evaluation and a complete business plan.</p>
              </div>
              <Link to="/submit-idea">
                <Button variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-primary-600 whitespace-nowrap">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Business Idea
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Recent Ideas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Your Ideas</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : ideas.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-4xl mb-4">{'\uD83D\uDCA1'}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No ideas yet</h3>
              <p className="text-slate-500 mb-6">Submit your first business idea to get started.</p>
              <Link to="/submit-idea">
                <Button>Submit Your First Idea</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {ideas.map((idea, idx) => (
                <motion.div
                  key={idea.ideaId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card hover className="!p-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">{idea.title}</h3>
                          <Badge color="purple" size="sm">{idea.sector}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{formatDate(idea.createdAt)}</span>
                          <span>{formatCurrency(idea.estimatedBudget)}</span>
                          {idea.evaluation && (
                            <span className={`font-semibold ${getScoreColor(idea.evaluation.overallScore)}`}>
                              Score: {idea.evaluation.overallScore}
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
                              <Button variant="outline" size="sm">Financial Plan</Button>
                            </Link>
                          </>
                        ) : (
                          <Button size="sm" onClick={() => handleEvaluate(idea.ideaId)}>
                            Evaluate
                          </Button>
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
