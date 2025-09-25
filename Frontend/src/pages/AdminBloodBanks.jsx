"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate, Link } from "react-router-dom"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Droplets,
  Building2,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  ArrowLeft
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import CustomButton from "../components/CustomButton"
import { useAuth } from "../hooks/useAuth"
import { bloodBankService } from "../services/bloodBankService"

const AdminBloodBanks = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bloodBanks, setBloodBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedBloodBank, setSelectedBloodBank] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login')
      return
    }
    loadBloodBanks()
  }, [user, navigate])

  const loadBloodBanks = async () => {
    try {
      setLoading(true)
      const response = await bloodBankService.getAllBloodBanks()
      if (response.success) {
        setBloodBanks(response.data || [])
      }
    } catch (error) {
      console.error('Error loading blood banks:', error)
      setBloodBanks([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBloodBank = async (id) => {
    if (window.confirm('Are you sure you want to delete this blood bank?')) {
      try {
        await bloodBankService.deleteBloodBank(id)
        loadBloodBanks()
      } catch (error) {
        console.error('Error deleting blood bank:', error)
        alert('Error deleting blood bank')
      }
    }
  }

  const filteredBloodBanks = bloodBanks.filter(bank => {
    const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bank.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && bank.isActive) ||
                         (filterStatus === "inactive" && !bank.isActive)
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: bloodBanks.length,
    active: bloodBanks.filter(b => b.isActive).length,
    inactive: bloodBanks.filter(b => !b.isActive).length,
    pending: bloodBanks.filter(b => !b.isVerified).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blood-crimson mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blood banks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin/dashboard" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-blood-crimson" />
                <h1 className="text-xl font-bold text-gray-900">Blood Bank Management</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Banks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Blood Banks Directory</CardTitle>
                <CardDescription>
                  Manage blood bank registrations and credentials
                </CardDescription>
              </div>
              <CustomButton
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Blood Bank</span>
              </CustomButton>
            </div>
          </CardHeader>

          <CardContent>
            {/* Search and Filter */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search blood banks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blood-crimson"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blood-crimson"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <CustomButton variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </CustomButton>
            </div>

            {/* Blood Banks List */}
            {filteredBloodBanks.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Blood Banks Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No blood banks match your search criteria.' : 'No blood banks registered yet.'}
                </p>
                <CustomButton onClick={() => setShowCreateModal(true)}>
                  Create First Blood Bank
                </CustomButton>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blood Bank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBloodBanks.map((bank) => (
                      <tr key={bank._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blood-crimson flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{bank.name}</div>
                              <div className="text-sm text-gray-500">{bank.username || 'No username'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{bank.email}</div>
                          <div className="text-sm text-gray-500">{bank.contact?.phone || 'No phone'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bank.address?.city && bank.address?.state
                            ? `${bank.address.city}, ${bank.address.state}`
                            : 'Location not set'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bank.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {bank.isActive ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(bank.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedBloodBank(bank)
                                setShowViewModal(true)
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBloodBank(bank)
                                setShowCreateModal(true)
                              }}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Edit Blood Bank"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBloodBank(bank._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Blood Bank"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <CreateBloodBankModal
            bloodBank={selectedBloodBank}
            onClose={() => {
              setShowCreateModal(false)
              setSelectedBloodBank(null)
            }}
            onSuccess={() => {
              setShowCreateModal(false)
              setSelectedBloodBank(null)
              loadBloodBanks()
            }}
          />
        )}

        {/* View Modal */}
        {showViewModal && selectedBloodBank && (
          <ViewBloodBankModal
            bloodBank={selectedBloodBank}
            onClose={() => {
              setShowViewModal(false)
              setSelectedBloodBank(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Create Blood Bank Modal Component (Simplified)
const CreateBloodBankModal = ({ bloodBank, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    username: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (bloodBank) {
      setFormData({
        name: bloodBank.name || '',
        email: bloodBank.email || '',
        password: '', // Don't populate password for security
        username: bloodBank.username || ''
      })
    }
  }, [bloodBank])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in all required fields (Name, Email, Password)')
      return
    }

    setLoading(true)

    try {
      if (bloodBank) {
        await bloodBankService.updateBloodBank(bloodBank._id, formData)
      } else {
        await bloodBankService.createBloodBank(formData)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving blood bank:', error)
      alert(error.response?.data?.message || 'Error saving blood bank')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {bloodBank ? 'Edit Blood Bank' : 'Create New Blood Bank'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Blood bank staff can update detailed information after login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Blood Bank Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Blood Bank Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blood-crimson"
                placeholder="Enter blood bank name"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blood-crimson"
                placeholder="Username (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">If empty, will use email prefix</p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blood-crimson"
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blood-crimson"
                placeholder="Enter password"
                required
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> After creation, blood bank staff can login with these credentials and update their complete profile including address, contact details, operating hours, and blood stock information.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <CustomButton
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : (bloodBank ? 'Update' : 'Create Blood Bank')}
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  )
}

// View Blood Bank Modal Component
const ViewBloodBankModal = ({ bloodBank, onClose }) => {
  const getTotalBloodUnits = (bloodStock) => {
    return Object.values(bloodStock || {}).reduce((total, units) => total + units, 0)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{bloodBank.name}</h2>
          <p className="text-gray-600">{bloodBank.email}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Username:</span>
                <span className="ml-2 text-gray-900">{bloodBank.username || 'Not set'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">License:</span>
                <span className="ml-2 text-gray-900">{bloodBank.licenseNumber || 'Not set'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  bloodBank.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {bloodBank.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <span className="ml-2 text-gray-900">{new Date(bloodBank.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          {bloodBank.address && (bloodBank.address.street || bloodBank.address.city) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Address</h3>
              <div className="text-sm text-gray-700">
                <div>{bloodBank.address.street}</div>
                <div>{bloodBank.address.city}, {bloodBank.address.state} {bloodBank.address.zipCode}</div>
                <div>{bloodBank.address.country}</div>
              </div>
            </div>
          )}

          {/* Contact */}
          {bloodBank.contact && bloodBank.contact.phone && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="text-sm text-gray-700">
                <div><span className="font-medium">Phone:</span> {bloodBank.contact.phone}</div>
                {bloodBank.contact.alternatePhone && (
                  <div><span className="font-medium">Alt Phone:</span> {bloodBank.contact.alternatePhone}</div>
                )}
                {bloodBank.contact.website && (
                  <div><span className="font-medium">Website:</span> {bloodBank.contact.website}</div>
                )}
              </div>
            </div>
          )}

          {/* Blood Stock */}
          {bloodBank.bloodStock && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Blood Stock ({getTotalBloodUnits(bloodBank.bloodStock)} units total)
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(bloodBank.bloodStock).map(([type, units]) => (
                  <div key={type} className="bg-red-50 p-3 rounded-lg text-center">
                    <div className="font-medium text-red-800">{type}</div>
                    <div className="text-2xl font-bold text-red-600">{units}</div>
                    <div className="text-xs text-red-600">units</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end">
          <CustomButton variant="outline" onClick={onClose}>
            Close
          </CustomButton>
        </div>
      </div>
    </div>
  )
}

export default AdminBloodBanks