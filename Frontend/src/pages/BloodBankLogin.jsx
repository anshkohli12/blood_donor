"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate, Link } from "react-router-dom"
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import CustomButton from "../components/CustomButton"
import FormInput from "../components/FormInput"
import { bloodBankService } from "../services/bloodBankService"

const BloodBankLogin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await bloodBankService.loginBloodBank(formData)
      
      if (response.data.token) {
        // Store blood bank token
        localStorage.setItem('bloodbankToken', response.data.token)
        
        // Store blood bank data
        localStorage.setItem('bloodbank', JSON.stringify({
          id: response.data.data.id,
          name: response.data.data.name,
          email: response.data.data.email,
          contact: response.data.data.contact,
          address: response.data.data.address
        }))
        
        // Redirect to blood bank dashboard
        navigate('/blood-bank-dashboard')
      }
    } catch (error) {
      console.error('Blood bank login error:', error)
      setError(
        error.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blood-crimson/10 via-white to-blood-crimson/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blood-crimson rounded-full mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Blood Bank Portal</h1>
            <p className="text-gray-600">Sign in to manage your blood bank inventory</p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your blood bank credentials to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blood-crimson focus:border-transparent"
                      placeholder="your-bloodbank@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blood-crimson focus:border-transparent"
                      placeholder="Enter your password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <CustomButton
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </CustomButton>
              </form>
            </CardContent>
          </Card>

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <span>Don't have blood bank credentials?</span>
              <Link 
                to="/contact" 
                className="text-blood-crimson hover:text-blood-crimson/80 font-medium"
              >
                Contact Admin
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <span>Are you a regular user?</span>
              <Link 
                to="/login" 
                className="text-blood-crimson hover:text-blood-crimson/80 font-medium"
              >
                User Login
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <span>Need help?</span>
              <Link 
                to="/contact" 
                className="text-blood-crimson hover:text-blood-crimson/80 font-medium"
              >
                Support
              </Link>
            </div>
          </div>

          {/* Features Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 bg-white rounded-lg p-6 shadow-sm border"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Blood Bank Dashboard Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blood-crimson rounded-full"></div>
                <span>Real-time blood inventory management</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blood-crimson rounded-full"></div>
                <span>Stock level monitoring and alerts</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blood-crimson rounded-full"></div>
                <span>Blood requests and donor coordination</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blood-crimson rounded-full"></div>
                <span>Inventory reports and analytics</span>
              </li>
            </ul>
          </motion.div>

          {/* Security Notice */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Security Notice</p>
                <p>
                  This portal is exclusively for authorized blood bank staff. 
                  All activities are logged and monitored for security purposes.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BloodBankLogin