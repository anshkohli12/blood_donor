"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Droplets,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  AlertTriangle,
  Heart,
  User,
  Hospital,
  MessageCircle,
} from "lucide-react"
import CustomButton from "./CustomButton"

const RequestCard = ({ request }) => {
  const [showContact, setShowContact] = useState(false)

  const getUrgencyConfig = (urgency) => {
    const configs = {
      critical: {
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-200",
        icon: AlertTriangle,
        text: "Critical - Immediate",
      },
      high: {
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        borderColor: "border-orange-200",
        icon: Clock,
        text: "High - Within 24hrs",
      },
      medium: {
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        borderColor: "border-yellow-200",
        icon: Clock,
        text: "Medium - Within 3 days",
      },
      low: {
        color: "text-green-600",
        bgColor: "bg-green-100",
        borderColor: "border-green-200",
        icon: Clock,
        text: "Low - Within 1 week",
      },
    }
    return configs[urgency] || configs.medium
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
      "AB-": "bg-purple-600",
    }
    return colors[bloodType] || "bg-gray-500"
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeRemaining = (neededBy) => {
    const now = new Date()
    const needed = new Date(neededBy)
    const diffTime = needed - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Overdue"
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    return `${diffDays} days`
  }

  const urgencyConfig = getUrgencyConfig(request.urgency)
  const UrgencyIcon = urgencyConfig.icon

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 ${urgencyConfig.borderColor}`}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 ${getBloodTypeColor(request.bloodType)} rounded-xl flex items-center justify-center`}
            >
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-montserrat text-gray-900">{request.bloodType} Blood Needed</h3>
              <p className="text-gray-600 text-sm">
                {request.unitsNeeded} unit{request.unitsNeeded > 1 ? "s" : ""} required
              </p>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${urgencyConfig.bgColor} ${urgencyConfig.color}`}
          >
            <UrgencyIcon className="h-3 w-3" />
            <span>{urgencyConfig.text}</span>
          </div>
        </div>

        {/* Patient & Hospital Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <User className="h-4 w-4" />
            <span className="text-sm">Patient: {request.patientName}</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-600">
            <Hospital className="h-4 w-4" />
            <span className="text-sm">{request.hospitalName}</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">
              {request.city}, {request.state} {request.zipCode}
            </span>
          </div>
        </div>

        {/* Time Information */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Needed by: {formatDate(request.neededBy)}</span>
          </div>
          <div
            className={`px-2 py-1 rounded text-xs font-semibold ${
              getTimeRemaining(request.neededBy) === "Today" || getTimeRemaining(request.neededBy) === "Overdue"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {getTimeRemaining(request.neededBy)}
          </div>
        </div>

        {/* Medical Condition */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 font-medium mb-1">Medical Condition:</p>
          <p className="text-sm text-gray-600 line-clamp-2">{request.medicalCondition}</p>
        </div>

        {/* Contact Information */}
        {showContact && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t pt-4 mt-4 space-y-3"
          >
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Contact: {request.contactName}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{request.contactPhone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{request.contactEmail}</span>
            </div>
            {request.additionalNotes && (
              <div className="mt-3">
                <p className="text-sm text-gray-700 font-medium mb-1">Additional Notes:</p>
                <p className="text-sm text-gray-600">{request.additionalNotes}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          <CustomButton
            variant="primary"
            size="sm"
            className="flex-1"
            icon={Heart}
            onClick={() => {
              // Handle offer to donate
              alert(`Offering to donate ${request.bloodType} blood for ${request.patientName}`)
            }}
          >
            Offer to Donate
          </CustomButton>

          <CustomButton
            variant="outline"
            size="sm"
            icon={showContact ? MessageCircle : Phone}
            onClick={() => setShowContact(!showContact)}
          >
            {showContact ? "Hide" : "Contact"}
          </CustomButton>
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
          <Clock className="h-3 w-3" />
          <span>Active</span>
        </div>
      </div>
    </motion.div>
  )
}

export default RequestCard
