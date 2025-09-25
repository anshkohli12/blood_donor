import api from "./api"

export const bloodBankService = {
  // Public methods - for users to find blood banks
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

  // Admin methods - for managing blood banks
  async createBloodBank(bloodBankData) {
    const response = await api.post('/blood-banks', bloodBankData)
    return response.data
  },

  async updateBloodBank(id, updateData) {
    const response = await api.put(`/blood-banks/${id}`, updateData)
    return response.data
  },

  async deleteBloodBank(id) {
    const response = await api.delete(`/blood-banks/${id}`)
    return response.data
  },

  // Blood bank staff methods
  async loginBloodBank(credentials) {
    const response = await api.post('/blood-banks/login', credentials)
    return response
  },

  async updateBloodStock(id, bloodType, quantity, operation = 'set') {
    const response = await api.put(`/blood-banks/${id}/stock`, {
      bloodType,
      quantity,
      operation
    })
    return response.data
  },

  async updateBulkBloodStock(id, stockUpdates) {
    const results = []
    for (const [bloodType, quantity] of Object.entries(stockUpdates)) {
      try {
        const result = await this.updateBloodStock(id, bloodType, quantity, 'set')
        results.push(result)
      } catch (error) {
        console.error(`Error updating ${bloodType}:`, error)
        throw error
      }
    }
    return results
  },

  async getBloodBankDashboard(id) {
    const response = await api.get(`/blood-banks/${id}/dashboard`)
    return response.data
  },

  async updateBloodBankProfile(id, formData) {
    const response = await api.put(`/blood-banks/${id}/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Utility methods
  getBloodTypes() {
    return ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  },

  getDefaultServices() {
    return [
      'Blood Collection',
      'Blood Testing',
      'Blood Storage',
      'Platelet Donation',
      'Plasma Collection',
      'Apheresis',
      'Mobile Blood Drives',
      'Emergency Blood Supply',
      'Rare Blood Types',
      'Cord Blood Banking',
      'Bone Marrow Registry',
      'Educational Programs',
      '24/7 Emergency Service'
    ]
  },

  getDefaultOperatingHours() {
    return {
      monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      saturday: { isOpen: false, openTime: '09:00', closeTime: '13:00' },
      sunday: { isOpen: false, openTime: '09:00', closeTime: '13:00' }
    }
  }
}
