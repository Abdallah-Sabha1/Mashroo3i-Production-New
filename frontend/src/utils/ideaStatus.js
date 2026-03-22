export const getIdeaStatus = (idea) => {
  if (idea.hasFinancialPlan) {
    return { 
      key: 'complete',
      label: 'Complete',
      color: 'green',
      description: 'Idea evaluation and financial plan done'
    }
  }
  if (idea.evaluation) {
    return { 
      key: 'evaluated',
      label: 'Evaluated',
      color: 'amber',
      description: 'AI evaluation completed'
    }
  }
  return { 
    key: 'submitted',
    label: 'Submitted',
    color: 'gray',
    description: 'Waiting for AI evaluation'
  }
}
