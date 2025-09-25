"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { motion } from "framer-motion"
import {
  Heart,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Droplets,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { donorService } from "../services/donorService"
import FormInput from "../components/FormInput"
import CustomButton from "../components/CustomButton"

const schema = yup.object({
  firstName: yup.string().required("First name is required").min(2, "First name must be at least 2 characters"),
  lastName: yup.string().required("Last name is required").min(2, "Last name must be at least 2 characters"),
  email: yup.string().email("Please enter a valid email address").required("Email is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  bloodType: yup.string().required("Blood type is required"),
  dateOfBirth: yup
    .date()
    .required("Date of birth is required")
    .max(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000), "You must be at least 18 years old"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  zipCode: yup
    .string()
    .required("ZIP code is required")
    .matches(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"),
  emergencyContact: yup.string().required("Emergency contact is required"),
  emergencyPhone: yup
    .string()
    .required("Emergency contact phone is required")
    .matches(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  medicalConditions: yup.string(),
  medications: yup.string(),
  lastDonation: yup.date().nullable(),
  agreeToTerms: yup.boolean().oneOf([true], "You must agree to the terms and conditions"),
  agreeToContact: yup.boolean().oneOf([true], "You must agree to be contacted for donations"),
})

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

const BecomeDonor = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [isAvailable, setIsAvailable] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  })

  const steps = [
    { number: 1, title: "Personal Information", icon: User },
    { number: 2, title: "Contact Details", icon: MapPin },
    { number: 3, title: "Medical Information", icon: Shield },
    { number: 4, title: "Confirmation", icon: CheckCircle },
  ]

  const benefits = [
    {
      icon: Heart,
      title: "Save Lives",
      description: "Each donation can save up to 3 lives",
    },
    {
      icon: Shield,
      title: "Health Check",
      description: "Free health screening with every donation",
    },
    {
      icon: Award,
      title: "Recognition",
      description: "Join our community of life-saving heroes",
    },
    {
      icon: Clock,
      title: "Flexible",
      description: "Donate when convenient for you",
    },
  ]

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await trigger(fieldsToValidate)

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const getFieldsForStep = (step) => {
    switch (step) {
      case 1:
        return ["firstName", "lastName", "email", "phone", "dateOfBirth"]
      case 2:
        return ["address", "city", "state", "zipCode", "emergencyContact", "emergencyPhone"]
      case 3:
        return ["bloodType", "medicalConditions", "medications", "lastDonation"]
      default:
        return []
    }
  }

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      setApiError("")

      const donorData = {
        ...data,
        name: `${data.firstName} ${data.lastName}`,
        isAvailable,
        isDonor: true,
        registrationDate: new Date().toISOString(),
      }

      if (isAuthenticated) {
        await donorService.updateDonorProfile(user.id, donorData)
      } else {
        // If not authenticated, redirect to register
        navigate("/register", { state: { donorData } })
        return
      }

      navigate("/dashboard", {
        state: {
          message: "Welcome to our donor community! Your profile has been created successfully.",
        },
      })
    } catch (error) {
      setApiError(error.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="First Name"
                type="text"
                icon={User}
                placeholder="Enter your first name"
                error={errors.firstName?.message}
                required
                {...register("firstName")}
              />

              <FormInput
                label="Last Name"
                type="text"
                icon={User}
                placeholder="Enter your last name"
                error={errors.lastName?.message}
                required
                {...register("lastName")}
              />
            </div>

            <FormInput
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="Enter your email"
              error={errors.email?.message}
              required
              {...register("email")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Phone Number"
                type="tel"
                icon={Phone}
                placeholder="Enter your phone number"
                error={errors.phone?.message}
                required
                {...register("phone")}
              />

              <FormInput
                label="Date of Birth"
                type="date"
                icon={Calendar}
                error={errors.dateOfBirth?.message}
                required
                {...register("dateOfBirth")}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <FormInput
              label="Street Address"
              type="text"
              icon={MapPin}
              placeholder="Enter your street address"
              error={errors.address?.message}
              required
              {...register("address")}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                label="City"
                type="text"
                icon={MapPin}
                placeholder="Enter your city"
                error={errors.city?.message}
                required
                {...register("city")}
              />

              <FormInput
                label="State"
                type="text"
                icon={MapPin}
                placeholder="Enter your state"
                error={errors.state?.message}
                required
                {...register("state")}
              />

              <FormInput
                label="ZIP Code"
                type="text"
                icon={MapPin}
                placeholder="Enter ZIP code"
                error={errors.zipCode?.message}
                required
                {...register("zipCode")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Emergency Contact Name"
                type="text"
                icon={User}
                placeholder="Emergency contact name"
                error={errors.emergencyContact?.message}
                required
                {...register("emergencyContact")}
              />

              <FormInput
                label="Emergency Contact Phone"
                type="tel"
                icon={Phone}
                placeholder="Emergency contact phone"
                error={errors.emergencyPhone?.message}
                required
                {...register("emergencyPhone")}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Blood Type
                <span className="text-blood-crimson ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Droplets className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className={`
                    block w-full rounded-lg border-gray-300 shadow-sm
                    focus:border-blood-crimson focus:ring-blood-crimson
                    pl-10 pr-3 py-3
                    ${errors.bloodType ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                    transition-colors duration-200
                  `}
                  {...register("bloodType")}
                >
                  <option value="">Select your blood type</option>
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {errors.bloodType && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600"
                >
                  {errors.bloodType.message}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Medical Conditions
                <span className="text-gray-500 ml-1">(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="List any medical conditions or allergies"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson transition-colors duration-200"
                {...register("medicalConditions")}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Current Medications
                <span className="text-gray-500 ml-1">(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="List any medications you're currently taking"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson transition-colors duration-200"
                {...register("medications")}
              />
            </div>

            <FormInput
              label="Last Blood Donation"
              type="date"
              icon={Calendar}
              error={errors.lastDonation?.message}
              {...register("lastDonation")}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Medical Information Privacy</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your medical information is kept strictly confidential and is only used to ensure safe donation
                    practices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold font-montserrat text-gray-900 mb-4">Ready to Save Lives!</h3>
              <p className="text-gray-600 leading-relaxed">
                Please review your information and confirm your registration as a blood donor.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">
                    {getValues("firstName")} {getValues("lastName")}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Blood Type:</span>
                  <span className="ml-2 text-gray-900">{getValues("bloodType")}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">{getValues("email")}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">{getValues("phone")}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Address:</span>
                  <span className="ml-2 text-gray-900">
                    {getValues("address")}, {getValues("city")}, {getValues("state")} {getValues("zipCode")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  id="availability"
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="h-4 w-4 text-blood-crimson focus:ring-blood-crimson border-gray-300 rounded"
                />
                <label htmlFor="availability" className="text-sm text-gray-700">
                  I am currently available for blood donation requests
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-blood-crimson focus:ring-blood-crimson border-gray-300 rounded"
                  {...register("agreeToTerms")}
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                  I agree to the terms and conditions and understand that my information will be used to connect me with
                  blood recipients in need.
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-sm text-red-600 ml-7">{errors.agreeToTerms.message}</p>}

              <div className="flex items-start space-x-3">
                <input
                  id="agreeToContact"
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-blood-crimson focus:ring-blood-crimson border-gray-300 rounded"
                  {...register("agreeToContact")}
                />
                <label htmlFor="agreeToContact" className="text-sm text-gray-700">
                  I consent to being contacted via phone, email, or SMS for blood donation requests and updates.
                </label>
              </div>
              {errors.agreeToContact && <p className="text-sm text-red-600 ml-7">{errors.agreeToContact.message}</p>}
            </div>
          </div>
        )

      default:
        return null
    }
  }

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
              Become a <span className="text-pink-200">Life Saver</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 leading-relaxed mb-8">
              Join thousands of heroes who are making a difference. Your blood donation can save up to three lives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blood-deep to-blood-crimson rounded-full mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold font-montserrat text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Progress Steps */}
            <div className="bg-gray-50 px-8 py-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = currentStep === step.number
                  const isCompleted = currentStep > step.number

                  return (
                    <div key={step.number} className="flex items-center">
                      <div
                        className={`
                        flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                        ${
                          isActive
                            ? "bg-blood-crimson border-blood-crimson text-white"
                            : isCompleted
                              ? "bg-green-500 border-green-500 text-white"
                              : "bg-white border-gray-300 text-gray-400"
                        }
                      `}
                      >
                        {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                      </div>
                      <div className="ml-3 hidden md:block">
                        <p
                          className={`text-sm font-medium ${isActive ? "text-blood-crimson" : isCompleted ? "text-green-600" : "text-gray-500"}`}
                        >
                          Step {step.number}
                        </p>
                        <p
                          className={`text-xs ${isActive ? "text-blood-crimson" : isCompleted ? "text-green-600" : "text-gray-400"}`}
                        >
                          {step.title}
                        </p>
                      </div>

                      {index < steps.length - 1 && (
                        <div
                          className={`
                          hidden md:block w-16 h-0.5 mx-4 transition-all duration-300
                          ${isCompleted ? "bg-green-500" : "bg-gray-300"}
                        `}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{apiError}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <div>
                    {currentStep > 1 && (
                      <CustomButton type="button" variant="outline" onClick={prevStep}>
                        Previous
                      </CustomButton>
                    )}
                  </div>

                  <div>
                    {currentStep < 4 ? (
                      <CustomButton type="button" variant="primary" onClick={nextStep}>
                        Next Step
                      </CustomButton>
                    ) : (
                      <CustomButton
                        type="submit"
                        variant="primary"
                        loading={isLoading}
                        disabled={isLoading}
                        icon={Heart}
                      >
                        {isLoading ? "Registering..." : "Complete Registration"}
                      </CustomButton>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BecomeDonor
