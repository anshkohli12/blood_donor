"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import {
  User,
  Droplets,
  Calendar,
  Heart,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  Plus,
  Activity,
  Target,
  Users,
  AlertCircle,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react"
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/Chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Progress } from "../components/ui/Progress"
import CustomButton from "../components/CustomButton"
import FormInput from "../components/FormInput"
import { useAuth } from "../hooks/useAuth"
import { authService } from "../services/authService"

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [updateLoading, setUpdateLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Mock data for demonstration
  const mockStats = {
    totalDonations: 12,
    totalRequests: 3,
    eventsAttended: 8,
    livesImpacted: 36,
    donationGoal: 15,
    nextEligibleDate: "2024-03-15",
    bloodType: "O+",
    donationHistory: [
      { month: "Jan", donations: 1, requests: 0 },
      { month: "Feb", donations: 2, requests: 1 },
      { month: "Mar", donations: 1, requests: 0 },
      { month: "Apr", donations: 3, requests: 1 },
      { month: "May", donations: 2, requests: 0 },
      { month: "Jun", donations: 3, requests: 1 },
    ],
    bloodTypeDistribution: [
      { name: "O+", value: 35, color: "#ef4444" },
      { name: "A+", value: 25, color: "#3b82f6" },
      { name: "B+", value: 20, color: "#10b981" },
      { name: "AB+", value: 10, color: "#8b5cf6" },
      { name: "O-", value: 6, color: "#dc2626" },
      { name: "A-", value: 3, color: "#2563eb" },
      { name: "B-", value: 1, color: "#059669" },
    ],
    monthlyActivity: [
      { month: "Jan", donations: 45, requests: 12, events: 3 },
      { month: "Feb", donations: 52, requests: 18, events: 4 },
      { month: "Mar", donations: 38, requests: 8, events: 2 },
      { month: "Apr", donations: 61, requests: 22, events: 5 },
      { month: "May", donations: 55, requests: 15, events: 3 },
      { month: "Jun", donations: 67, requests: 28, events: 6 },
    ],
  }

  const mockRecentActivity = [
    {
      id: 1,
      type: "donation",
      title: "Blood Donation at City Hospital",
      date: "2024-01-15",
      status: "completed",
      icon: Droplets,
      color: "text-red-600",
    },
    {
      id: 2,
      type: "event",
      title: "Registered for Community Blood Drive",
      date: "2024-01-10",
      status: "upcoming",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      id: 3,
      type: "request",
      title: "Blood Request for Emergency Surgery",
      date: "2024-01-08",
      status: "fulfilled",
      icon: Heart,
      color: "text-green-600",
    },
  ]

  const mockUpcomingEvents = [
    {
      id: 1,
      title: "Downtown Blood Drive",
      date: "2024-02-15",
      location: "Community Center",
      registered: true,
    },
    {
      id: 2,
      title: "University Health Fair",
      date: "2024-02-20",
      location: "University Campus",
      registered: false,
    },
  ]

  const mockMyRequests = [
    {
      id: 1,
      bloodType: "O+",
      status: "active",
      createdDate: "2024-01-12",
      urgency: "high",
      responses: 5,
    },
    {
      id: 2,
      bloodType: "A+",
      status: "fulfilled",
      createdDate: "2024-01-05",
      urgency: "medium",
      responses: 12,
    },
  ]

  useEffect(() => {
    gsap.fromTo(".dashboard-header", { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
    gsap.fromTo(
      ".dashboard-content",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" },
    )

    // Simulate API calls
    setTimeout(() => {
      setStats(mockStats)
      setRecentActivity(mockRecentActivity)
      setUpcomingEvents(mockUpcomingEvents)
      setMyRequests(mockMyRequests)
      setLoading(false)
    }, 1000)
  }, [])

  const getProgressPercentage = () => {
    if (!stats) return 0
    return Math.min((stats.totalDonations / stats.donationGoal) * 100, 100)
  }

  const getNextEligibilityDays = () => {
    if (!stats?.nextEligibleDate) return 0
    const today = new Date()
    const eligibleDate = new Date(stats.nextEligibleDate)
    const diffTime = eligibleDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(diffDays, 0)
  }

  // Edit Profile Functions
  const handleEditClick = () => {
    setIsEditing(true)
    setEditFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
      state: user?.state || '',
      bloodType: user?.bloodType || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    })
    setFormErrors({})
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditFormData({})
    setFormErrors({})
  }

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!editFormData.firstName?.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!editFormData.lastName?.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!editFormData.email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      errors.email = 'Email is invalid'
    }
    if (!editFormData.phone?.trim()) {
      errors.phone = 'Phone number is required'
    }
    if (!editFormData.city?.trim()) {
      errors.city = 'City is required'
    }
    if (!editFormData.state?.trim()) {
      errors.state = 'State is required'
    }
    if (!editFormData.bloodType) {
      errors.bloodType = 'Blood type is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return
    }

    setUpdateLoading(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      // Make API call to update user profile
      const response = await authService.updateProfile(editFormData)
      
      if (response.success) {
        setSuccessMessage('Profile updated successfully!')
        setIsEditing(false)
        
        // Clear the success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('')
        }, 3000)
        
        // Optionally refresh the page or update user state
        window.location.reload() // Simple solution to refresh user data
      } else {
        throw new Error(response.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrorMessage(`Failed to update profile: ${error.message || 'Please try again.'}`)
      
      // Clear the error message after 5 seconds
      setTimeout(() => {
        setErrorMessage('')
      }, 5000)
    } finally {
      setUpdateLoading(false)
    }
  }

  const chartConfig = {
    donations: {
      label: "Donations",
      color: "#ef4444",
    },
    requests: {
      label: "Requests",
      color: "#3b82f6",
    },
    events: {
      label: "Events",
      color: "#10b981",
    },
  }

  if (loading) {
    return (
      <div className="pt-32 section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg animate-pulse">
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-32 section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="dashboard-header mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold font-montserrat text-gradient mb-2"
              >
                Welcome back, {user?.firstName || "Donor"}!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600"
              >
                Track your donations, requests, and impact on the community.
              </motion.p>
            </div>

            <div className="mt-4 md:mt-0 flex space-x-3">
              <CustomButton variant="outline" icon={Edit} onClick={() => alert("Edit profile functionality")}>
                Edit Profile
              </CustomButton>
              <CustomButton variant="primary" icon={Plus} onClick={() => alert("Quick action menu")}>
                Quick Actions
              </CustomButton>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-100">Total Donations</CardTitle>
                <div className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5" />
                  <span className="text-3xl font-bold">{stats.totalDonations}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-red-100">{stats.livesImpacted} lives potentially saved</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Blood Requests</CardTitle>
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span className="text-3xl font-bold">{stats.totalRequests}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-blue-100">
                  {myRequests.filter((r) => r.status === "active").length} active requests
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-100">Events Attended</CardTitle>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-3xl font-bold">{stats.eventsAttended}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-green-100">
                  {upcomingEvents.filter((e) => e.registered).length} upcoming events
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">Next Donation</CardTitle>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span className="text-3xl font-bold">{getNextEligibilityDays()}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-purple-100">
                  {getNextEligibilityDays() === 0 ? "Eligible now!" : "days until eligible"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="dashboard-content grid lg:grid-cols-3 gap-8">
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Donation Progress */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blood-crimson" />
                    <span>Annual Donation Goal</span>
                  </CardTitle>
                  <CardDescription>
                    {stats.totalDonations} of {stats.donationGoal} donations completed this year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={getProgressPercentage()} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{stats.totalDonations} donations</span>
                      <span>{Math.round(getProgressPercentage())}% complete</span>
                      <span>Goal: {stats.donationGoal}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Activity Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blood-crimson" />
                    <span>Monthly Activity</span>
                  </CardTitle>
                  <CardDescription>Your donation and request activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <LineChart data={stats.monthlyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="donations"
                        stroke="var(--color-donations)"
                        strokeWidth={3}
                        dot={{ fill: "var(--color-donations)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="requests"
                        stroke="var(--color-requests)"
                        strokeWidth={3}
                        dot={{ fill: "var(--color-requests)" }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Community Impact Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blood-crimson" />
                    <span>Community Blood Type Distribution</span>
                  </CardTitle>
                  <CardDescription>Blood type needs in your area</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <PieChart>
                      <Pie
                        data={stats.bloodTypeDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {stats.bloodTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Detailed User Profile Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-blood-crimson" />
                      <span>Personal Information</span>
                    </CardTitle>
                    {!isEditing ? (
                      <CustomButton
                        variant="outline"
                        size="sm"
                        icon={Edit}
                        onClick={handleEditClick}
                      >
                        Edit Profile
                      </CustomButton>
                    ) : (
                      <div className="flex space-x-2">
                        <CustomButton
                          variant="outline"
                          size="sm"
                          icon={X}
                          onClick={handleCancelEdit}
                          disabled={updateLoading}
                        >
                          Cancel
                        </CustomButton>
                        <CustomButton
                          variant="primary"
                          size="sm"
                          icon={Save}
                          onClick={handleSaveProfile}
                          loading={updateLoading}
                        >
                          Save Changes
                        </CustomButton>
                      </div>
                    )}
                  </div>
                  <CardDescription>
                    {isEditing ? "Update your personal information below" : "View and manage your profile details"}
                  </CardDescription>
                </CardHeader>
                
                {/* Success Message */}
                {successMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-6 mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {successMessage}
                    </div>
                  </motion.div>
                )}
                
                {/* Error Message */}
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-6 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {errorMessage}
                    </div>
                  </motion.div>
                )}
                
                <CardContent>
                  {!isEditing ? (
                    // View Mode
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Full Name</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email Address</label>
                          <p className="text-lg text-gray-900">{user?.email}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone Number</label>
                          <p className="text-lg text-gray-900">{user?.phone || 'Not provided'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Blood Type</label>
                          <p className="text-lg font-semibold text-blood-crimson">{user?.bloodType}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Location</label>
                          <p className="text-lg text-gray-900">
                            {user?.city}, {user?.state}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                          <p className="text-lg text-gray-900">
                            {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Member Since</label>
                          <p className="text-lg text-gray-900">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Account Status</label>
                          <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            {user?.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          label="First Name"
                          icon={User}
                          value={editFormData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          error={formErrors.firstName}
                          required
                          placeholder="Enter your first name"
                        />
                        
                        <FormInput
                          label="Last Name"
                          icon={User}
                          value={editFormData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          error={formErrors.lastName}
                          required
                          placeholder="Enter your last name"
                        />
                      </div>
                      
                      <FormInput
                        label="Email Address"
                        type="email"
                        icon={Mail}
                        value={editFormData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        error={formErrors.email}
                        required
                        placeholder="Enter your email address"
                      />
                      
                      <FormInput
                        label="Phone Number"
                        type="tel"
                        icon={Phone}
                        value={editFormData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        error={formErrors.phone}
                        required
                        placeholder="Enter your phone number"
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          label="City"
                          icon={MapPin}
                          value={editFormData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          error={formErrors.city}
                          required
                          placeholder="Enter your city"
                        />
                        
                        <FormInput
                          label="State"
                          icon={MapPin}
                          value={editFormData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          error={formErrors.state}
                          required
                          placeholder="Enter your state"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Blood Type <span className="text-blood-crimson ml-1">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Droplets className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            value={editFormData.bloodType}
                            onChange={(e) => handleInputChange('bloodType', e.target.value)}
                            className={`
                              block w-full rounded-lg border-gray-300 shadow-sm
                              focus:border-blood-crimson focus:ring-blood-crimson
                              pl-10 pr-3 py-3
                              ${formErrors.bloodType ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                              transition-colors duration-200
                            `}
                          >
                            <option value="">Select blood type</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>
                        {formErrors.bloodType && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="text-sm text-red-600"
                          >
                            {formErrors.bloodType}
                          </motion.p>
                        )}
                      </div>
                      
                      <FormInput
                        label="Date of Birth"
                        type="date"
                        icon={Calendar}
                        value={editFormData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        error={formErrors.dateOfBirth}
                        placeholder="Select your date of birth"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Activity and Quick Actions */}
          <div className="space-y-8">
            {/* User Profile Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blood-crimson" />
                    <span>Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={user?.avatar || "/placeholder.svg?height=60&width=60"}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="w-15 h-15 rounded-full object-cover border-4 border-blood-crimson flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3 className="font-bold text-lg truncate">{user?.firstName} {user?.lastName}</h3>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{user?.phone || "Not provided"}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {user?.city}, {user?.state}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Droplets className="h-4 w-4" />
                      <span>Blood Type: {user?.bloodType}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Donor Status</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        Active
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blood-crimson" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const IconComponent = activity.icon
                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.date).toLocaleDateString()} • {activity.status}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blood-crimson" />
                    <span>Upcoming Events</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          {event.registered && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              Registered
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* My Requests */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-blood-crimson" />
                    <span>My Requests</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myRequests.map((request) => (
                      <div key={request.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{request.bloodType} Blood</span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              request.status === "active" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Created: {new Date(request.createdDate).toLocaleDateString()}</div>
                          <div>Responses: {request.responses}</div>
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="h-3 w-3" />
                            <span className="capitalize">{request.urgency} priority</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
