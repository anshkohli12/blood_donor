"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  User,
  Camera,
  Navigation,
  Save,
  ArrowLeft,
  Edit,
  X,
  Plus,
  Check,
  AlertTriangle,
  Upload,
  Image as ImageIcon
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import CustomButton from "../components/CustomButton"
import FormInput from "../components/FormInput"
import { bloodBankService } from "../services/bloodBankService"

const BloodBankProfile = () => {
  const navigate = useNavigate()
  const [bloodBank, setBloodBank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    location: {
      coordinates: []
    },
    contact: {
      phone: '',
      alternatePhone: '',
      fax: '',
      website: '',
      emergencyContact: ''
    },
    contactPerson: {
      name: '',
      designation: '',
      phone: '',
      email: ''
    },
    specialServices: '',
    services: [],
    capacity: {
      totalBeds: 0,
      storageCapacity: 0,
      dailyCollectionCapacity: 0
    },
    operatingHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      saturday: { isOpen: false, openTime: '09:00', closeTime: '13:00' },
      sunday: { isOpen: false, openTime: '09:00', closeTime: '13:00' }
    }
  })

  // Image state
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Available services
  const availableServices = [
    'Blood Collection',
    'Blood Testing',
    'Blood Storage',
    'Platelet Donation',
    'Plasma Collection',
    'Apheresis',
    'Mobile Blood Drives',
    'Emergency Blood Supply',
    'Rare Blood Types',
    'Cord Blood Banking',
    'Bone Marrow Registry',
    'Educational Programs',
    '24/7 Emergency Service'
  ]

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  useEffect(() => {
    const bloodbankToken = localStorage.getItem('bloodbankToken')
    if (!bloodbankToken) {
      navigate('/blood-bank-login')
      return
    }

    loadBloodBankData()
  }, [navigate])

  const loadBloodBankData = async () => {
    try {
      setLoading(true)
      const userData = JSON.parse(localStorage.getItem('bloodbank'))
      if (userData && userData.id) {
        const response = await bloodBankService.getBloodBankById(userData.id)
        const data = response.data
        setBloodBank(data)
        
        // Populate form data
        setFormData({
          name: data.name || '',
          licenseNumber: data.licenseNumber || '',
          email: data.email || '',
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            zipCode: data.address?.zipCode || '',
            country: data.address?.country || 'USA'
          },
          location: {
            coordinates: data.location?.coordinates || []
          },
          contact: {
            phone: data.contact?.phone || '',
            alternatePhone: data.contact?.alternatePhone || '',
            fax: data.contact?.fax || '',
            website: data.contact?.website || '',
            emergencyContact: data.contact?.emergencyContact || ''
          },
          contactPerson: {
            name: data.contactPerson?.name || '',
            designation: data.contactPerson?.designation || '',
            phone: data.contactPerson?.phone || '',
            email: data.contactPerson?.email || ''
          },
          specialServices: data.specialServices || '',
          services: data.services || [],
          capacity: {
            totalBeds: data.capacity?.totalBeds || 0,
            storageCapacity: data.capacity?.storageCapacity || 0,
            dailyCollectionCapacity: data.capacity?.dailyCollectionCapacity || 0
          },
          operatingHours: data.operatingHours || {
            monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
            tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
            wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
            thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
            friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
            saturday: { isOpen: false, openTime: '09:00', closeTime: '13:00' },
            sunday: { isOpen: false, openTime: '09:00', closeTime: '13:00' }
          }
        })

        // Set existing image if available
        if (data.profileImage) {
          setImagePreview(data.profileImage)
        }
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

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }))
  }

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      setProfileImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({
          ...prev,
          location: {
            coordinates: [longitude, latitude]
          }
        }))
        setGettingLocation(false)
        alert(`Location detected: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
      },
      (error) => {
        console.error('Error getting location:', error)
        setGettingLocation(false)
        alert('Unable to get your location. Please enable location services and try again.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const userData = JSON.parse(localStorage.getItem('bloodbank'))
      
      // Create FormData for file upload
      const updateData = new FormData()
      
      // Add all form fields
      updateData.append('data', JSON.stringify(formData))
      
      // Add image if selected
      if (profileImage) {
        updateData.append('profileImage', profileImage)
      }

      await bloodBankService.updateBloodBankProfile(userData.id, updateData)
      
      setEditMode(false)
      await loadBloodBankData()
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile: ' + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <CustomButton
              variant="outline"
              onClick={() => navigate('/blood-bank-dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </CustomButton>
            <h1 className="text-3xl font-bold text-gray-900">Blood Bank Profile</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {!editMode ? (
              <CustomButton
                onClick={() => setEditMode(true)}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </CustomButton>
            ) : (
              <>
                <CustomButton
                  variant="outline"
                  onClick={() => {
                    setEditMode(false)
                    loadBloodBankData()
                  }}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </CustomButton>
                <CustomButton
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </CustomButton>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image and Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Profile Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative mb-6">
                  <div className="w-48 h-48 mx-auto rounded-full bg-gray-200 overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-20 w-20 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {editMode && (
                    <label className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.name || 'Blood Bank'}</h3>
                <p className="text-gray-600 mb-4">{formData.licenseNumber}</p>
                
                {editMode && (
                  <p className="text-sm text-gray-500">
                    Click the camera icon to upload a new profile image
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update your blood bank's basic details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Blood Bank Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!editMode}
                    required
                  />
                  <FormInput
                    label="License Number"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    disabled={!editMode}
                    required
                  />
                  <FormInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editMode}
                    required
                  />
                  <FormInput
                    label="Phone Number"
                    value={formData.contact.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value, 'contact')}
                    disabled={!editMode}
                  />
                  <FormInput
                    label="Alternate Phone"
                    value={formData.contact.alternatePhone}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value, 'contact')}
                    disabled={!editMode}
                  />
                  <FormInput
                    label="Website"
                    value={formData.contact.website}
                    onChange={(e) => handleInputChange('website', e.target.value, 'contact')}
                    disabled={!editMode}
                    placeholder="https://www.example.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Address & Location</span>
                </CardTitle>
                <CardDescription>
                  Provide your complete address and geographical location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormInput
                  label="Street Address"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('street', e.target.value, 'address')}
                  disabled={!editMode}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormInput
                    label="City"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('city', e.target.value, 'address')}
                    disabled={!editMode}
                  />
                  <FormInput
                    label="State"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('state', e.target.value, 'address')}
                    disabled={!editMode}
                  />
                  <FormInput
                    label="ZIP Code"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value, 'address')}
                    disabled={!editMode}
                  />
                </div>

                {editMode && (
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <Navigation className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-blue-900 font-medium">Detect Current Location</p>
                      <p className="text-blue-700 text-sm">
                        Allow location access to automatically detect your coordinates
                      </p>
                    </div>
                    <CustomButton
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      {gettingLocation ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Getting...
                        </>
                      ) : (
                        'Get Location'
                      )}
                    </CustomButton>
                  </div>
                )}

                {formData.location.coordinates.length === 2 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-green-900 font-medium">Location Detected</p>
                    <p className="text-green-700 text-sm">
                      Latitude: {formData.location.coordinates[1].toFixed(6)}, 
                      Longitude: {formData.location.coordinates[0].toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Person */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Contact Person</span>
                </CardTitle>
                <CardDescription>
                  Primary contact person for the blood bank
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Contact Person Name"
                    value={formData.contactPerson.name}
                    onChange={(e) => handleInputChange('name', e.target.value, 'contactPerson')}
                    disabled={!editMode}
                  />
                  <FormInput
                    label="Designation"
                    value={formData.contactPerson.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value, 'contactPerson')}
                    disabled={!editMode}
                    placeholder="e.g., Manager, Director"
                  />
                  <FormInput
                    label="Contact Phone"
                    value={formData.contactPerson.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value, 'contactPerson')}
                    disabled={!editMode}
                  />
                  <FormInput
                    label="Contact Email"
                    type="email"
                    value={formData.contactPerson.email}
                    onChange={(e) => handleInputChange('email', e.target.value, 'contactPerson')}
                    disabled={!editMode}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
                <CardDescription>
                  Select all services that your blood bank provides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {availableServices.map((service) => (
                    <label
                      key={service}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.services.includes(service)
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      } ${!editMode ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service)}
                        onChange={() => editMode && handleServiceToggle(service)}
                        disabled={!editMode}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Services Description
                  </label>
                  <textarea
                    value={formData.specialServices}
                    onChange={(e) => handleInputChange('specialServices', e.target.value)}
                    disabled={!editMode}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Describe any special services or facilities..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Capacity Information */}
            <Card>
              <CardHeader>
                <CardTitle>Capacity Information</CardTitle>
                <CardDescription>
                  Information about your blood bank's capacity and infrastructure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormInput
                    label="Total Beds"
                    type="number"
                    value={formData.capacity.totalBeds}
                    onChange={(e) => handleInputChange('totalBeds', parseInt(e.target.value) || 0, 'capacity')}
                    disabled={!editMode}
                    min="0"
                  />
                  <FormInput
                    label="Storage Capacity (Units)"
                    type="number"
                    value={formData.capacity.storageCapacity}
                    onChange={(e) => handleInputChange('storageCapacity', parseInt(e.target.value) || 0, 'capacity')}
                    disabled={!editMode}
                    min="0"
                  />
                  <FormInput
                    label="Daily Collection Capacity"
                    type="number"
                    value={formData.capacity.dailyCollectionCapacity}
                    onChange={(e) => handleInputChange('dailyCollectionCapacity', parseInt(e.target.value) || 0, 'capacity')}
                    disabled={!editMode}
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Operating Hours</span>
                </CardTitle>
                <CardDescription>
                  Set your blood bank's operating hours for each day of the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dayNames.map((day) => (
                    <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-24">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {day}
                        </span>
                      </div>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.operatingHours[day].isOpen}
                          onChange={(e) => handleOperatingHoursChange(day, 'isOpen', e.target.checked)}
                          disabled={!editMode}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </label>

                      {formData.operatingHours[day].isOpen && (
                        <>
                          <input
                            type="time"
                            value={formData.operatingHours[day].openTime}
                            onChange={(e) => handleOperatingHoursChange(day, 'openTime', e.target.value)}
                            disabled={!editMode}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={formData.operatingHours[day].closeTime}
                            onChange={(e) => handleOperatingHoursChange(day, 'closeTime', e.target.value)}
                            disabled={!editMode}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BloodBankProfile