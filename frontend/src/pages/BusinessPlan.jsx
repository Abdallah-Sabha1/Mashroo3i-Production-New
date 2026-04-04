import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ideas as ideasApi, evaluation as evalApi, financial as finApi, businessPlan as bpApi } from '../services/api'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { Spinner } from '../components/ui/Loading'
import SwotGrid from '../components/shared/SwotGrid'
import { formatCurrency, formatDate, getSectorLabel } from '../utils/helpers'
import useAuthStore from '../store/authStore'
import useLanguageStore from '../store/languageStore'

const riskLevelKeyMap = {
  'Low Risk':    'evaluation.riskLevels.low',
  'Medium Risk': 'evaluation.riskLevels.medium',
  'High Risk':   'evaluation.riskLevels.high',
}

const SectionNumber = ({ n, color = 'bg-primary-600' }) => (
  <span className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>{n}</span>
)

const BusinessPlan = () => {
  const { t } = useTranslation()
  const { ideaId } = useParams()
  const { user } = useAuthStore()
  const { language } = useLanguageStore()
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
      const ideaRes = await ideasApi.getById(ideaId)
      setIdea(ideaRes.data)
      try { const evalRes = await evalApi.get(ideaId); setEvalData(evalRes.data) } catch (e) {}
      try { const finRes  = await finApi.get(ideaId);  setFinData(finRes.data)   } catch (e) {}
    } catch (err) {
      console.error('Error loading business plan:', err)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
        <Navbar />
        <div className="flex justify-center py-32"><Spinner size="lg" /></div>
      </div>
    )
  }

  const swotData = evalData?.swotAnalysis
    ? (typeof evalData.swotAnalysis === 'string' ? JSON.parse(evalData.swotAnalysis) : evalData.swotAnalysis)
    : {}

  const sectorLabel    = getSectorLabel(idea?.sector, t)
  const regionLabel    = idea?.ammanRegion
    ? t(`submitIdea.step2.regions.${idea.ammanRegion}.label`, { defaultValue: idea.ammanRegion })
    : null
  const translatedRisk = t(riskLevelKeyMap[evalData?.riskLevel] ?? 'evaluation.riskLevels.medium')

  // Determine section numbers dynamically (Market Analysis section removed)
  let sectionNum = 0
  const sn = () => ++sectionNum

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 mb-2">
                <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('businessPlan.backToDashboard')}
              </Link>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('businessPlan.title')}</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.print()} variant="outline" size="sm">{t('businessPlan.print')}</Button>
              <Button onClick={handleDownload} loading={downloading} size="sm">{t('businessPlan.downloadPdf')}</Button>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6 print:space-y-4" id="business-plan">

          {/* Cover Page */}
          <Card className="text-center py-16">
            {/* Clean icon instead of "M" logo */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/30 border border-primary-200 dark:border-primary-700 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">{t('businessPlan.title')}</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{idea?.title}</h2>
            {sectorLabel && <Badge color="purple" size="lg">{sectorLabel}</Badge>}
            <div className="mt-8 text-sm text-slate-500 dark:text-gray-500 space-y-1">
              <p>{t('businessPlan.preparedBy')} {user?.fullName}</p>
              <p>{t('businessPlan.date')} {formatDate(new Date().toISOString())}</p>
              <p>{t('businessPlan.market')} {regionLabel ? `${regionLabel}, ` : ''}Amman, Jordan</p>
            </div>
          </Card>

          {/* Table of Contents */}
          <Card>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('businessPlan.toc')}</h2>
            <ol className="space-y-2 text-sm">
              {t('businessPlan.tocItems', { returnObjects: true }).map((s, i) => (
                <li key={s} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-gray-800 last:border-0">
                  <span className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm flex-shrink-0">{i + 1}</span>
                  <span className="text-slate-700 dark:text-gray-300">{s}</span>
                </li>
              ))}
            </ol>
          </Card>

          {/* 1. Executive Summary */}
          <Card>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-start">
              <SectionNumber n={sn()} />
              {t('businessPlan.sections.execSummary')}
            </h2>
            <div className="space-y-4 text-sm">
              <p className="text-slate-700 dark:text-gray-300 leading-relaxed">{idea?.description}</p>
              {idea?.problemStatement && (
                <div className="bg-slate-50 dark:bg-gray-900 rounded-xl p-4 border-s-4 border-s-amber-400">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{t('businessPlan.sections.problemStatement')}</h4>
                  <p className="text-slate-700 dark:text-gray-300">{idea.problemStatement}</p>
                </div>
              )}
              {idea?.usp && (
                <div className="bg-slate-50 dark:bg-gray-900 rounded-xl p-4 border-s-4 border-s-primary-500">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{t('businessPlan.sections.usp')}</h4>
                  <p className="text-slate-700 dark:text-gray-300">{idea.usp}</p>
                </div>
              )}
            </div>
          </Card>

          {/* 2. Business Description */}
          <Card>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-start">
              <SectionNumber n={sn()} />
              {t('businessPlan.sections.businessDesc')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                [t('businessPlan.sections.sector'),         sectorLabel],
                regionLabel && [t('businessPlan.sections.region'), `${regionLabel}, Amman`],
                [t('businessPlan.sections.budget'),         formatCurrency(idea?.estimatedBudget || 0)],
                idea?.targetAudience && [t('businessPlan.sections.targetAudience'), idea.targetAudience],
              ].filter(Boolean).map(([label, val]) => (
                <div key={label} className="bg-slate-50 dark:bg-gray-900/60 rounded-xl p-4">
                  <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mb-1">{label}</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{val || t('common.na')}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* 3. AI Evaluation */}
          {evalData && (
            <Card>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-start">
                <SectionNumber n={sn()} />
                {t('businessPlan.sections.aiVerdict')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: t('businessPlan.sections.howOriginal'),        val: evalData.noveltyScore,        unit: '/10', color: 'text-purple-600 dark:text-purple-400' },
                  { label: t('businessPlan.sections.marketOpportunity'),  val: evalData.marketPotentialScore, unit: '/10', color: 'text-primary-600 dark:text-primary-400' },
                  { label: t('businessPlan.sections.overallScore'),       val: evalData.overallScore,         unit: '/10', color: 'text-primary-600 dark:text-primary-400' },
                  { label: t('businessPlan.sections.riskAssessment'),     val: translatedRisk,                unit: '',    color: 'text-slate-900 dark:text-white' },
                ].map(({ label, val, unit, color }) => (
                  <div key={label} className="bg-slate-50 dark:bg-gray-900/60 rounded-xl p-4 text-center">
                    <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mb-2 leading-tight">{label}</p>
                    <p className={`text-xl font-bold ${color}`}>
                      {val}<span className="text-sm font-normal text-slate-400">{unit}</span>
                    </p>
                  </div>
                ))}
              </div>
              {evalData.summary && (
                <p className="mt-4 text-sm text-slate-700 dark:text-gray-300 leading-relaxed border-t border-slate-100 dark:border-gray-800 pt-4">
                  {evalData.summary}
                </p>
              )}
            </Card>
          )}

          {/* 4. SWOT Analysis */}
          {evalData && Object.keys(swotData).length > 0 && (
            <Card>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-start">
                <SectionNumber n={sn()} />
                {t('businessPlan.sections.swot')}
              </h2>
              <SwotGrid swotData={swotData} />
            </Card>
          )}

          {/* 5. Financial Projections */}
          {finData && (
            <Card>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-start">
                <SectionNumber n={sn()} />
                {t('businessPlan.sections.financialProjections')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: t('businessPlan.sections.startingBudget'),  val: formatCurrency(finData.initialInvestment),  good: null },
                  { label: t('businessPlan.sections.monthlyIncome'),   val: formatCurrency(finData.monthlyRevenue),     good: true },
                  { label: t('businessPlan.sections.monthlyExpenses'), val: formatCurrency(finData.monthlyCosts),       good: false },
                  {
                    label: t('businessPlan.sections.breakEven'),
                    val: finData.breakEvenMonths > 0 && finData.breakEvenMonths < 9999
                      ? `${finData.breakEvenMonths} ${t('common.months')}`
                      : t('common.na'),
                    good: finData.breakEvenMonths > 0 && finData.breakEvenMonths <= 18,
                  },
                  finData.roiPercentage != null && {
                    label: t('businessPlan.sections.roi'),
                    val: `${finData.roiPercentage?.toFixed(1)}%`,
                    good: finData.roiPercentage > 0,
                  },
                ].filter(Boolean).map(({ label, val, good }) => (
                  <div key={label} className="bg-slate-50 dark:bg-gray-900/60 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mb-1">{label}</p>
                    <p className={`text-sm font-bold ${
                      good === true  ? 'text-emerald-600 dark:text-emerald-400' :
                      good === false ? 'text-red-500 dark:text-red-400' :
                      'text-slate-900 dark:text-white'
                    }`}>{val}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 6. Recommendations */}
          {evalData?.recommendations && (
            <Card className="!bg-primary-50 dark:!bg-primary-900/30 !border-primary-200 dark:!border-primary-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-start">
                <SectionNumber n={sn()} color="bg-primary-600" />
                {t('businessPlan.sections.whatNext')}
              </h2>
              <p className="text-sm text-primary-800 dark:text-primary-300 leading-relaxed">{evalData.recommendations}</p>
            </Card>
          )}

        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3 mt-8">
          <Button onClick={handleDownload} loading={downloading} className="flex-1" size="lg">
            {t('businessPlan.downloadPdf')}
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="flex-1" size="lg">
            {t('businessPlan.print')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BusinessPlan
