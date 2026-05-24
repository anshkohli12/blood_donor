import api from "./api"

export const requestService = {
  async createRequest(requestData) {
    const response = await api.post("/requests", requestData)
    return response.data
  },

  // Create request with prescription file upload (multipart/form-data)
  async createRequestWithPrescription(formData) {
    const response = await api.post("/requests", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
  },

  async getAllRequests(filters = {}) {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/requests?${params}`)
    return response.data
  },

  async getRequestById(id) {
    const response = await api.get(`/requests/${id}`)
    return response.data
  },

  async updateRequest(id, data) {
    const response = await api.put(`/requests/${id}`, data)
    return response.data
  },

  async deleteRequest(id) {
    const response = await api.delete(`/requests/${id}`)
    return response.data
  },

  async respondToRequest(id, response) {
    const res = await api.post(`/requests/${id}/respond`, response)
    return res.data
  },

  async getMyRequests() {
    const response = await api.get("/requests/my-requests")
    return response.data
  },

  // Blood bank specific methods
  async getBloodBankRequests(filters = {}) {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/requests/blood-bank/requests?${params}`)
    return response.data
  },

  async getUrgentRequests() {
    const response = await api.get("/requests/blood-bank/urgent")
    return response.data
  },

  async updateRequestStatus(id, statusData) {
    const response = await api.put(`/requests/${id}/status`, statusData)
    return response.data
  },

  // Schedule a visit (blood bank)
  async scheduleVisit(id, scheduleData) {
    const response = await api.put(`/requests/${id}/schedule`, scheduleData)
    return response.data
  },
}
