"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Droplets,
  Navigation,
  Star,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from "lucide-react"
import CustomButton from "./CustomButton"

const BloodBankCard = ({ bloodBank }) => {
  const [showStock, setShowStock] = useState(false)
  const [showContact, setShowContact] = useState(false)

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      "O+": "bg-red-500",
      "O-": "bg-red-600",
      "A+": "bg-blue-500",
      "A-": "bg-blue-600",
      "B+": "bg-green-500",
      "B-": "bg-green-600",
      "AB+": "bg-purple-500",
      "AB-": "bg-purple-600",
    }
    return colors[bloodType] || "bg-gray-500"
  }

  const getStockStatus = (units) => {
    if (units === 0) {
      return { text: "Out of Stock", color: "text-red-600", bgColor: "bg-red-100", icon: AlertTriangle }
    }
    if (units < 10) {
      return { text: "Low Stock", color: "text-orange-600", bgColor: "bg-orange-100", icon: AlertTriangle }
    }
    if (units < 50) {
      return { text: "Moderate Stock", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Info }
    }
    return { text: "Good Stock", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle }
  }

  const formatHours = (hours) => {
    if (!hours) return "Hours not available"

    // If it's already a string (like operatingHoursDisplay), return it
    if (typeof hours === 'string') {
      return hours
    }

    // If it's an object with day schedules, format it
    if (typeof hours === 'object' && hours.monday) {
      const openDays = []
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

      for (let i = 0; i < days.length; i++) {
        const day = hours[days[i]]
        if (day && day.isOpen) {
          openDays.push(`${dayNames[i]}: ${day.openTime} - ${day.closeTime}`)
        }
      }

      return openDays.length > 0 ? openDays.join(', ') : 'Hours not available'
    }

    return "Hours not available"
  }

  const getOperatingStatus = () => {
    // Simple logic - in real app, this would check current time against operating hours
    const isOpen = bloodBank.isOpen !== undefined ? bloodBank.isOpen : true
    return isOpen
      ? { text: "Open", color: "text-green-600", bgColor: "bg-green-100" }
      : { text: "Closed", color: "text-red-600", bgColor: "bg-red-100" }
  }

  const operatingStatus = getOperatingStatus()

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col relative"
    >
      {/* Header with Profile Image */}
      <div className="p-6 pb-4 flex-1 flex flex-col pt-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                {bloodBank.profileImage ? (
                  <img
                    src={bloodBank.profileImage.startsWith('http') ? bloodBank.profileImage : `http://localhost:5000${bloodBank.profileImage}`}
                    alt={`${bloodBank.name} profile`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-logo.png'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Blood Bank Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold font-montserrat text-gray-900 mb-2">{bloodBank.name}</h3>
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {typeof bloodBank.address === 'string'
                    ? bloodBank.address
                    : bloodBank.address?.street || 'Address not available'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="text-sm">
                  {typeof bloodBank.address === 'object'
                    ? `${bloodBank.address?.city || ''}, ${bloodBank.address?.state || ''} ${bloodBank.address?.zipCode || ''}`.trim()
                    : `${bloodBank.city || ''}, ${bloodBank.state || ''} ${bloodBank.zipCode || ''}`.trim()}
                </span>
                {bloodBank.distance && <span className="text-xs text-gray-400">• {bloodBank.distance} mi away</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${operatingStatus.bgColor} ${operatingStatus.color}`}
            >
              {operatingStatus.text}
            </div>

            {bloodBank.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-gray-700">{bloodBank.rating}</span>
                <span className="text-xs text-gray-500">({bloodBank.reviewCount})</span>
              </div>
            )}
          </div>
        </div>

        {/* Operating Hours */}
        <div className="flex items-center space-x-2 text-gray-600 mb-4">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            {bloodBank.operatingHoursDisplay || formatHours(bloodBank.operatingHours) || "Hours not available"}
          </span>
        </div>

        {/* Blood Stock Overview */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center">
              <Droplets className="h-4 w-4 mr-2 text-blood-crimson" />
              Blood Stock Status
            </h4>
            <CustomButton variant="ghost" size="xs" onClick={() => setShowStock(true)}>
              View All
            </CustomButton>
          </div>

          {/* Quick Stock Overview */}
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(bloodBank.bloodStock || {})
              .filter(([bloodType]) => bloodType !== '_id' && bloodType !== '__v')
              .slice(0, 4)
              .map(([bloodType, units]) => {
                const stockStatus = getStockStatus(units)
                const StockIcon = stockStatus.icon

                return (
                  <div key={bloodType} className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                    <div
                      className={`w-6 h-6 ${getBloodTypeColor(bloodType)} rounded-full flex items-center justify-center mb-1`}
                    >
                      <span className="text-xs font-bold text-white">{bloodType.charAt(0)}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{bloodType}</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <StockIcon className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{units}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-auto pt-4 relative z-10">
          <CustomButton
            variant="primary"
            size="sm"
            className="flex-1"
            icon={Navigation}
            onClick={() => {
              // Handle directions
              const address = encodeURIComponent(`${bloodBank.address}, ${bloodBank.city}, ${bloodBank.state}`)
              window.open(`https://maps.google.com/maps?q=${address}`, "_blank")
            }}
          >
            Get Directions
          </CustomButton>

          <CustomButton
            variant="outline"
            size="sm"
            icon={Phone}
            onClick={() => setShowContact(true)}
          >
            Contact
          </CustomButton>
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {showStock && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm p-6 pt-12 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 flex items-center">
                <Droplets className="h-5 w-5 mr-2 text-blood-crimson" />
                Detailed Stock
              </h4>
              <button
                onClick={() => setShowStock(false)}
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-200 text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 pb-4 custom-scrollbar">
              {Object.entries(bloodBank.bloodStock || {})
                .filter(([bloodType]) => bloodType !== '_id' && bloodType !== '__v')
                .map(([bloodType, units]) => {
                  const stockStatus = getStockStatus(units)
                  const StockIcon = stockStatus.icon

                  return (
                    <div key={bloodType} className="flex items-center justify-between p-3 bg-white border border-gray-100 shadow-sm rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 ${getBloodTypeColor(bloodType)} rounded-lg flex items-center justify-center shadow-inner`}
                        >
                          <Droplets className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{bloodType}</p>
                          <p className="text-xs font-medium text-gray-500">{units} units</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showContact && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm p-6 pt-12 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-600" />
                Contact Info
              </h4>
              <button
                onClick={() => setShowContact(false)}
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-200 text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pb-4 custom-scrollbar">
              {bloodBank.phone && (
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <div className="mt-0.5 p-2 bg-blue-50 rounded-full">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                    <span className="text-sm font-semibold text-gray-800">{bloodBank.phone}</span>
                  </div>
                </div>
              )}

              {bloodBank.email && (
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <div className="mt-0.5 p-2 bg-red-50 rounded-full">
                    <Mail className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <span className="text-sm font-semibold text-gray-800 break-all">{bloodBank.email}</span>
                  </div>
                </div>
              )}

              {bloodBank.website && (
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <div className="mt-0.5 p-2 bg-green-50 rounded-full">
                    <Info className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Website</p>
                    <a
                      href={bloodBank.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-blood-crimson hover:text-blood-deep break-all"
                    >
                      Visit Website
                    </a>
                  </div>
                </div>
              )}

              {bloodBank.specialServices && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    <Star className="h-3 w-3 mr-1 text-yellow-500" />
                    Special Services
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{bloodBank.specialServices}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
          <Shield className="h-3 w-3" />
          <span>Certified</span>
        </div>
      </div>
    </motion.div>
  )
}

export default BloodBankCard
