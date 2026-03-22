import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { ideas as ideasApi } from '../services/api'
import Navbar from '../components/layout/Navbar'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { SECTORS, LOCATIONS, COMPETITION_LEVELS } from '../utils/constants'

const steps = ['Basic Information', 'Problem & Solution', 'Market & Audience', 'Review & Submit']

const SubmitIdea = () => {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({
    defaultValues: {
      title: '', sector: '', estimatedBudget: '', location: '',
      description: '', problemStatement: '', usp: '',
      targetAudience: '', marketSize: '', competitionLevel: ''
    }
  })

  const formData = watch()

  const stepFields = [
    ['title', 'sector', 'estimatedBudget', 'location'],
    ['description', 'problemStatement', 'usp'],
    ['targetAudience', 'marketSize', 'competitionLevel'],
  ]

  const nextStep = async () => {
    if (step < 3) {
      const valid = await trigger(stepFields[step])
      if (valid) setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 0) setStep(step - 1)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      data.estimatedBudget = parseFloat(data.estimatedBudget)
      const res = await ideasApi.create(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit idea.')
    } finally {
      setLoading(false)
    }
  }

  const ReviewSection = ({ title, items, editStep }) => (
    <div className="bg-slate-50 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-slate-900">{title}</h4>
        <button onClick={() => setStep(editStep)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">Edit</button>
      </div>
      <div className="space-y-2">
        {items.map(([label, value]) => (
          <div key={label} className="flex flex-col sm:flex-row sm:items-start gap-1">
            <span className="text-sm font-medium text-slate-500 sm:w-40 flex-shrink-0">{label}:</span>
            <span className="text-sm text-slate-900">{value || '-'}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Submit Your Business Idea</h1>
          <p className="text-slate-500 mb-8">Complete all steps to get your AI-powered evaluation.</p>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    i < step ? 'bg-primary-600 text-white' :
                    i === step ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                    'bg-slate-200 text-slate-500'
                  }`}>
                    {i < step ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${i <= step ? 'text-primary-600' : 'text-slate-400'}`}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${i < step ? 'bg-primary-600' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
          )}

          <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <Input label="Business Title" placeholder="e.g., Organic Food Delivery App" required error={errors.title?.message}
                      {...register('title', { required: 'Title is required', maxLength: { value: 200, message: 'Max 200 characters' } })} />
                    <Select label="Sector" options={SECTORS} required error={errors.sector?.message}
                      {...register('sector', { required: 'Sector is required' })} />
                    <Input label="Estimated Budget (JOD)" type="number" placeholder="e.g., 25000" required error={errors.estimatedBudget?.message}
                      {...register('estimatedBudget', { required: 'Budget is required', min: { value: 1, message: 'Must be positive' } })} />
                    <Select label="Location" options={LOCATIONS} required error={errors.location?.message}
                      {...register('location', { required: 'Location is required' })} />
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <TextArea label="Description" rows={5} placeholder="Describe your business idea in detail..." required error={errors.description?.message}
                      {...register('description', { required: 'Description is required', minLength: { value: 200, message: 'Minimum 200 characters' } })} />
                    <TextArea label="Problem Statement" rows={4} placeholder="What problem does your business solve?" required error={errors.problemStatement?.message}
                      {...register('problemStatement', { required: 'Problem statement is required', minLength: { value: 100, message: 'Minimum 100 characters' } })} />
                    <TextArea label="Unique Selling Point" rows={4} placeholder="What makes your business unique?" required error={errors.usp?.message}
                      {...register('usp', { required: 'USP is required', minLength: { value: 100, message: 'Minimum 100 characters' } })} />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <Input label="Target Audience" placeholder="Who are your target customers? (age, income, location, interests)" required error={errors.targetAudience?.message}
                      {...register('targetAudience', { required: 'Target audience is required' })} />
                    <Input label="Market Size Estimation" placeholder="Estimated market size in Jordan or target region" required error={errors.marketSize?.message}
                      {...register('marketSize', { required: 'Market size is required' })} />
                    <Select label="Competition Level" options={COMPETITION_LEVELS} required error={errors.competitionLevel?.message}
                      {...register('competitionLevel', { required: 'Competition level is required' })} />
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Review Your Submission</h3>
                    <ReviewSection title="Basic Information" editStep={0} items={[
                      ['Title', formData.title],
                      ['Sector', formData.sector],
                      ['Budget', formData.estimatedBudget ? `${Number(formData.estimatedBudget).toLocaleString()} JOD` : ''],
                      ['Location', formData.location],
                    ]} />
                    <ReviewSection title="Problem & Solution" editStep={1} items={[
                      ['Description', formData.description],
                      ['Problem', formData.problemStatement],
                      ['USP', formData.usp],
                    ]} />
                    <ReviewSection title="Market & Audience" editStep={2} items={[
                      ['Target Audience', formData.targetAudience],
                      ['Market Size', formData.marketSize],
                      ['Competition', formData.competitionLevel],
                    ]} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                <Button variant="ghost" onClick={prevStep} disabled={step === 0} type="button">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </Button>
                {step < 3 ? (
                  <Button onClick={nextStep} type="button">
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                ) : (
                  <Button type="submit" loading={loading} variant="success">
                    Submit for Evaluation
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default SubmitIdea
