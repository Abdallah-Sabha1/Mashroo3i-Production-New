import { create } from 'zustand'

const INITIAL_WIZARD = {
  // Step 1
  title: '',
  description: '',
  sector: '',
  // Financial Projections wizard
  selectedIndustryType: '',
  selectedBusinessModel: '',
  // Step 2 — from AI
  problemStatement: '',
  uniqueSellingPoint: '',
  targetAudience: '',
  suggestedBusinessType: '',
  businessTypeReason: '',
  suggestedMonthlySalesRange: '',
  // Step 3 — user confirmed
  businessType: '',
  // Step 4
  customerDescription: '',
  decisionMaker: '',
  acquisitionChannel: '',
  estimatedMonthlySalesRange: '',
  targetClientsYear1Range: '',
  estimatedDealClosingMonths: '2',
  // Step 5
  plannedPrice: '',
  costToDeliver: '',
  hasPhysicalLocation: null,
  rent: '',
  hasEmployees: null,
  numEmployees: '',
  salaryPerEmployee: '',
  otherCosts: '',
  monthlyFixedCosts: 0,
  initialInvestment: '',
  ammanRegion: '',
}

const useIdeaStore = create((set) => ({
  ideas: [],
  currentIdea: null,
  loading: false,
  error: null,

  // Wizard state (persisted during session)
  wizard: { ...INITIAL_WIZARD },

  setIdeas: (ideas) => set({ ideas }),
  setCurrentIdea: (idea) => set({ currentIdea: idea }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addIdea: (idea) => set((state) => ({ ideas: [idea, ...state.ideas] })),
  updateIdea: (id, data) => set((state) => ({
    ideas: state.ideas.map(i => i.ideaId === id ? { ...i, ...data } : i)
  })),
  removeIdea: (id) => set((state) => ({
    ideas: state.ideas.filter(i => i.ideaId !== id)
  })),

  // Wizard actions
  setWizardField: (field, value) => set((state) => ({
    wizard: { ...state.wizard, [field]: value }
  })),
  setWizardFields: (fields) => set((state) => ({
    wizard: { ...state.wizard, ...fields }
  })),
  resetWizard: () => set({ wizard: { ...INITIAL_WIZARD } }),
}))

export default useIdeaStore
