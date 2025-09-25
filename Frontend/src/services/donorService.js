import api from "./api"

export const donorService = {
  async getAllDonors(filters = {}) {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/donors?${params}`)
    return response.data
  },

  async getDonorById(id) {
    const response = await api.get(`/donors/${id}`)
    return response.data
  },

  async updateDonorProfile(id, data) {
    const response = await api.put(`/donors/${id}`, data)
    return response.data
  },

  async updateAvailability(id, isAvailable) {
    const response = await api.patch(`/donors/${id}/availability`, { isAvailable })
    return response.data
  },

  async getDonorStats(id) {
    const response = await api.get(`/donors/${id}/stats`)
    return response.data
  },

  async searchDonors(query) {
    const response = await api.get(`/donors/search?q=${encodeURIComponent(query)}`)
    return response.data
  },
}
