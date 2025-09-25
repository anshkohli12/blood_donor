import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check for regular user token
    let token = localStorage.getItem("token")
    
    // Check for blood bank user token
    if (!token) {
      const bloodBankUser = localStorage.getItem("bloodBankUser")
      if (bloodBankUser) {
        try {
          const userData = JSON.parse(bloodBankUser)
          token = userData.token
        } catch (e) {
          console.error("Error parsing bloodBankUser data:", e)
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api
