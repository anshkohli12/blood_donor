"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, MapPin, Clock, Users, Heart, Phone, Mail, User, CheckCircle, AlertCircle, Info } from "lucide-react"
import CustomButton from "./CustomButton"
import { eventService } from "../services/eventService"

const EventCard = ({ event }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (token) {
      setCurrentUser({ token })
      // Check if user is registered for this event
      checkRegistrationStatus()
    }
  }, [event._id])

  const checkRegistrationStatus = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (userId && event.registrations) {
        const registered = event.registrations.some(
          reg => reg.userId === userId || reg.userId?._id === userId
        )
        setIsRegistered(registered)
      }
    } catch (error) {
      console.error('Error checking registration status:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEventStatus = () => {
    const now = new Date()
    const eventDate = new Date(event.date)
    const endDate = new Date(event.endDate || event.date)

    if (now > endDate) {
      return { text: "Completed", color: "text-gray-600", bgColor: "bg-gray-100", icon: CheckCircle }
    }
    if (now >= eventDate && now <= endDate) {
      return { text: "Ongoing", color: "text-green-600", bgColor: "bg-green-100", icon: AlertCircle }
    }
    if (eventDate > now) {
      return { text: "Upcoming", color: "text-blue-600", bgColor: "bg-blue-100", icon: Calendar }
    }
    return { text: "Unknown", color: "text-gray-600", bgColor: "bg-gray-100", icon: Info }
  }

  const getCapacityStatus = () => {
    const percentage = (event.registeredCount / event.maxCapacity) * 100
    if (percentage >= 100) {
      return { text: "Full", color: "text-red-600", bgColor: "bg-red-100" }
    }
    if (percentage >= 80) {
      return { text: "Almost Full", color: "text-orange-600", bgColor: "bg-orange-100" }
    }
    return { text: "Available", color: "text-green-600", bgColor: "bg-green-100" }
  }

  const handleRegistration = async () => {
    if (!currentUser) {
      alert('Please login to register for events')
      return
    }

    setIsRegistering(true)
    try {
      if (isRegistered) {
        // Unregister
        const response = await eventService.unregisterFromEvent(event._id)
        if (response.success) {
          setIsRegistered(false)
          alert(`Successfully unregistered from ${event.title}`)
        }
      } else {
        // Register
        const response = await eventService.registerForEvent(event._id)
        if (response.success) {
          setIsRegistered(true)
          alert(`Successfully registered for ${event.title}`)
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert(error.message || "Registration failed. Please try again.")
    } finally {
      setIsRegistering(false)
    }
  }

  const eventStatus = getEventStatus()
  const capacityStatus = getCapacityStatus()
  const StatusIcon = eventStatus.icon

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      {/* Event Image */}
      <div className="relative h-48 bg-gradient-to-r from-blood-deep to-blood-crimson">
        <img
          src={event.image ? `http://localhost:5000${event.image}` : "/placeholder.svg?height=200&width=400&query=blood donation event"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${eventStatus.bgColor} ${eventStatus.color}`}
          >
            <StatusIcon className="h-3 w-3" />
            <span>{eventStatus.text}</span>
          </div>
        </div>

        {/* Registration Status */}
        {isRegistered && (
          <div className="absolute top-4 left-4">
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Registered</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold font-montserrat text-gray-900 mb-2">{event.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-3 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center space-x-3 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {formatTime(event.date)} - {formatTime(event.endDate || event.date)}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{event.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-gray-600">
              <Users className="h-4 w-4" />
              <span className="text-sm">
                {event.registeredCount}/{event.maxCapacity} registered
              </span>
            </div>
            <div
              className={`px-2 py-1 rounded text-xs font-semibold ${capacityStatus.bgColor} ${capacityStatus.color}`}
            >
              {capacityStatus.text}
            </div>
          </div>
        </div>

        {/* Organizer Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 text-gray-600">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">Organized by: {event.organizerName || event.organizer?.name || 'Unknown'}</span>
          </div>
        </div>

        {/* Additional Details */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t pt-4 mt-4 space-y-3"
          >
            {event.requirements && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
                <p className="text-sm text-gray-600">{event.requirements}</p>
              </div>
            )}

            {event.contactPhone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{event.contactPhone}</span>
              </div>
            )}

            {event.contactEmail && (
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{event.contactEmail}</span>
              </div>
            )}

            {event.additionalInfo && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Additional Information:</p>
                <p className="text-sm text-gray-600">{event.additionalInfo}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          {eventStatus.text !== "Completed" && capacityStatus.text !== "Full" && (
            <CustomButton
              variant={isRegistered ? "outline" : "primary"}
              size="sm"
              className="flex-1"
              icon={isRegistered ? CheckCircle : Heart}
              onClick={handleRegistration}
              disabled={isRegistering}
            >
              {isRegistering ? "Processing..." : isRegistered ? "Unregister" : "Register to Donate"}
            </CustomButton>
          )}

          <CustomButton variant="outline" size="sm" icon={Info} onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Less Info" : "More Info"}
          </CustomButton>
        </div>
      </div>
    </motion.div>
  )
}

export default EventCard
