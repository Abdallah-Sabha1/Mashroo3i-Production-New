import api from './api'

export const financialProjection = {
  /** GET /api/benchmarks/industries — grouped list */
  getBenchmarks: () => api.get('/benchmarks/industries'),

  /** GET /api/financial-projections/benchmarks?industryType=&businessModel= */
  getBenchmark: (industryType, businessModel) =>
    api.get('/financial-projections/benchmarks', { params: { industryType, businessModel } }),

  /** POST /api/financial-projections/{ideaId}/create */
  createProjection: (ideaId, data) =>
    api.post(`/financial-projections/${ideaId}/create`, data),

  /** GET /api/financial-projections/{ideaId} */
  getProjection: (ideaId) => api.get(`/financial-projections/${ideaId}`),

  /** PUT /api/financial-projections/{ideaId}/update */
  updateProjection: (ideaId, data) =>
    api.put(`/financial-projections/${ideaId}/update`, data),

  /** DELETE /api/financial-projections/{ideaId} */
  deleteProjection: (ideaId) => api.delete(`/financial-projections/${ideaId}`),
}

export default financialProjection
