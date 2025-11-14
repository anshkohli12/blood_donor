"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Phone, Clock, User, AlertCircle } from "lucide-react"
import DonorCard from "../components/DonorCard"
import CustomButton from "../components/CustomButton"
import { donorService } from "../services/donorService"

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

const FindDonors = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    bloodType: "",
    city: "",
    state: "",
    availability: "available",
    distance: "50",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [donors, setDonors] = useState([])
  const [searchError, setSearchError] = useState("")
  const [loading, setLoading] = useState(true)

  // Fetch donors from API
  useEffect(() => {
    fetchDonors()
  }, [])

  const fetchDonors = async () => {
    try {
      setLoading(true)
      setSearchError("")
      const response = await donorService.getAllDonors({ limit: 100 })
      
      if (response.success) {
        // Map API data to match the expected format
        const mappedDonors = response.data.map(donor => ({
          id: donor._id,
          name: donor.name || `${donor.firstName} ${donor.lastName}`,
          bloodType: donor.bloodType,
          city: donor.city || donor.address?.city || "N/A",
          state: donor.state || donor.address?.state || "N/A",
          isAvailable: donor.isAvailable !== undefined ? donor.isAvailable : true,
          lastDonation: donor.lastDonationDate || donor.lastDonation || null,
          totalDonations: donor.donationCount || donor.totalDonations || 0,
          phone: donor.phone || donor.phoneNumber || "N/A",
          email: donor.email || "N/A",
          distance: 0, // Can be calculated if location data is available
          avatar: donor.avatar || "/placeholder-user.jpg",
        }))
        setDonors(mappedDonors)
      }
    } catch (error) {
      console.error('Error fetching donors:', error)
      setSearchError('Failed to load donors. Please try again.')
      setDonors([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setIsSearching(true)
    setSearchError("")

    try {
      // Fetch fresh data from API with filters
      const apiFilters = {}
      if (filters.bloodType) {
        apiFilters.bloodType = filters.bloodType
      }

      const response = await donorService.getAllDonors({ ...apiFilters, limit: 100 })
      
      if (response.success) {
        let filteredDonors = response.data.map(donor => ({
          id: donor._id,
          name: donor.name || `${donor.firstName} ${donor.lastName}`,
          bloodType: donor.bloodType,
          city: donor.city || donor.address?.city || "N/A",
          state: donor.state || donor.address?.state || "N/A",
          isAvailable: donor.isAvailable !== undefined ? donor.isAvailable : true,
          lastDonation: donor.lastDonationDate || donor.lastDonation || null,
          totalDonations: donor.donationCount || donor.totalDonations || 0,
          phone: donor.phone || donor.phoneNumber || "N/A",
          email: donor.email || "N/A",
          distance: 0,
          avatar: donor.avatar || "/placeholder-user.jpg",
        }))

        // Apply client-side filters
        if (filters.city) {
          filteredDonors = filteredDonors.filter((donor) => 
            donor.city.toLowerCase().includes(filters.city.toLowerCase())
          )
        }

        if (filters.state) {
          filteredDonors = filteredDonors.filter((donor) =>
            donor.state.toLowerCase().includes(filters.state.toLowerCase())
          )
        }

        if (filters.availability === "available") {
          filteredDonors = filteredDonors.filter((donor) => donor.isAvailable)
        }

        if (searchQuery) {
          filteredDonors = filteredDonors.filter(
            (donor) =>
              donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              donor.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
              donor.bloodType.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }

        // Sort by distance (if available) or by availability
        filteredDonors.sort((a, b) => {
          if (a.isAvailable && !b.isAvailable) return -1
          if (!a.isAvailable && b.isAvailable) return 1
          return a.distance - b.distance
        })

        setDonors(filteredDonors)

        if (filteredDonors.length === 0) {
          setSearchError("No donors found matching your criteria. Try adjusting your filters.")
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchError("Failed to search donors. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      bloodType: "",
      city: "",
      state: "",
      availability: "available",
      distance: "50",
    })
    setSearchQuery("")
    fetchDonors() // Reload all donors
    setSearchError("")
  }

  const urgentBloodTypes = ["O-", "O+", "A-", "B-"]

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-blood-deep to-blood-crimson text-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-6xl font-bold font-montserrat mb-6">
              Find Blood <span className="text-pink-200">Donors</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 leading-relaxed mb-8">
              Connect with verified blood donors in your area. Every search could save a life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Urgent Need Alert */}
      <section className="bg-orange-50 border-b border-orange-200">
        <div className="container-custom py-4">
          <div className="flex items-center justify-center space-x-4 text-orange-800">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span className="font-medium">Urgent Need:</span>
            <div className="flex space-x-2">
              {urgentBloodTypes.map((type) => (
                <span key={type} className="px-2 py-1 bg-orange-200 rounded text-sm font-semibold">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, city, or blood type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-crimson focus:border-blood-crimson"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <div className="flex gap-2">
                <CustomButton variant="outline" onClick={() => setShowFilters(!showFilters)} icon={Filter}>
                  Filters
                </CustomButton>

                <CustomButton variant="primary" onClick={handleSearch} loading={isSearching} icon={Search}>
                  {isSearching ? "Searching..." : "Search"}
                </CustomButton>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50 rounded-lg p-6 mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                    <select
                      value={filters.bloodType}
                      onChange={(e) => setFilters((prev) => ({ ...prev, bloodType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-crimson focus:border-blood-crimson"
                    >
                      <option value="">All Types</option>
                      {bloodTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      placeholder="Enter city"
                      value={filters.city}
                      onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-crimson focus:border-blood-crimson"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      placeholder="Enter state"
                      value={filters.state}
                      onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-crimson focus:border-blood-crimson"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <select
                      value={filters.availability}
                      onChange={(e) => setFilters((prev) => ({ ...prev, availability: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-crimson focus:border-blood-crimson"
                    >
                      <option value="all">All Donors</option>
                      <option value="available">Available Only</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-4 space-x-2">
                  <CustomButton variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </CustomButton>
                  <CustomButton variant="primary" onClick={handleSearch}>
                    Apply Filters
                  </CustomButton>
                </div>
              </motion.div>
            )}

            {/* Search Error */}
            {searchError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-3"
              >
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <p className="text-yellow-700 text-sm">{searchError}</p>
              </motion.div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Found <span className="font-semibold text-gray-900">{donors.length}</span> donors
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Updated 2 minutes ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donors Grid */}
      <section className="pb-16">
        <div className="container-custom">
          {loading || isSearching ? (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blood-crimson mb-4"></div>
              <p className="text-gray-600">{loading ? 'Loading donors...' : 'Searching...'}</p>
            </div>
          ) : donors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {donors.map((donor, index) => (
                <motion.div
                  key={donor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DonorCard donor={donor} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <User className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold font-montserrat text-gray-900 mb-4">No Donors Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We couldn't find any donors matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <CustomButton variant="primary" onClick={clearFilters}>
                Clear All Filters
              </CustomButton>
            </div>
          )}
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="section-padding bg-blood-deep text-white">
        <div className="container-custom">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-8"
            >
              <Phone className="h-10 w-10 text-white animate-pulse" />
            </motion.div>

            <h2 className="text-4xl lg:text-5xl font-bold font-montserrat mb-6">Emergency Blood Needed?</h2>

            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
              For urgent blood requirements, call our 24/7 emergency hotline. We'll connect you with the nearest
              available donors immediately.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <CustomButton
                variant="secondary"
                size="lg"
                className="bg-white text-blood-deep hover:bg-gray-100"
                icon={Phone}
              >
                Call Emergency Line
              </CustomButton>

              <div className="flex items-center space-x-2 text-white/80">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Available 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FindDonors
