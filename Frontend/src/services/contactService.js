import api from "./api"

export const contactService = {
  // Submit contact form (public)
  async submitContactForm(contactData) {
    const response = await api.post("/contact/submit", contactData)
    return response.data
  },

  // Admin methods
  async getMessages(params = {}) {
    const response = await api.get("/contact/messages", { params })
    return response.data
  },

  async getAllMessages(params = {}) {
    const response = await api.get("/contact/messages", { params })
    return response.data
  },

  async updateMessageStatus(id, status) {
    const response = await api.put(`/contact/messages/${id}/status`, { status })
    return response.data
  },

  async getMessage(id) {
    const response = await api.get(`/contact/messages/${id}`)
    return response.data
  },

  async updateMessage(id, updateData) {
    const response = await api.put(`/contact/messages/${id}`, updateData)
    return response.data
  },

  async markAsRead(id) {
    const response = await api.put(`/contact/messages/${id}/read`)
    return response.data
  },

  async addNote(id, note) {
    const response = await api.post(`/contact/messages/${id}/notes`, { note })
    return response.data
  },

  async deleteMessage(id) {
    const response = await api.delete(`/contact/messages/${id}`)
    return response.data
  },

  async sendResponse(id, message) {
    const response = await api.post(`/contact/messages/${id}/response`, { message })
    return response.data
  },

  async getMyMessages(email) {
    const response = await api.get(`/contact/my-messages/${email}`)
    return response.data
  },
}