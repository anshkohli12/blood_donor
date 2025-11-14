"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  User,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Heart
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import CustomButton from "../components/CustomButton"
import FormInput from "../components/FormInput"
import { contactService } from "../services/contactService"
import { useAuth } from "../hooks/useAuth"

const Contact = () => {
  const { user, isAuthenticated } = useAuth()
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Auto-populate form with user data when logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || ""
      }))
    }
  }, [isAuthenticated, user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await contactService.submitContactForm(formData)
      setSuccess(true)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      })
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: "+1 (555) 123-BLOOD",
      subtitle: "Mon-Fri 9AM-6PM"
    },
    {
      icon: Mail,
      title: "Email",
      details: "help@blooddonornetwork.org",
      subtitle: "We'll respond within 24 hours"
    },
    {
      icon: MapPin,
      title: "Address",
      details: "123 Life Saver Street",
      subtitle: "Hope City, HC 12345"
    },
    {
      icon: Clock,
      title: "Emergency",
      details: "24/7 Blood Emergency",
      subtitle: "Call: +1 (555) 911-HELP"
    }
  ]

  if (success) {
    return (
      <div className="pt-32 section-padding bg-gray-50 min-h-screen">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for contacting us. We've received your message and will get back to you within 24 hours.
                You can check the status and view responses on your messages page.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/my-messages">
                  <CustomButton
                    variant="primary"
                    icon={MessageSquare}
                  >
                    View My Messages
                  </CustomButton>
                </Link>
                <CustomButton
                  onClick={() => setSuccess(false)}
                  variant="outline"
                >
                  Send Another Message
                </CustomButton>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-32 section-padding bg-gray-50 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold font-montserrat text-gradient mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Get in touch with our team. We're here to help you save lives and make a difference in your community.
          </p>
          <Link
            to="/my-messages"
            className="inline-flex items-center gap-2 text-blood-crimson hover:text-blood-light transition-colors font-medium"
          >
            <MessageSquare className="h-5 w-5" />
            View Your Messages & Responses
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-blood-crimson" />
                  <span>Get in Touch</span>
                </CardTitle>
                <CardDescription>
                  We're here to help with any questions about blood donation, our services, or how you can get involved.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <motion.div
                      key={info.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start space-x-4"
                    >
                      <div className="w-12 h-12 bg-blood-crimson/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-blood-crimson" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{info.title}</h3>
                        <p className="text-gray-700 font-medium">{info.details}</p>
                        <p className="text-sm text-gray-500">{info.subtitle}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Emergency Notice */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-2">Blood Emergency?</h3>
                      <p className="text-sm text-red-700 mb-3">
                        For urgent blood requirements, please call our 24/7 emergency hotline.
                      </p>
                      <CustomButton
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        size="sm"
                      >
                        Call Emergency Line
                      </CustomButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5 text-blood-crimson" />
                  <span>Send us a Message</span>
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                  {isAuthenticated && (
                    <span className="block mt-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                      ✓ Your contact details have been automatically filled from your account
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormInput
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        icon={User}
                        placeholder="Enter your first name"
                        className={isAuthenticated && user?.firstName ? "bg-green-50 border-green-200" : ""}
                      />
                      {isAuthenticated && user?.firstName && (
                        <p className="text-xs text-green-600 mt-1">Auto-filled from your profile</p>
                      )}
                    </div>
                    <div>
                      <FormInput
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        icon={User}
                        placeholder="Enter your last name"
                        className={isAuthenticated && user?.lastName ? "bg-green-50 border-green-200" : ""}
                      />
                      {isAuthenticated && user?.lastName && (
                        <p className="text-xs text-green-600 mt-1">Auto-filled from your profile</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormInput
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        icon={Mail}
                        placeholder="Enter your email"
                        className={isAuthenticated && user?.email ? "bg-green-50 border-green-200" : ""}
                      />
                      {isAuthenticated && user?.email && (
                        <p className="text-xs text-green-600 mt-1">Auto-filled from your profile</p>
                      )}
                    </div>
                    <div>
                      <FormInput
                        label="Phone Number (Optional)"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        icon={Phone}
                        placeholder="Enter your phone number"
                        className={isAuthenticated && user?.phone ? "bg-green-50 border-green-200" : ""}
                      />
                      {isAuthenticated && user?.phone && (
                        <p className="text-xs text-green-600 mt-1">Auto-filled from your profile</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <FormInput
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    icon={MessageSquare}
                    placeholder="What is this regarding?"
                  />

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson resize-none"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <CustomButton
                    type="submit"
                    variant="primary"
                    loading={loading}
                    icon={Send}
                    className="w-full"
                  >
                    {loading ? "Sending Message..." : "Send Message"}
                  </CustomButton>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Contact
