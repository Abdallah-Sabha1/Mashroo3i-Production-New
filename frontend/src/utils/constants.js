export const SECTORS = [
  { value: 'food_and_beverage',      label: 'Food & Beverage',        icon: '🍕', desc: 'Restaurants, cafés, catering, food delivery' },
  { value: 'retail_ecommerce',       label: 'Retail & E-commerce',    icon: '🛍️', desc: 'Online or physical store, products, reselling' },
  { value: 'tech_and_software',      label: 'Tech & Software',        icon: '💻', desc: 'Apps, websites, digital tools, software' },
  { value: 'education_and_training', label: 'Education & Training',   icon: '📚', desc: 'Tutoring, courses, coaching, training' },
  { value: 'health_and_wellness',    label: 'Health & Wellness',      icon: '💪', desc: 'Gym, clinic, nutrition, beauty, personal care' },
  { value: 'professional_services',  label: 'Professional Services',  icon: '🔧', desc: 'Consulting, marketing, accounting, design, IT' },
  { value: 'other',                  label: 'Other',                  icon: '❓', desc: "My idea doesn't fit the categories above" },
]

export const AMMAN_REGIONS = [
  { value: 'west',    label: 'West Amman',    desc: 'Abdoun, Sweifieh, Shmeisani — premium customers, higher costs' },
  { value: 'central', label: 'Central Amman', desc: 'Downtown, Jabal Amman, Lweibdeh — mixed, medium pricing' },
  { value: 'east',    label: 'East Amman',    desc: 'Zarqa Road, Marka, Qweismeh — price-sensitive market, lower costs' },
]

export const ACQUISITION_CHANNELS = [
  { value: 'word_of_mouth',        label: 'Word of mouth / personal network', desc: 'Tell friends and family, ask for referrals' },
  { value: 'social_media_organic', label: 'Social media (organic)',            desc: 'Post on Instagram, TikTok — no paid ads' },
  { value: 'paid_ads',             label: 'Paid ads',                          desc: 'Run ads on Instagram, Google, or TikTok' },
  { value: 'partnerships',         label: 'Partnerships or referrals',         desc: 'Partner with other businesses' },
  { value: 'direct_sales',         label: 'Direct sales / cold outreach',      desc: 'Call or message potential clients directly (B2B)' },
  { value: 'seo',                  label: 'SEO / search engine',               desc: 'Get found on Google when people search' },
]

export const RISK_COLORS = {
  'Low Risk':         { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'success' },
  'Medium-Low Risk':  { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   badge: 'success' },
  'Medium Risk':      { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   badge: 'warning' },
  'Medium-High Risk': { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  badge: 'warning' },
  'High Risk':        { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     badge: 'danger'  },
}
