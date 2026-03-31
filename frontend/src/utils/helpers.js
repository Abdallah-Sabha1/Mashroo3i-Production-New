export const formatCurrency = (amount, lang = 'en') => {
  const locale = lang === 'ar' ? 'ar-JO' : 'en-JO'
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + (lang === 'ar' ? ' د.أ' : ' JOD')
}

export const formatDate = (dateString, lang = 'en') => {
  const locale = lang === 'ar' ? 'ar-JO' : 'en-US'
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const getScoreColor = (score) => {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

export const getScoreBg = (score) => {
  if (score >= 80) return 'bg-emerald-50'
  if (score >= 60) return 'bg-amber-50'
  return 'bg-red-50'
}

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Pass t() from useTranslation() for localized labels
export const getSectorLabel = (sectorValue, t) => {
  if (!t) {
    // Fallback English map for non-component contexts
    const map = {
      'food_and_beverage':      'Food & Beverage',
      'retail_ecommerce':       'Retail & E-commerce',
      'tech_and_software':      'Tech & Software',
      'education_and_training': 'Education & Training',
      'health_and_wellness':    'Health & Wellness',
      'professional_services':  'Professional Services',
      'other':                  'Other',
    }
    return map[sectorValue] || sectorValue
  }
  const keyMap = {
    'food_and_beverage':      'submitIdea.step0.sectors.food_and_beverage.label',
    'retail_ecommerce':       'submitIdea.step0.sectors.retail_ecommerce.label',
    'tech_and_software':      'submitIdea.step0.sectors.tech_and_software.label',
    'education_and_training': 'submitIdea.step0.sectors.education_and_training.label',
    'health_and_wellness':    'submitIdea.step0.sectors.health_and_wellness.label',
    'professional_services':  'submitIdea.step0.sectors.professional_services.label',
    'other':                  'submitIdea.step0.sectors.other.label',
  }
  return keyMap[sectorValue] ? t(keyMap[sectorValue]) : sectorValue
}

export const getRiskLabel = (riskLevel, t) => {
  if (!t) return riskLevel
  const keyMap = {
    'Low Risk':         'evaluation.riskLevels.low',
    'Medium-Low Risk':  'evaluation.riskLevels.mediumLow',
    'Medium Risk':      'evaluation.riskLevels.medium',
    'Medium-High Risk': 'evaluation.riskLevels.mediumHigh',
    'High Risk':        'evaluation.riskLevels.high',
  }
  return keyMap[riskLevel] ? t(keyMap[riskLevel]) : riskLevel
}

