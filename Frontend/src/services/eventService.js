import api from "./api"

export const eventService = {
  async getAllEvents(filters = {}) {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/events?${params}`)
    return response.data
  },

  async getEventById(id) {
    const response = await api.get(`/events/${id}`)
    return response.data
  },

  async registerForEvent(eventId) {
    const response = await api.post(`/events/${eventId}/register`)
    return response.data
  },

  async unregisterFromEvent(eventId) {
    const response = await api.delete(`/events/${eventId}/register`)
    return response.data
  },

  async getMyEvents() {
    const response = await api.get("/events/my-events")
    return response.data
  },

  async createEvent(eventData) {
    const response = await api.post("/events", eventData)
    return response.data
  },
}
