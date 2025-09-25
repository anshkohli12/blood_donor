"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Droplets, Phone, Mail, Calendar, Award, Heart, Clock, User, Shield } from "lucide-react"
import CustomButton from "./CustomButton"

const DonorCard = ({ donor }) => {
  const [showContact, setShowContact] = useState(false)

  const getAvailabilityStatus = () => {
    if (!donor.isAvailable) {
      return { text: "Not Available", color: "text-red-600", bgColor: "bg-red-100" }
    }

    const lastDonationDate = new Date(donor.lastDonation)
    const daysSinceLastDonation = Math.floor((new Date() - lastDonationDate) / (1000 * 60 * 60 * 24))

    if (daysSinceLastDonation < 56) {
      return { text: "Recently Donated", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    }

    return { text: "Available", color: "text-green-600", bgColor: "bg-green-100" }
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

  const formatLastDonation = (date) => {
    const donationDate = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now - donationDate)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} days ago`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? "s" : ""} ago`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} year${years > 1 ? "s" : ""} ago`
    }
  }

  const availabilityStatus = getAvailabilityStatus()

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={donor.avatar || "/placeholder.svg"}
                alt={donor.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 ${getBloodTypeColor(donor.bloodType)} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg`}
              >
                {donor.bloodType.charAt(0)}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold font-montserrat text-gray-900">{donor.name}</h3>
              <div className="flex items-center space-x-2 text-gray-600 mt-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {donor.city}, {donor.state}
                </span>
                <span className="text-xs text-gray-400">• {donor.distance} mi</span>
              </div>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${availabilityStatus.bgColor} ${availabilityStatus.color}`}
          >
            {availabilityStatus.text}
          </div>
        </div>
      </div>

      {/* Blood Type & Stats */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 ${getBloodTypeColor(donor.bloodType)} rounded-lg flex items-center justify-center`}
              >
                <Droplets className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Type</p>
                <p className="font-bold text-gray-900">{donor.bloodType}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Donations</p>
                <p className="font-bold text-gray-900">{donor.totalDonations}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Donation */}
      <div className="px-6 pb-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">Last donation: {formatLastDonation(donor.lastDonation)}</span>
        </div>
      </div>

      {/* Contact Information */}
      {showContact && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-6 pb-4 border-t bg-gray-50"
        >
          <div className="pt-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{donor.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{donor.email}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex space-x-3">
          {donor.isAvailable ? (
            <>
              <CustomButton
                variant="primary"
                size="sm"
                className="flex-1"
                icon={Heart}
                onClick={() => {
                  // Handle contact donor
                  alert(`Contacting ${donor.name} for blood donation request`)
                }}
              >
                Request Donation
              </CustomButton>

              <CustomButton
                variant="outline"
                size="sm"
                icon={showContact ? User : Phone}
                onClick={() => setShowContact(!showContact)}
              >
                {showContact ? "Hide" : "Contact"}
              </CustomButton>
            </>
          ) : (
            <CustomButton variant="outline" size="sm" className="flex-1" disabled icon={Clock}>
              Not Available
            </CustomButton>
          )}
        </div>
      </div>

      {/* Verification Badge */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
          <Shield className="h-3 w-3" />
          <span>Verified</span>
        </div>
      </div>
    </motion.div>
  )
}

export default DonorCard
