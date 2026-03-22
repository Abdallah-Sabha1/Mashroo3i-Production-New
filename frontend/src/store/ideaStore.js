import { create } from 'zustand'

const useIdeaStore = create((set) => ({
  ideas: [],
  currentIdea: null,
  loading: false,
  error: null,

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
}))

export default useIdeaStore
