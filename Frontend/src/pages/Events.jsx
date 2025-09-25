"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { Search, Calendar, MapPin, Plus } from "lucide-react"
import EventCard from "../components/EventCard"
import CustomButton from "../components/CustomButton"
import FormInput from "../components/FormInput"

const Events = () => {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("")

  // Mock data for demonstration
  const mockEvents = [
    {
      id: 1,
      title: "Community Blood Drive - Downtown",
      description: "Join us for a community blood drive to help save lives in our downtown area.",
      date: "2024-02-15T09:00:00",
      endDate: "2024-02-15T17:00:00",
      location: "Downtown Community Center, 123 Main St",
      organizer: "Red Cross",
      maxCapacity: 100,
      registeredCount: 67,
      isRegistered: false,
      image: "/blood-donation-event-community-center.jpg",
      requirements: "Must be 18+ years old, weigh at least 110 lbs, and be in good health",
      contactPhone: "(555) 123-4567",
      contactEmail: "events@redcross.org",
      additionalInfo: "Free refreshments will be provided. Please bring a valid ID.",
    },
    {
      id: 2,
      title: "Emergency Blood Collection Drive",
      description: "Urgent need for O- and AB+ blood types. Help us meet critical demand.",
      date: "2024-02-20T08:00:00",
      endDate: "2024-02-20T16:00:00",
      location: "City Hospital, 456 Health Ave",
      organizer: "City Hospital Blood Bank",
      maxCapacity: 150,
      registeredCount: 89,
      isRegistered: true,
      image: "/emergency-blood-drive-hospital.jpg",
      requirements: "All blood types welcome, special need for O- and AB+",
      contactPhone: "(555) 987-6543",
      contactEmail: "blooddrive@cityhospital.org",
      additionalInfo: "Walk-ins welcome. Appointments preferred to reduce wait time.",
    },
    {
      id: 3,
      title: "University Blood Drive Week",
      description: "Student-organized blood drive supporting local hospitals and emergency services.",
      date: "2024-03-01T10:00:00",
      endDate: "2024-03-05T18:00:00",
      location: "University Student Center, 789 Campus Dr",
      organizer: "University Health Services",
      maxCapacity: 200,
      registeredCount: 156,
      isRegistered: false,
      image: "/university-blood-drive-students.jpg",
      requirements: "Students, faculty, and community members welcome",
      contactPhone: "(555) 456-7890",
      contactEmail: "health@university.edu",
      additionalInfo: "Special prizes for student donors. Food trucks on-site daily.",
    },
  ]

  useEffect(() => {
    gsap.fromTo(".events-header", { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
    gsap.fromTo(
      ".events-content",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" },
    )

    // Simulate API call
    setTimeout(() => {
      setEvents(mockEvents)
      setFilteredEvents(mockEvents)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = events

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (selectedFilter !== "all") {
      const now = new Date()
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date)
        const endDate = new Date(event.endDate || event.date)

        switch (selectedFilter) {
          case "upcoming":
            return eventDate > now
          case "ongoing":
            return now >= eventDate && now <= endDate
          case "completed":
            return now > endDate
          case "registered":
            return event.isRegistered
          default:
            return true
        }
      })
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter((event) => event.location.toLowerCase().includes(selectedLocation.toLowerCase()))
    }

    setFilteredEvents(filtered)
  }, [events, searchTerm, selectedFilter, selectedLocation])

  return (
    <div className="pt-28 section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="events-header text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-montserrat text-gradient mb-4"
          >
            Donation Events
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Join upcoming blood donation drives and events in your community. Every donation saves lives.
          </motion.p>
        </div>

        {/* Filters and Search */}
        <div className="events-content mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <FormInput
                placeholder="Search events..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Status Filter */}
              <div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson py-3 px-3"
                >
                  <option value="all">All Events</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="registered">My Registered</option>
                </select>
              </div>

              {/* Location Filter */}
              <FormInput
                placeholder="Filter by location..."
                icon={MapPin}
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              />

              {/* Create Event Button */}
              <CustomButton
                variant="primary"
                icon={Plus}
                onClick={() => alert("Create Event functionality would be implemented here")}
              >
                Create Event
              </CustomButton>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="events-content">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedLocation
                  ? "Try adjusting your search criteria"
                  : "No events match your current filters"}
              </p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blood-deep to-blood-crimson rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold font-montserrat mb-4">Want to Organize an Event?</h2>
            <p className="text-xl mb-6 text-red-100">
              Help your community by organizing a blood donation drive in your area.
            </p>
            <CustomButton
              variant="secondary"
              size="lg"
              icon={Plus}
              onClick={() => alert("Event organization form would be implemented here")}
            >
              Organize an Event
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Events
