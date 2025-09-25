import api from "./api"

export const authService = {
  async login(email, password) {
    const response = await api.post("/auth/login", { email, password })
    return response.data
  },

  async register(userData) {
    const response = await api.post("/auth/register", userData)
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get("/auth/me")
    return response.data
  },

  async updateProfile(profileData) {
    const response = await api.put("/auth/profile", profileData)
    return response.data
  },

  async forgotPassword(email) {
    const response = await api.post("/auth/forgot-password", { email })
    return response.data
  },

  async resetPassword(token, password) {
    const response = await api.post("/auth/reset-password", { token, password })
    return response.data
  },

  // Admin only methods
  async getAllUsers() {
    const response = await api.get("/auth/users")
    return response.data
  },
}
