"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { Search, MapPin, Navigation, Droplets, Filter } from "lucide-react"
import BloodBankCard from "../components/BloodBankCard"
import CustomButton from "../components/CustomButton"
import FormInput from "../components/FormInput"

const BloodBanks = () => {
  const [bloodBanks, setBloodBanks] = useState([])
  const [filteredBloodBanks, setFilteredBloodBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBloodType, setSelectedBloodType] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [userLocation, setUserLocation] = useState(null)

  // Mock data for demonstration
  const mockBloodBanks = [
    {
      id: 1,
      name: "City General Hospital Blood Bank",
      address: "123 Medical Center Dr",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
      distance: 2.3,
      phone: "(555) 123-4567",
      email: "bloodbank@citygeneral.org",
      website: "https://citygeneral.org/bloodbank",
      operatingHours: "Mon-Fri: 7:00 AM - 6:00 PM, Sat: 8:00 AM - 4:00 PM",
      isOpen: true,
      rating: 4.8,
      reviewCount: 127,
      specialServices: "24/7 emergency blood supply, Rare blood types available",
      bloodStock: {
        "O+": 45,
        "O-": 12,
        "A+": 38,
        "A-": 8,
        "B+": 22,
        "B-": 5,
        "AB+": 15,
        "AB-": 3,
      },
    },
    {
      id: 2,
      name: "Regional Medical Center Blood Services",
      address: "456 Healthcare Blvd",
      city: "Springfield",
      state: "IL",
      zipCode: "62702",
      distance: 4.7,
      phone: "(555) 987-6543",
      email: "blood@regionalmedical.org",
      website: "https://regionalmedical.org/blood-services",
      operatingHours: "Mon-Sat: 6:00 AM - 8:00 PM, Sun: 8:00 AM - 4:00 PM",
      isOpen: true,
      rating: 4.6,
      reviewCount: 89,
      specialServices: "Platelet donation, Plasma collection, Mobile blood drives",
      bloodStock: {
        "O+": 67,
        "O-": 23,
        "A+": 41,
        "A-": 15,
        "B+": 29,
        "B-": 8,
        "AB+": 18,
        "AB-": 6,
      },
    },
    {
      id: 3,
      name: "Community Blood Center in New City",
      address: "789 Donor Way",
      city: "Springfield",
      state: "IL",
      zipCode: "62703",
      distance: 6.1,
      phone: "(555) 456-7890",
      email: "info@communityblood.org",
      website: "https://communityblood.org",
      operatingHours: "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 3:00 PM",
      isOpen: false,
      rating: 4.4,
      reviewCount: 156,
      specialServices: "Cord blood banking, Bone marrow registry, Educational programs",
      bloodStock: {
        "O+": 28,
        "O-": 7,
        "A+": 19,
        "A-": 4,
        "B+": 13,
        "B-": 2,
        "AB+": 8,
        "AB-": 1,
      },
    },
  ]

  useEffect(() => {
    gsap.fromTo(".bloodbanks-header", { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
    gsap.fromTo(
      ".bloodbanks-content",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" },
    )

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Location access denied")
        },
      )
    }

    // Simulate API call
    setTimeout(() => {
      setBloodBanks(mockBloodBanks)
      setFilteredBloodBanks(mockBloodBanks)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = bloodBanks

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (bank) =>
          bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bank.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bank.city.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by blood type availability
    if (selectedBloodType) {
      filtered = filtered.filter((bank) => {
        const stock = bank.bloodStock[selectedBloodType]
        return stock && stock > 0
      })
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter(
        (bank) =>
          bank.city.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          bank.state.toLowerCase().includes(selectedLocation.toLowerCase()),
      )
    }

    setFilteredBloodBanks(filtered)
  }, [bloodBanks, searchTerm, selectedBloodType, selectedLocation])

  const findNearbyBloodBanks = () => {
    if (userLocation) {
      // In a real app, this would call the API with user coordinates
      alert("Finding blood banks near your location...")
    } else {
      alert("Please enable location access to find nearby blood banks")
    }
  }

  return (
    <div className="pt-28 section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="bloodbanks-header text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-montserrat text-gradient mb-4"
          >
            Blood Banks
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Find blood banks near you and check real-time blood availability for all blood types.
          </motion.p>
        </div>

        {/* Filters and Search */}
        <div className="bloodbanks-content mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="grid md:grid-cols-5 gap-4">
              {/* Search */}
              <FormInput
                placeholder="Search blood banks..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Blood Type Filter */}
              <div>
                <select
                  value={selectedBloodType}
                  onChange={(e) => setSelectedBloodType(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson py-3 px-3"
                >
                  <option value="">All Blood Types</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              {/* Location Filter */}
              <FormInput
                placeholder="Filter by location..."
                icon={MapPin}
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              />

              {/* Find Nearby Button */}
              <CustomButton variant="outline" icon={Navigation} onClick={findNearbyBloodBanks}>
                Find Nearby
              </CustomButton>

              {/* Clear Filters */}
              <CustomButton
                variant="ghost"
                icon={Filter}
                onClick={() => {
                  setSearchTerm("")
                  setSelectedBloodType("")
                  setSelectedLocation("")
                }}
              >
                Clear Filters
              </CustomButton>
            </div>
          </div>
        </div>

        {/* Blood Banks Grid */}
        <div className="bloodbanks-content">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg animate-pulse">
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBloodBanks.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredBloodBanks.map((bloodBank, index) => (
                <motion.div
                  key={bloodBank.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BloodBankCard bloodBank={bloodBank} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <Droplets className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Blood Banks Found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedLocation || selectedBloodType
                  ? "Try adjusting your search criteria"
                  : "No blood banks match your current filters"}
              </p>
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="mt-16">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold font-montserrat text-red-800 mb-4">Emergency Blood Need?</h2>
            <p className="text-red-700 mb-6">
              If you have an urgent need for blood, contact our emergency hotline immediately.
            </p>
            <CustomButton variant="primary" size="lg" onClick={() => window.open("tel:911")}>
              Call Emergency: 911
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BloodBanks
