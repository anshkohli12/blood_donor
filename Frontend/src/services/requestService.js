import api from "./api"

export const requestService = {
  async createRequest(requestData) {
    const response = await api.post("/requests", requestData)
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
}
