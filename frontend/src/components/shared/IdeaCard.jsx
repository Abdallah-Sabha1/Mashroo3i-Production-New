import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

export default function IdeaCard({ idea, delay = 0 }) {
  // Determine status
  const getStatus = () => {
    if (idea.hasFinancialPlan) return { label: 'Complete', color: 'green' }
    if (idea.evaluation) return { label: 'Evaluated', color: 'amber' }
    return { label: 'Submitted', color: 'gray' }
  }

  const status = getStatus()

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link to={`/evaluation/${idea.ideaId}`}>
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
          {/* Header with title and status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition line-clamp-2">
                {idea.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{idea.sector}</p>
            </div>
            <Badge color={status.color} size="sm" className="flex-shrink-0 whitespace-nowrap ml-2">
              {status.label}
            </Badge>
          </div>

          {/* Description preview */}
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
            {idea.description}
          </p>

          {/* Budget and evaluation details */}
          <div className="space-y-3 mb-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Budget</span>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {Number(idea.estimatedBudget).toLocaleString()} JOD
              </span>
            </div>

            {idea.evaluation && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Score</span>
                <span className={`font-bold text-lg ${getScoreColor(idea.evaluation.overallScore)}`}>
                  {idea.evaluation.overallScore}
                  <span className="text-gray-400 dark:text-gray-500 text-sm font-normal">/100</span>
                </span>
              </div>
            )}

            {idea.evaluation && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Risk</span>
                <Badge 
                  color={
                    idea.evaluation.riskLevel === 'Low Risk' ? 'green' :
                    idea.evaluation.riskLevel === 'Medium Risk' ? 'yellow' :
                    'red'
                  }
                  size="xs"
                >
                  {idea.evaluation.riskLevel}
                </Badge>
              </div>
            )}
          </div>

          {/* Footer with action buttons */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button 
              variant="ghost" 
              size="sm"
              className="flex-1 text-xs"
            >
              View Details
            </Button>
            {!idea.evaluation && (
              <Button 
                size="sm"
                className="flex-1 text-xs"
              >
                Evaluate
              </Button>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
