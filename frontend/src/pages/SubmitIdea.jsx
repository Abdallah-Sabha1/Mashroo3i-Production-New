// pages/SubmitIdea.jsx - Complete 2-Step Form
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import api, { ideas as ideasApi } from '../services/api'
import Navbar from '../components/layout/Navbar'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import TextArea from '../components/ui/TextArea'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { SECTORS, LOCATIONS, COMPETITION_LEVELS } from '../utils/constants'

const steps = ['Your Idea', 'AI Analysis', 'Business Details', 'Review & Submit']

const SubmitIdea = () => {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [aiInsights, setAiInsights] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, watch, trigger, getValues, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      problemStatement: '',
      usp: '',
      targetAudience: '',
      sector: '',
      estimatedBudget: '',
      location: '',
      marketSize: '',
      competitionLevel: ''
    }
  })

  // Step 1: Collect title + description only
  const handleStep1Next = async () => {
    const valid = await trigger(['title', 'description'])
    if (!valid) return

    // Call AI to generate insights
    setAiLoading(true)
    try {
      const values = getValues()
      const response = await api.post('/ideas/analyze', {
          title: values.title,
          description: values.description
      })
      const data = response.data
      setAiInsights(data)
      setStep(1)
    } catch (err) {
      setError('Failed to generate insights. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  // Step 2: User reviews AI insights
  const handleStep2Next = () => {
    setStep(2)
  }

  // Step 3: Collect business details
  const handleStep3Next = async () => {
    const valid = await trigger(['sector', 'estimatedBudget', 'location', 'marketSize', 'competitionLevel'])
    if (valid) setStep(3)
  }

  // Final submit
  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      data.estimatedBudget = parseFloat(data.estimatedBudget)
      // Use AI-generated insights
      if (aiInsights) {
        data.problemStatement = aiInsights.problemStatement
        data.usp = aiInsights.uniqueSellingPoint
        data.targetAudience = aiInsights.targetAudience
      }
      const res = await ideasApi.create(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit idea.')
    } finally {
      setLoading(false)
    }
  }

  const prevStep = () => {
    if (step > 0) setStep(step - 1)
  }

  // Progress indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
              i < step ? 'bg-indigo-600 text-white' :
              i === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-50' :
              'bg-slate-100 text-slate-500'
            }`}>
              {i < step ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-xs mt-2 font-medium hidden sm:block text-center max-w-20 ${i <= step ? 'text-indigo-600' : 'text-slate-400'}`}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${i < step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )

  // Step 1: Title & Description
  const Step1Content = () => (
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          How This Works
        </h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          Tell us your business idea in your own words. Our AI will analyze it and generate insights like the problem you're solving, your unique value, and your target audience. You can review and edit everything before submitting.
        </p>
      </div>

      <Input 
        label="Business Idea Title" 
        placeholder="e.g., Organic Food Delivery App for Amman" 
        required 
        error={errors.title?.message}
        {...register('title', { 
          required: 'Title is required', 
          minLength: { value: 5, message: 'Minimum 5 characters' },
          maxLength: { value: 200, message: 'Max 200 characters' } 
        })} 
      />

      <TextArea 
        label="Describe Your Idea" 
        rows={6}
        placeholder="Describe your business idea in detail. What problem does it solve? How will it work? What makes it special?" 
        required 
        error={errors.description?.message}
        {...register('description', { 
          required: 'Description is required', 
          minLength: { value: 100, message: 'Minimum 100 characters' },
          maxLength: { value: 2000, message: 'Max 2000 characters' }
        })} 
      />

      <div className="flex gap-3">
        <Button 
          onClick={handleStep1Next} 
          type="button"
          disabled={aiLoading}
          className="flex-1"
        >
          {aiLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Analyzing with AI...
            </>
          ) : (
            <>
              Next: Let AI Analyze
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )

  // Step 2: Review AI Insights
  const Step2Content = () => (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          AI Generated Insights
        </h3>
        <p className="text-sm text-slate-600">
          Our AI analyzed your idea and created these insights. Review them and edit if needed before continuing.
        </p>
      </div>

      {aiInsights && (
        <div className="space-y-5">
          <InsightCard 
            iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            title="The Problem You're Solving"
            content={aiInsights.problemStatement}
            fieldName="problemStatement"
            register={register}
            errors={errors}
          />

          <InsightCard 
            iconPath="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            title="Your Unique Value Proposition"
            content={aiInsights.uniqueSellingPoint}
            fieldName="usp"
            register={register}
            errors={errors}
          />

          <InsightCard 
            iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            title="Target Audience"
            content={aiInsights.targetAudience}
            fieldName="targetAudience"
            register={register}
            errors={errors}
          />
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={prevStep} type="button" className="flex-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <Button onClick={handleStep2Next} type="button" className="flex-1">
          Next: Business Details
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </motion.div>
  )

  // Step 3: Business Details
  const Step3Content = () => (
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <Select
        label="Sector"
        placeholder="Select a sector"
        options={SECTORS}
        required
        error={errors.sector?.message}
        {...register('sector', { required: 'Sector is required' })}
      />

      <Input
        label="Estimated Budget (JOD)"
        type="number"
        placeholder="e.g., 25000"
        required
        error={errors.estimatedBudget?.message}
        {...register('estimatedBudget', {
          required: 'Budget is required',
          min: { value: 1, message: 'Must be positive' },
          max: { value: 999999, message: 'Max 999,999 JOD' }
        })}
      />

      <Select
        label="Location"
        placeholder="Select location"
        options={LOCATIONS}
        required
        error={errors.location?.message}
        {...register('location', { required: 'Location is required' })}
      />

      <Input
        label="Market Size Estimation"
        placeholder="e.g., ~500,000 potential customers in Amman"
        required
        error={errors.marketSize?.message}
        {...register('marketSize', { required: 'Market size is required' })}
      />

      <Select
        label="Competition Level"
        placeholder="Select level"
        options={COMPETITION_LEVELS}
        required
        error={errors.competitionLevel?.message}
        {...register('competitionLevel', { required: 'Competition level is required' })}
      />

      <div className="flex gap-3">
        <Button variant="ghost" onClick={prevStep} type="button" className="flex-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <Button onClick={handleStep3Next} type="button" className="flex-1">
          Next: Review & Submit
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </motion.div>
  )

  // Step 4: Final Review
  const Step4Content = () => {
    const reviewData = getValues()
    return (
    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Review Your Submission</h3>

      <ReviewSection title="Your Idea" items={[
        ['Title', reviewData.title],
        ['Description', reviewData.description?.substring(0, 100) + '...']
      ]} />

      <ReviewSection title="AI-Generated Insights" items={[
        ['Problem', aiInsights?.problemStatement?.substring(0, 100) + '...'],
        ['Unique Value', aiInsights?.uniqueSellingPoint?.substring(0, 100) + '...'],
        ['Target Audience', aiInsights?.targetAudience?.substring(0, 100) + '...']
      ]} />

      <ReviewSection title="Business Details" items={[
        ['Sector', reviewData.sector],
        ['Budget', reviewData.estimatedBudget ? `${Number(reviewData.estimatedBudget).toLocaleString()} JOD` : ''],
        ['Location', reviewData.location],
        ['Market Size', reviewData.marketSize],
        ['Competition', reviewData.competitionLevel]
      ]} />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ✓ Your idea will be evaluated by our AI for novelty, market potential, SWOT analysis, and risk assessment.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={prevStep} type="button" className="flex-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <Button type="submit" loading={loading} variant="success" className="flex-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Submit for Evaluation
        </Button>
      </div>
    </motion.div>
  )}

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Submit Your Business Idea
          </h1>
          <p className="text-slate-500 mb-8">Get AI-powered evaluation and actionable insights for your startup.</p>

          <StepIndicator />

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <Card className="border-0 shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {step === 0 && <Step1Content />}
                {step === 1 && <Step2Content />}
                {step === 2 && <Step3Content />}
                {step === 3 && <Step4Content />}
              </AnimatePresence>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// Helper component for insights
function InsightCard({ iconPath, title, content, fieldName, register, errors }) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <Card className="bg-white border-slate-200">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          {iconPath && (
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
            </svg>
          )}
          {title}
        </h4>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs px-2 py-1 rounded text-indigo-600 hover:bg-slate-50 border border-slate-200 transition"
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <TextArea 
          rows={3}
          {...register(fieldName)}
          defaultValue={content}
        />
      ) : (
        <p className="text-sm text-slate-700 leading-relaxed">{content}</p>
      )}
    </Card>
  )
}

// Helper component for review
function ReviewSection({ title, items }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <h4 className="font-semibold text-slate-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {items.map(([label, value]) => (
          <div key={label} className="flex gap-3">
            <span className="text-sm font-medium text-slate-600 min-w-32">{label}:</span>
            <span className="text-sm text-slate-900">{value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubmitIdea
