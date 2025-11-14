"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  Building2,
  Users,
  Droplets,
  TrendingUp,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  Plus,
  Minus,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Calendar,
  Activity
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import CustomButton from "../components/CustomButton"
import { bloodBankService } from "../services/bloodBankService"
import { eventService } from "../services/eventService"
import { requestService } from "../services/requestService"

const BloodBankDashboard = () => {
  const navigate = useNavigate()
  const [bloodBank, setBloodBank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingStock, setEditingStock] = useState(false)
  const [stockUpdates, setStockUpdates] = useState({})
  const [stockHistory, setStockHistory] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [urgentRequestsCount, setUrgentRequestsCount] = useState(0)
  const [stats, setStats] = useState({
    totalUnits: 0,
    lowStockTypes: 0,
    lastUpdate: null,
    todayUpdates: 0
  })

  // Valid blood types constant
  const validBloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

  useEffect(() => {
    const bloodbankToken = localStorage.getItem('bloodbankToken')
    if (!bloodbankToken) {
      navigate('/blood-bank-login')
      return
    }

    loadBloodBankData()
    loadStockHistory()
    loadMyEvents()
    loadUrgentRequests()
  }, [navigate])

  const loadUrgentRequests = async () => {
    try {
      const response = await requestService.getUrgentRequests()
      if (response.success) {
        setUrgentRequestsCount(response.data.length)
      }
    } catch (error) {
      console.error('Error loading urgent requests:', error)
    }
  }

  const loadBloodBankData = async () => {
    try {
      setLoading(true)
      const userData = JSON.parse(localStorage.getItem('bloodbank'))
      if (userData && userData.id) {
        const response = await bloodBankService.getBloodBankById(userData.id)
        setBloodBank(response.data)
        
        // Calculate stats
        const bloodStock = response.data.bloodStock || {}
        console.log('Blood stock data:', bloodStock)
        // Filter out non-numeric values (like _id fields) and sum only blood type quantities
        const totalUnits = validBloodTypes.reduce((sum, bloodType) => {
          const units = bloodStock[bloodType] || 0
          console.log(`${bloodType}: ${units} (type: ${typeof units})`)
          return sum + (typeof units === 'number' ? units : 0)
        }, 0)
        console.log('Total units calculated:', totalUnits)
        const lowStockTypes = validBloodTypes.filter(bloodType => {
          const units = bloodStock[bloodType] || 0
          return typeof units === 'number' && units < 10
        }).length
        
        setStats({
          totalUnits,
          lowStockTypes,
          lastUpdate: response.data.lastStockUpdate,
          todayUpdates: 0 // TODO: Calculate from stock history
        })

        // Initialize stock updates with valid blood types only
        const cleanStockUpdates = {}
        validBloodTypes.forEach(bloodType => {
          cleanStockUpdates[bloodType] = bloodStock[bloodType] || 0
        })
        setStockUpdates(cleanStockUpdates)
      }
    } catch (error) {
      console.error('Error loading blood bank data:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('bloodbankToken')
        localStorage.removeItem('bloodbank')
        navigate('/blood-bank-login')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadStockHistory = async () => {
    try {
      // TODO: Implement stock history API
      setStockHistory([])
    } catch (error) {
      console.error('Error loading stock history:', error)
    }
  }

  const loadMyEvents = async () => {
    try {
      setLoadingEvents(true)
      const response = await eventService.getMyEvents()
      
      if (response.success) {
        // Get only the latest 3 events
        setMyEvents(response.data.slice(0, 3))
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const handleStockUpdate = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('bloodbank'))
      await bloodBankService.updateBulkBloodStock(userData.id, stockUpdates)
      
      setEditingStock(false)
      await loadBloodBankData()
      alert('Blood stock updated successfully!')
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Error updating blood stock: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleStockChange = (bloodType, change) => {
    setStockUpdates(prev => ({
      ...prev,
      [bloodType]: Math.max(0, (prev[bloodType] || 0) + change)
    }))
  }

  const handleStockInput = (bloodType, value) => {
    setStockUpdates(prev => ({
      ...prev,
      [bloodType]: Math.max(0, parseInt(value) || 0)
    }))
  }

  const handleLogout = () => {
    localStorage.removeItem('bloodbankToken')
    localStorage.removeItem('bloodbank')
    navigate('/blood-bank-login')
  }

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      "O+": "bg-red-500",
      "O-": "bg-red-600", 
      "A+": "bg-blue-500",
      "A-": "bg-blue-600",
      "B+": "bg-green-500", 
      "B-": "bg-green-600",
      "AB+": "bg-purple-500",
      "AB-": "bg-purple-600"
    }
    return colors[bloodType] || "bg-gray-500"
  }

  const getStockStatus = (units) => {
    if (units === 0) return { text: 'Out of Stock', color: 'text-red-600' }
    if (units < 10) return { text: 'Low Stock', color: 'text-yellow-600' }
    if (units < 50) return { text: 'Moderate', color: 'text-blue-600' }
    return { text: 'Good Stock', color: 'text-green-600' }
  }

  const formatEventDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getEventStatus = (event) => {
    const now = new Date()
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    
    if (now < startDate) return { text: 'Upcoming', color: 'bg-blue-100 text-blue-700' }
    if (now >= startDate && now <= endDate) return { text: 'Ongoing', color: 'bg-green-100 text-green-700' }
    return { text: 'Completed', color: 'bg-gray-100 text-gray-700' }
  }

  const getApprovalStatus = (event) => {
    const statusMap = {
      'approved': { text: '✓ Approved', color: 'bg-green-100 text-green-800 border-green-200' },
      'pending': { text: '⏳ Pending Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'rejected': { text: '✗ Rejected', color: 'bg-red-100 text-red-800 border-red-200' }
    }
    return statusMap[event.status] || statusMap['pending']
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blood-crimson mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!bloodBank) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">Unable to load blood bank data.</p>
            <CustomButton variant="primary" onClick={() => navigate('/blood-bank-login')}>
              Back to Login
            </CustomButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center h-12 w-12 bg-blood-crimson rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{bloodBank.name}</h1>
                <p className="text-sm text-gray-600">Blood Bank Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {bloodBank.contactPerson?.name || 'Staff Member'}
                </p>
                <p className="text-sm text-gray-600">
                  {bloodBank.contactPerson?.designation || 'Blood Bank Staff'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <CustomButton
                    variant="primary"
                    onClick={() => navigate('/blood-bank-requests')}
                    className="text-sm flex items-center space-x-2"
                  >
                    <Activity className="h-4 w-4" />
                    <span>Blood Requests</span>
                  </CustomButton>
                  {urgentRequestsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {urgentRequestsCount}
                    </span>
                  )}
                </div>
                <CustomButton
                  variant="primary"
                  onClick={() => navigate('/create-event')}
                  className="text-sm flex items-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Create Event</span>
                </CustomButton>
                <CustomButton
                  variant="outline"
                  onClick={() => navigate('/blood-bank-profile')}
                  className="text-sm flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </CustomButton>
                <CustomButton
                  variant="outline"
                  onClick={handleLogout}
                  className="text-sm"
                >
                  Logout
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Blood Units</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUnits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock Types</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStockTypes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Updates</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayUpdates}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-sm font-bold text-gray-900">
                    {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blood Stock Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5" />
                  <span>Blood Stock Inventory</span>
                </CardTitle>
                <CardDescription>
                  Manage your blood bank's inventory levels
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {editingStock ? (
                  <>
                    <CustomButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingStock(false)
                        const validBloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
                        const cleanStockUpdates = {}
                        validBloodTypes.forEach(bloodType => {
                          cleanStockUpdates[bloodType] = bloodBank.bloodStock?.[bloodType] || 0
                        })
                        setStockUpdates(cleanStockUpdates)
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </CustomButton>
                    <CustomButton
                      variant="primary"
                      size="sm"
                      onClick={handleStockUpdate}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </CustomButton>
                  </>
                ) : (
                  <>
                    <CustomButton
                      variant="outline"
                      size="sm"
                      onClick={loadBloodBankData}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </CustomButton>
                    <CustomButton
                      variant="primary"
                      size="sm"
                      onClick={() => setEditingStock(true)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Update Stock
                    </CustomButton>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bloodType) => {
                const currentUnits = bloodBank.bloodStock?.[bloodType] || 0
                const status = getStockStatus(currentUnits)
                const updatedUnits = stockUpdates[bloodType] || 0
                return (
                  <motion.div
                    key={bloodType}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`${getBloodTypeColor(bloodType)} text-white rounded-xl p-6 mb-3`}>
                      <div className="font-bold text-2xl mb-2">{bloodType}</div>
                      {editingStock ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleStockChange(bloodType, -1)}
                              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-1"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              value={updatedUnits}
                              onChange={(e) => handleStockInput(bloodType, e.target.value)}
                              className="w-16 px-2 py-1 text-center text-black rounded text-sm"
                              min="0"
                            />
                            <button
                              onClick={() => handleStockChange(bloodType, 1)}
                              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-1"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-sm opacity-90">
                            {updatedUnits !== currentUnits && (
                              <span className="text-yellow-200">
                                (was {currentUnits})
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-lg font-semibold">{currentUnits} units</div>
                      )}
                    </div>
                    <div className={`text-sm font-medium ${status.color}`}>
                      {status.text}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {editingStock && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Quick Stock Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const updates = { ...stockUpdates }
                      Object.keys(updates).forEach(type => {
                        updates[type] = updates[type] + 10
                      })
                      setStockUpdates(updates)
                    }}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm"
                  >
                    +10 to All
                  </button>
                  <button
                    onClick={() => {
                      const updates = { ...stockUpdates }
                      Object.keys(updates).forEach(type => {
                        updates[type] = Math.max(0, updates[type] - 10)
                      })
                      setStockUpdates(updates)
                    }}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm"
                  >
                    -10 from All
                  </button>
                  <button
                    onClick={() => setStockUpdates(bloodBank.bloodStock || {})}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-sm"
                  >
                    Reset Changes
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Events Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>My Events</span>
                </CardTitle>
                <CardDescription>
                  Events you have created and their registrations
                </CardDescription>
              </div>
              <CustomButton
                variant="outline"
                size="sm"
                onClick={() => navigate('/events')}
              >
                <Eye className="h-4 w-4 mr-1" />
                View All Events
              </CustomButton>
            </div>
          </CardHeader>
          <CardContent>
            {loadingEvents ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-crimson mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading events...</p>
              </div>
            ) : myEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No events created yet</p>
                <CustomButton
                  variant="primary"
                  onClick={() => navigate('/create-event')}
                >
                  Create Your First Event
                </CustomButton>
              </div>
            ) : (
              <div className="space-y-4">
                {myEvents.map((event) => {
                  const status = getEventStatus(event)
                  const approvalStatus = getApprovalStatus(event)
                  const registeredCount = event.registrations?.length || 0
                  const capacityPercent = (registeredCount / event.maxCapacity) * 100
                  
                  return (
                    <motion.div
                      key={event._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {event.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${approvalStatus.color}`}>
                              {approvalStatus.text}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {event.description?.slice(0, 100)}{event.description?.length > 100 ? '...' : ''}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatEventDate(event.startDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location.city}, {event.location.state}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Registrations</span>
                            <span className="font-medium">
                              {registeredCount} / {event.maxCapacity}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                capacityPercent >= 90 ? 'bg-red-500' :
                                capacityPercent >= 70 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                        <CustomButton
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/events/${event._id}/registrations`)}
                          className="flex items-center gap-2"
                        >
                          <Users className="h-4 w-4" />
                          View Registrations
                        </CustomButton>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blood Bank Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Contact & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blood-crimson" />
                <span>Location & Contact</span>
              </CardTitle>
              <CardDescription>
                How to reach and visit us
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg flex-shrink-0">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Address</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {bloodBank.address?.street || 'N/A'}<br />
                    {bloodBank.address?.city}, {bloodBank.address?.state} {bloodBank.address?.zipCode}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg flex-shrink-0">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Phone</p>
                  <a 
                    href={`tel:${bloodBank.contact?.phone}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {bloodBank.contact?.phone || 'N/A'}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg flex-shrink-0">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Email</p>
                  <a 
                    href={`mailto:${bloodBank.email}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    {bloodBank.email || 'N/A'}
                  </a>
                </div>
              </div>

              {bloodBank.contact?.website && (
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg flex-shrink-0">
                    <Eye className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">Website</p>
                    <a 
                      href={bloodBank.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {bloodBank.contact.website}
                    </a>
                  </div>
                </div>
              )}

              {bloodBank.contactPerson && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="font-semibold text-gray-900 mb-2">Contact Person</p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900">
                      {bloodBank.contactPerson.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bloodBank.contactPerson.designation || 'Staff Member'}
                    </p>
                    {bloodBank.contactPerson.phone && (
                      <p className="text-sm text-gray-600">
                        📱 {bloodBank.contactPerson.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operating Hours & Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blood-crimson" />
                <span>Operating Hours & Services</span>
              </CardTitle>
              <CardDescription>
                Our availability and services offered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Operating Hours
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    {bloodBank.operatingHoursDisplay || bloodBank.operatingHours || 'Not specified'}
                  </p>
                </div>
              </div>

              {bloodBank.services && bloodBank.services.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    Services Offered
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {bloodBank.services.map(service => (
                      <span
                        key={service}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {bloodBank.specialServices && (
                <div>
                  <p className="font-semibold text-gray-900 mb-3">Special Services</p>
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{bloodBank.specialServices}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  License Information
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">License #:</span>{' '}
                    {bloodBank.licenseNumber || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {bloodBank.isVerified ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      ⏳ Pending Verification
                    </span>
                  )}
                  {bloodBank.isActive ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      ● Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                      ● Inactive
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <CustomButton
                variant="primary"
                className="flex items-center justify-center space-x-2 h-16"
                onClick={() => navigate('/create-event')}
              >
                <Calendar className="h-5 w-5" />
                <span>Create Event</span>
              </CustomButton>

              <CustomButton
                variant="outline"
                className="flex items-center justify-center space-x-2 h-16"
                onClick={() => {/* TODO: Download stock report */}}
              >
                <Download className="h-5 w-5" />
                <span>Download Stock Report</span>
              </CustomButton>
              
              <CustomButton
                variant="outline"
                className="flex items-center justify-center space-x-2 h-16"
                onClick={() => {/* TODO: View requests */}}
              >
                <Users className="h-5 w-5" />
                <span>View Blood Requests</span>
              </CustomButton>
              
              <CustomButton
                variant="outline"
                className="flex items-center justify-center space-x-2 h-16"
                onClick={() => {/* TODO: Contact admin */}}
              >
                <Mail className="h-5 w-5" />
                <span>Contact Administrator</span>
              </CustomButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BloodBankDashboard