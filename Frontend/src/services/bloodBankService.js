import api from "./api"

export const bloodBankService = {
  async getAllBloodBanks(filters = {}) {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/blood-banks?${params}`)
    return response.data
  },

  async getBloodBankById(id) {
    const response = await api.get(`/blood-banks/${id}`)
    return response.data
  },

  async getBloodStock(id) {
    const response = await api.get(`/blood-banks/${id}/stock`)
    return response.data
  },

  async searchBloodBanks(query) {
    const response = await api.get(`/blood-banks/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  async getNearbyBloodBanks(lat, lng, radius = 50) {
    const response = await api.get(`/blood-banks/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)
    return response.data
  },
}
