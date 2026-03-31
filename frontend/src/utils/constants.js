export const SECTORS = [
  { value: 'food_and_beverage',      labelKey: 'submitIdea.step0.sectors.food_and_beverage.label' },
  { value: 'retail_ecommerce',       labelKey: 'submitIdea.step0.sectors.retail_ecommerce.label' },
  { value: 'tech_and_software',      labelKey: 'submitIdea.step0.sectors.tech_and_software.label' },
  { value: 'education_and_training', labelKey: 'submitIdea.step0.sectors.education_and_training.label' },
  { value: 'health_and_wellness',    labelKey: 'submitIdea.step0.sectors.health_and_wellness.label' },
  { value: 'professional_services',  labelKey: 'submitIdea.step0.sectors.professional_services.label' },
  { value: 'other',                  labelKey: 'submitIdea.step0.sectors.other.label' },
]

export const getSectorLabel = (value, t) => {
  const s = SECTORS.find(s => s.value === value)
  return s && t ? t(s.labelKey) : value
}

export const AMMAN_REGIONS = [
  { value: 'west',    labelKey: 'submitIdea.step2.regions.west.label',    descKey: 'submitIdea.step2.regions.west.sub' },
  { value: 'central', labelKey: 'submitIdea.step2.regions.central.label', descKey: 'submitIdea.step2.regions.central.sub' },
  { value: 'east',    labelKey: 'submitIdea.step2.regions.east.label',    descKey: 'submitIdea.step2.regions.east.sub' },
]

export const ACQUISITION_CHANNELS = [
  { value: 'word_of_mouth',        label: 'Word of mouth / personal network' },
  { value: 'social_media_organic', label: 'Social media (organic)' },
  { value: 'paid_ads',             label: 'Paid ads' },
  { value: 'partnerships',         label: 'Partnerships or referrals' },
  { value: 'direct_sales',         label: 'Direct sales / cold outreach' },
  { value: 'seo',                  label: 'SEO / search engine' },
]

export const RISK_LEVELS = {
  'Low Risk':         { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', labelKey: 'evaluation.riskLevels.low' },
  'Medium-Low Risk':  { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   labelKey: 'evaluation.riskLevels.mediumLow' },
  'Medium Risk':      { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   labelKey: 'evaluation.riskLevels.medium' },
  'Medium-High Risk': { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  labelKey: 'evaluation.riskLevels.mediumHigh' },
  'High Risk':        { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     labelKey: 'evaluation.riskLevels.high' },
}
