"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Heart, Menu, X, User, LogOut, Shield } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  
  // Check if we're on homepage for special styling
  const isHomePage = location.pathname === "/"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Different navigation for admin and regular users
  const getNavLinks = () => {
    if (isAuthenticated && user?.role === 'admin') {
      return [
        { name: "Dashboard", path: "/admin-dashboard" },
        { name: "Users", path: "/admin/users" },
        { name: "Messages", path: "/admin/contact-messages" },
        { name: "Events", path: "/admin/events" },
        { name: "Analytics", path: "/admin/analytics" },
      ]
    }
    
    return [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
      { name: "Find Donors", path: "/find-donors" },
      { name: "Blood Banks", path: "/blood-banks" },
      { name: "Events", path: "/events" },
      { name: "Contact", path: "/contact" },
    ]
  }

  const navLinks = getNavLinks()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled || !isHomePage
          ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50" 
          : "bg-black/30 backdrop-blur-md"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group transition-all duration-300 hover:scale-105">
            <Heart
              className={`h-8 w-8 transition-all duration-300 ${
                isScrolled || !isHomePage ? "text-blood-deep" : "text-white"
              } group-hover:text-blood-crimson fill-current drop-shadow-lg`}
            />
            <span
              className={`text-xl font-bold font-montserrat transition-all duration-300 ${
                isScrolled || !isHomePage ? "text-gray-900" : "text-white"
              } group-hover:text-blood-crimson drop-shadow-sm`}
            >
              Blood Donor Network
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Admin Badge */}
            {isAuthenticated && user?.role === 'admin' && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 rounded-full">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Admin Mode</span>
              </div>
            )}
            
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative font-medium transition-all duration-300 hover:scale-105 group ${
                  location.pathname === link.path 
                    ? "text-blood-crimson" 
                    : isScrolled || !isHomePage
                      ? "text-gray-800 hover:text-blood-crimson" 
                      : "text-white hover:text-pink-200"
                }`}
              >
                {link.name}
                {/* Active indicator */}
                <span 
                  className={`absolute -bottom-1 left-0 w-full h-0.5 bg-blood-crimson transition-transform duration-300 ${
                    location.pathname === link.path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.role === 'admin' ? (
                  <>
                    <Link
                      to="/admin/profile"
                      className={`flex items-center space-x-2 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg ${
                        isScrolled || !isHomePage
                          ? "text-gray-800 hover:text-blood-crimson hover:bg-gray-100" 
                          : "text-white hover:text-pink-200 hover:bg-white/10"
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span>{user?.firstName || "Profile"}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center space-x-2 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg ${
                        isScrolled || !isHomePage
                          ? "text-gray-800 hover:text-red-600 hover:bg-red-50" 
                          : "text-white hover:text-pink-200 hover:bg-white/10"
                      }`}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      className={`flex items-center space-x-2 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg ${
                        isScrolled || !isHomePage
                          ? "text-gray-800 hover:text-blood-crimson hover:bg-gray-100" 
                          : "text-white hover:text-pink-200 hover:bg-white/10"
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span>{user?.firstName || "Dashboard"}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center space-x-2 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg ${
                        isScrolled || !isHomePage
                          ? "text-gray-800 hover:text-red-600 hover:bg-red-50" 
                          : "text-white hover:text-pink-200 hover:bg-white/10"
                      }`}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`font-medium transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg ${
                    isScrolled || !isHomePage
                      ? "text-gray-800 hover:text-blood-crimson hover:bg-gray-100" 
                      : "text-white hover:text-pink-200 hover:bg-white/10"
                  }`}
                >
                  Login
                </Link>
                <Link 
                  to="/become-donor" 
                  className={`btn-primary transition-all duration-300 hover:scale-105 shadow-lg ${
                    isScrolled || !isHomePage ? "hover:shadow-xl" : "hover:shadow-2xl"
                  }`}
                >
                  Become Donor
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
              isScrolled || !isHomePage
                ? "text-gray-800 hover:text-blood-crimson hover:bg-gray-100" 
                : "text-white hover:text-pink-200 hover:bg-white/10"
            }`}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-xl"
          >
            <div className="px-4 py-6 space-y-4">
              {/* Admin Badge for Mobile */}
              {isAuthenticated && user?.role === 'admin' && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-purple-100 rounded-lg">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Admin Mode Active</span>
                </div>
              )}
              
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block font-medium transition-colors hover:text-blood-crimson ${
                    location.pathname === link.path ? "text-blood-crimson" : "text-gray-700"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 border-t space-y-4">
                {isAuthenticated ? (
                  <>
                    {user?.role === 'admin' ? (
                      <>
                        <Link
                          to="/admin/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-2 text-gray-700 hover:text-blood-crimson font-medium"
                        >
                          <User className="h-4 w-4" />
                          <span>{user?.firstName || "Profile"}</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 text-gray-700 hover:text-blood-crimson font-medium"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-2 text-gray-700 hover:text-blood-crimson font-medium"
                        >
                          <User className="h-4 w-4" />
                          <span>{user?.firstName || "Dashboard"}</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 text-gray-700 hover:text-blood-crimson font-medium"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block text-gray-700 hover:text-blood-crimson font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/become-donor"
                      onClick={() => setIsOpen(false)}
                      className="btn-primary inline-block text-center"
                    >
                      Become Donor
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar
