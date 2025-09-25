"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { useEffect } from "react"
import { Droplets, MapPin, Phone, Mail, Calendar, Clock, Heart, User, FileText, Hospital } from "lucide-react"
import FormInput from "../components/FormInput"
import CustomButton from "../components/CustomButton"
import { requestService } from "../services/requestService"
import { useAuth } from "../hooks/useAuth"

const schema = yup.object({
  bloodType: yup.string().required("Blood type is required"),
  urgency: yup.string().required("Urgency level is required"),
  unitsNeeded: yup
    .number()
    .required("Number of units is required")
    .min(1, "At least 1 unit is required")
    .max(10, "Maximum 10 units allowed"),
  hospitalName: yup.string().required("Hospital name is required"),
  hospitalAddress: yup.string().required("Hospital address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  zipCode: yup
    .string()
    .required("ZIP code is required")
    .matches(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  patientName: yup.string().required("Patient name is required"),
  contactName: yup.string().required("Contact person name is required"),
  contactPhone: yup
    .string()
    .required("Contact phone is required")
    .matches(/^$$\d{3}$$ \d{3}-\d{4}$/, "Phone format: (123) 456-7890"),
  contactEmail: yup.string().required("Contact email is required").email("Invalid email format"),
  medicalCondition: yup.string().required("Medical condition is required"),
  additionalNotes: yup.string(),
  neededBy: yup.date().required("Date needed is required").min(new Date(), "Date must be in the future"),
})

const RequestBlood = () => {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      urgency: "medium",
      unitsNeeded: 1,
    },
  })

  const urgency = watch("urgency")

  useEffect(() => {
    gsap.fromTo(".request-form", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
  }, [])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await requestService.createRequest({
        ...data,
        requesterId: user?.id,
        status: "active",
        createdAt: new Date().toISOString(),
      })
      setSubmitSuccess(true)
      reset()

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (error) {
      console.error("Error submitting request:", error)
      alert("Failed to submit request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, "")
    const phoneNumberLength = phoneNumber.length
    if (phoneNumberLength < 4) return phoneNumber
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  const getUrgencyColor = (level) => {
    switch (level) {
      case "critical":
        return "text-red-600 bg-red-100"
      case "high":
        return "text-orange-600 bg-orange-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "low":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (submitSuccess) {
    return (
      <div className="pt-20 section-padding min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold font-montserrat text-gray-900 mb-4">Request Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your blood request has been posted. Donors in your area will be notified and can contact you directly.
          </p>
          <CustomButton variant="primary" onClick={() => setSubmitSuccess(false)}>
            Submit Another Request
          </CustomButton>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-20 section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-montserrat text-gradient mb-4"
          >
            Request Blood
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Submit a blood request and connect with donors in your area. Every request helps save lives.
          </motion.p>
        </div>

        {/* Request Form */}
        <motion.div className="request-form max-w-4xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blood-deep to-blood-crimson p-6">
              <h2 className="text-2xl font-bold text-white font-montserrat flex items-center">
                <Droplets className="h-6 w-6 mr-3" />
                Blood Request Form
              </h2>
              <p className="text-red-100 mt-2">
                Please fill out all required information to help us connect you with donors quickly.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
              {/* Blood Requirements */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold font-montserrat text-gray-900 flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-blood-crimson" />
                  Blood Requirements
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Type <span className="text-blood-crimson">*</span>
                    </label>
                    <select
                      {...register("bloodType")}
                      className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson py-3 px-3 ${
                        errors.bloodType ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                    {errors.bloodType && <p className="text-sm text-red-600 mt-1">{errors.bloodType.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level <span className="text-blood-crimson">*</span>
                    </label>
                    <select
                      {...register("urgency")}
                      className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson py-3 px-3 ${
                        errors.urgency ? "border-red-500" : ""
                      }`}
                    >
                      <option value="low">Low - Within 1 week</option>
                      <option value="medium">Medium - Within 3 days</option>
                      <option value="high">High - Within 24 hours</option>
                      <option value="critical">Critical - Immediate</option>
                    </select>
                    {urgency && (
                      <div
                        className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold inline-block ${getUrgencyColor(urgency)}`}
                      >
                        {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
                      </div>
                    )}
                    {errors.urgency && <p className="text-sm text-red-600 mt-1">{errors.urgency.message}</p>}
                  </div>

                  <FormInput
                    label="Units Needed"
                    type="number"
                    min="1"
                    max="10"
                    icon={Droplets}
                    required
                    error={errors.unitsNeeded?.message}
                    {...register("unitsNeeded")}
                  />
                </div>

                <FormInput
                  label="Date Needed By"
                  type="datetime-local"
                  icon={Calendar}
                  required
                  error={errors.neededBy?.message}
                  {...register("neededBy")}
                />
              </div>

              {/* Hospital Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold font-montserrat text-gray-900 flex items-center">
                  <Hospital className="h-5 w-5 mr-2 text-blood-crimson" />
                  Hospital Information
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormInput
                    label="Hospital Name"
                    icon={Hospital}
                    required
                    error={errors.hospitalName?.message}
                    {...register("hospitalName")}
                  />

                  <FormInput
                    label="Hospital Address"
                    icon={MapPin}
                    required
                    error={errors.hospitalAddress?.message}
                    {...register("hospitalAddress")}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <FormInput label="City" icon={MapPin} required error={errors.city?.message} {...register("city")} />

                  <FormInput label="State" required error={errors.state?.message} {...register("state")} />

                  <FormInput
                    label="ZIP Code"
                    placeholder="12345"
                    required
                    error={errors.zipCode?.message}
                    {...register("zipCode")}
                  />
                </div>
              </div>

              {/* Patient & Contact Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold font-montserrat text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blood-crimson" />
                  Patient & Contact Information
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormInput
                    label="Patient Name"
                    icon={User}
                    required
                    error={errors.patientName?.message}
                    {...register("patientName")}
                  />

                  <FormInput
                    label="Contact Person Name"
                    icon={User}
                    required
                    error={errors.contactName?.message}
                    {...register("contactName")}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormInput
                    label="Contact Phone"
                    type="tel"
                    placeholder="(123) 456-7890"
                    icon={Phone}
                    required
                    error={errors.contactPhone?.message}
                    {...register("contactPhone", {
                      onChange: (e) => {
                        e.target.value = formatPhoneNumber(e.target.value)
                      },
                    })}
                  />

                  <FormInput
                    label="Contact Email"
                    type="email"
                    icon={Mail}
                    required
                    error={errors.contactEmail?.message}
                    {...register("contactEmail")}
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold font-montserrat text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blood-crimson" />
                  Medical Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Condition/Reason for Blood Need <span className="text-blood-crimson">*</span>
                  </label>
                  <textarea
                    {...register("medicalCondition")}
                    rows={3}
                    className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson py-3 px-3 ${
                      errors.medicalCondition ? "border-red-500" : ""
                    }`}
                    placeholder="Please describe the medical condition or reason for blood transfusion..."
                  />
                  {errors.medicalCondition && (
                    <p className="text-sm text-red-600 mt-1">{errors.medicalCondition.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    {...register("additionalNotes")}
                    rows={3}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson py-3 px-3"
                    placeholder="Any additional information that might help donors..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <CustomButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                  icon={isSubmitting ? Clock : Heart}
                >
                  {isSubmitting ? "Submitting Request..." : "Submit Blood Request"}
                </CustomButton>

                <p className="text-sm text-gray-500 text-center mt-4">
                  By submitting this request, you agree to be contacted by potential donors and understand that this is
                  a public request for blood donation assistance.
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RequestBlood
