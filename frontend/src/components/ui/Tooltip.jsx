import { useState } from 'react'

/**
 * Tooltip — shows explanatory text on hover (desktop) or tap (mobile).
 * Usage: <Tooltip text="explanation">term</Tooltip>
 */
const Tooltip = ({ children, text }) => {
  const [visible, setVisible] = useState(false)

  return (
    <span className="relative inline-flex items-center gap-0.5">
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        className="cursor-help border-b border-dotted border-gray-400 dark:border-gray-500"
      >
        {children}
      </span>
      {visible && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 p-2.5 text-xs text-gray-50 bg-gray-900 dark:bg-gray-800 rounded-xl shadow-xl pointer-events-none leading-relaxed"
          role="tooltip"
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
        </span>
      )}
    </span>
  )
}

// Standard tooltip texts for financial terms
export const TOOLTIPS = {
  grossMargin:   "From every 10 JOD you earn, this is how much remains after paying the direct cost of your product or service",
  breakEven:     "The point where your income equals your total costs. After this point, you start making real profit.",
  ltv:           "Lifetime Value — the total amount a customer will pay you before they stop buying",
  cac:           "Customer Acquisition Cost — how much you spend to get one new customer",
  ltvCac:        "How much a customer is worth compared to what it costs to get them. Healthy is 3:1 or higher.",
  grossProfit:   "Revenue minus the direct cost of delivering your product or service — before fixed costs",
  monthlyChurn:  "The percentage of customers who stop buying each month",
  winRate:       "The percentage of potential B2B clients who agree to buy after you approach them",
  arr:           "Annual Recurring Revenue — the total yearly contract value from all your B2B clients",
  noveltyScore:  "How original is this idea compared to existing businesses in Amman?",
  marketPotential: "How large and accessible is the market for this idea in Amman?",
  overallScore:  "Our overall assessment of this idea's viability in the Amman market",
}

export default Tooltip
