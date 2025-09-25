"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  Settings,
  Bell,
  Key,
  LogOut,
  ArrowLeft,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import CustomButton from "../components/CustomButton"
import FormInput from "../components/FormInput"
import { useAuth } from "../hooks/useAuth"

const AdminProfile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/login')
      return
    }
  }, [user, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      setSuccessMessage('')

      // Here you would make an API call to update the profile
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccessMessage('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      setSuccessMessage('')

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setErrorMessage('New passwords do not match!')
        return
      }

      if (passwordData.newPassword.length < 8) {
        setErrorMessage('Password must be at least 8 characters long!')
        return
      }

      // Here you would make an API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccessMessage('Password changed successfully!')
      setShowPasswordChange(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      setErrorMessage('Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const adminStats = [
    {
      title: "Admin Since",
      value: "January 2024",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      title: "Role",
      value: "System Administrator",
      icon: Shield,
      color: "text-purple-600"
    },
    {
      title: "Last Login",
      value: "Today, 10:30 AM",
      icon: User,
      color: "text-green-600"
    },
    {
      title: "Security Level",
      value: "High",
      icon: Lock,
      color: "text-red-600"
    }
  ]

  const profileTabs = [
    {
      id: "profile",
      name: "Profile Information",
      icon: User
    },
    {
      id: "security",
      name: "Security Settings",
      icon: Lock
    },
    {
      id: "preferences",
      name: "Preferences",
      icon: Settings
    }
  ]

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Manage your personal details and contact information
              </CardDescription>
            </div>
            {!isEditing && (
              <CustomButton
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </CustomButton>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!isEditing}
              icon={User}
            />
            <FormInput
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!isEditing}
              icon={User}
            />
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={true} // Email should not be editable
              icon={Mail}
            />
            <FormInput
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              icon={Phone}
            />
            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              disabled={!isEditing}
              icon={MapPin}
            />
            <FormInput
              label="State"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              disabled={!isEditing}
              icon={MapPin}
            />
          </div>

          {isEditing && (
            <div className="flex items-center space-x-4 mt-6 pt-6 border-t">
              <CustomButton
                variant="primary"
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </CustomButton>
              <CustomButton
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    city: user?.city || '',
                    state: user?.state || ''
                  })
                }}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </CustomButton>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Admin Information</span>
          </CardTitle>
          <CardDescription>
            Your administrative account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminStats.map((stat, index) => (
              <div key={stat.title} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Password & Security</span>
          </CardTitle>
          <CardDescription>
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordChange ? (
            <div className="text-center py-8">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h3>
              <p className="text-gray-600 mb-4">Update your account password for better security</p>
              <CustomButton
                variant="primary"
                onClick={() => setShowPasswordChange(true)}
                className="flex items-center space-x-2"
              >
                <Key className="h-4 w-4" />
                <span>Change Password</span>
              </CustomButton>
            </div>
          ) : (
            <div className="space-y-4">
              <FormInput
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                icon={Lock}
                placeholder="Enter your current password"
              />
              <FormInput
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                icon={Lock}
                placeholder="Enter your new password"
              />
              <FormInput
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                icon={Lock}
                placeholder="Confirm your new password"
              />

              <div className="flex items-center space-x-4 pt-4">
                <CustomButton
                  variant="primary"
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Changing...' : 'Change Password'}</span>
                </CustomButton>
                <CustomButton
                  variant="outline"
                  onClick={() => {
                    setShowPasswordChange(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </CustomButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Options</span>
          </CardTitle>
          <CardDescription>
            Additional security settings for your admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <CustomButton variant="outline" size="sm">
                Enable
              </CustomButton>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Login Notifications</h4>
                <p className="text-sm text-gray-600">Get notified of new login attempts</p>
              </div>
              <CustomButton variant="outline" size="sm">
                Configure
              </CustomButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPreferencesTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Preferences</span>
        </CardTitle>
        <CardDescription>
          Customize your admin dashboard experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Preferences</h3>
          <p className="text-gray-600">Preference settings coming soon</p>
        </div>
      </CardContent>
    </Card>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileTab()
      case "security":
        return renderSecurityTab()
      case "preferences":
        return renderPreferencesTab()
      default:
        return renderProfileTab()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin-dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blood-crimson" />
                <span className="font-semibold text-gray-900">Admin Profile</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
          >
            {successMessage}
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
          >
            {errorMessage}
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-blood-crimson rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">System Administrator</span>
                  </div>
                </div>

                <nav className="space-y-2">
                  {profileTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-blood-crimson text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProfile