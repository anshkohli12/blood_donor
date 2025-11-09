"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import {
  Users,
  Search,
  Filter,
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  Droplets,
  CheckCircle,
  X,
  Eye,
  Edit,
  UserCheck,
  UserX,
  ArrowLeft,
  Plus,
  Calendar,
  Heart,
  Activity,
  FileText,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import CustomButton from "../components/CustomButton"
import FormInput from "../components/FormInput"
import { useAuth } from "../hooks/useAuth"
import { donorService } from "../services/donorService"

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

const AdminDonors = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBloodType, setFilterBloodType] = useState("all")
  const [filterAvailability, setFilterAvailability] = useState("all")
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [stats, setStats] = useState({
    totalDonors: 0,
    availableDonors: 0,
    totalDonations: 0,
    recentRegistrations: 0
  })

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/login')
      return
    }

    fetchDonors()
  }, [user, navigate])

  const fetchDonors = async () => {
    try {
      setLoading(true)
      const response = await donorService.getAllDonors()
      
      if (response.success) {
        const donorsData = response.data || []
        setDonors(donorsData)
        
        // Calculate stats
        const totalDonors = donorsData.length
        const availableDonors = donorsData.filter(d => d.isAvailable !== false).length
        const totalDonations = donorsData.reduce((sum, d) => sum + (d.totalDonations || 0), 0)
        
        // Recent registrations (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const recentRegistrations = donorsData.filter(d => 
          new Date(d.createdAt || d.registrationDate) > thirtyDaysAgo
        ).length

        setStats({
          totalDonors,
          availableDonors,
          totalDonations,
          recentRegistrations
        })
      }
    } catch (error) {
      console.error('Error fetching donors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = 
      donor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone?.includes(searchTerm)
    
    const matchesBloodType = filterBloodType === "all" || donor.bloodType === filterBloodType
    const matchesAvailability = 
      filterAvailability === "all" || 
      (filterAvailability === "available" && donor.isAvailable !== false) ||
      (filterAvailability === "unavailable" && donor.isAvailable === false)

    return matchesSearch && matchesBloodType && matchesAvailability
  })

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      "A+": "bg-red-100 text-red-800",
      "A-": "bg-red-200 text-red-900",
      "B+": "bg-blue-100 text-blue-800",
      "B-": "bg-blue-200 text-blue-900",
      "AB+": "bg-purple-100 text-purple-800",
      "AB-": "bg-purple-200 text-purple-900",
      "O+": "bg-green-100 text-green-800",
      "O-": "bg-yellow-100 text-yellow-800"
    }
    return colors[bloodType] || "bg-gray-100 text-gray-800"
  }

  const exportDonors = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Blood Type", "City", "State", "Available", "Registration Date"].join(","),
      ...filteredDonors.map(donor => [
        donor.name || "",
        donor.email || "",
        donor.phone || "",
        donor.bloodType || "",
        donor.city || "",
        donor.state || "",
        donor.isAvailable !== false ? "Yes" : "No",
        new Date(donor.createdAt || donor.registrationDate).toLocaleDateString()
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "donors.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading donors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin-dashboard"
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <CustomButton
                onClick={exportDonors}
                variant="outline"
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </CustomButton>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 flex items-center">
            <Heart className="h-8 w-8 mr-3 text-red-600" />
            Donor Management
          </h1>
          <p className="text-gray-600 mt-2">Manage and view all registered blood donors</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Donors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDonors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Donors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.availableDonors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Donations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentRegistrations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search donors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <select
                value={filterBloodType}
                onChange={(e) => setFilterBloodType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Blood Types</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>

              <div className="text-sm text-gray-600 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                {filteredDonors.length} of {donors.length} donors
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Donors</CardTitle>
            <CardDescription>
              Complete list of all registered blood donors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDonors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No donors found</p>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blood Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDonors.map((donor, index) => (
                      <motion.tr
                        key={donor._id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {donor.name || `${donor.firstName} ${donor.lastName}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {donor._id?.slice(-6) || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {donor.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {donor.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodTypeColor(donor.bloodType)}`}>
                            <Droplets className="h-3 w-3 mr-1" />
                            {donor.bloodType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {donor.city}, {donor.state}
                          </div>
                          <div className="text-sm text-gray-500">
                            {donor.zipCode}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            donor.isAvailable !== false 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {donor.isAvailable !== false ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Available
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 mr-1" />
                                Unavailable
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(donor.createdAt || donor.registrationDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedDonor(donor)}
                              className="text-red-600 hover:text-red-900"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigator.clipboard.writeText(donor.email)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Copy Email"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Donor Details Modal */}
      {selectedDonor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Donor Details</h3>
                <button
                  onClick={() => setSelectedDonor(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedDonor.name || `${selectedDonor.firstName} ${selectedDonor.lastName}`}</div>
                    <div><strong>Email:</strong> {selectedDonor.email}</div>
                    <div><strong>Phone:</strong> {selectedDonor.phone}</div>
                    <div><strong>Blood Type:</strong> 
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodTypeColor(selectedDonor.bloodType)}`}>
                        {selectedDonor.bloodType}
                      </span>
                    </div>
                    <div><strong>Date of Birth:</strong> {selectedDonor.dateOfBirth ? new Date(selectedDonor.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Address</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Address:</strong> {selectedDonor.address}</div>
                    <div><strong>City:</strong> {selectedDonor.city}</div>
                    <div><strong>State:</strong> {selectedDonor.state}</div>
                    <div><strong>ZIP Code:</strong> {selectedDonor.zipCode}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Emergency Contact</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedDonor.emergencyContact || 'N/A'}</div>
                    <div><strong>Phone:</strong> {selectedDonor.emergencyPhone || 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Medical Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Medical Conditions:</strong> {selectedDonor.medicalConditions || 'None reported'}</div>
                    <div><strong>Medications:</strong> {selectedDonor.medications || 'None reported'}</div>
                    <div><strong>Last Donation:</strong> {selectedDonor.lastDonation ? new Date(selectedDonor.lastDonation).toLocaleDateString() : 'Never'}</div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3">Registration Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Registration Date:</strong> {new Date(selectedDonor.createdAt || selectedDonor.registrationDate).toLocaleDateString()}</div>
                    <div><strong>Status:</strong> 
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedDonor.isAvailable !== false 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedDonor.isAvailable !== false ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div><strong>Total Donations:</strong> {selectedDonor.totalDonations || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDonors