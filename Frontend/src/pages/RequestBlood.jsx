"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { motion, AnimatePresence } from "framer-motion"
import { gsap } from "gsap"
import {
  Droplets, MapPin, Phone, Mail, Calendar, Clock, Heart, User, FileText,
  Hospital, AlertTriangle, Upload, UserCheck, Users, CheckCircle, Copy
} from "lucide-react"
import FormInput from "../components/FormInput"
import CustomButton from "../components/CustomButton"
import { requestService } from "../services/requestService"
import { bloodBankService } from "../services/bloodBankService"
import { useAuth } from "../hooks/useAuth"

// Schema for "someone else" mode (all fields required)
const otherSchema = yup.object({
  patientName: yup.string().required("Patient name is required"),
  bloodType: yup.string().required("Blood type is required"),
  unitsNeeded: yup.number().required("Units required").min(1).max(10),
  bloodBankId: yup.string().required("Please select a blood bank / hospital"),
  patientAge: yup.number().required("Patient age is required").min(1).max(120),
  patientGender: yup.string().required("Gender is required"),
  contactPhone: yup.string().required("Contact number is required").matches(/^[0-9]{10}$/, "Phone must be 10 digits"),
  emergencyLevel: yup.string().required("Emergency level is required"),
  location: yup.string().required("Location is required"),
  medicalNote: yup.string(),
  requiredBeforeDate: yup.string().required("Required before date is needed"),
})

// Schema for "myself" mode (fewer fields — name/blood from user)
const selfSchema = yup.object({
  bloodType: yup.string().required("Blood type is required"),
  unitsNeeded: yup.number().required("Units required").min(1).max(10),
  bloodBankId: yup.string().required("Please select a blood bank / hospital"),
  emergencyLevel: yup.string().required("Emergency level is required"),
  location: yup.string(),
  medicalNote: yup.string(),
  requiredBeforeDate: yup.string().required("Required before date is needed"),
})

const RequestBlood = () => {
  const { user, isAuthenticated } = useAuth()
  const [requestType, setRequestType] = useState(null) // 'self' | 'other'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [generatedRequestId, setGeneratedRequestId] = useState("")
  const [bloodBanks, setBloodBanks] = useState([])
  const [loadingBanks, setLoadingBanks] = useState(true)
  const [prescriptionFile, setPrescriptionFile] = useState(null)
  const [copied, setCopied] = useState(false)

  const schema = requestType === "self" ? selfSchema : otherSchema

  const {
    register, handleSubmit, formState: { errors }, reset, setValue, watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { unitsNeeded: 1, emergencyLevel: "medium" }
  })

  const emergencyLevel = watch("emergencyLevel")

  useEffect(() => {
    gsap.fromTo(".request-form", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
    fetchBloodBanks()
  }, [])

  // Auto-fill fields when requestType is "self"
  useEffect(() => {
    if (requestType === "self" && user) {
      setValue("bloodType", user.bloodType || "")
      setValue("location", `${user.city || ""}, ${user.state || ""}`.trim())
    }
  }, [requestType, user, setValue])

  const fetchBloodBanks = async () => {
    try {
      setLoadingBanks(true)
      const response = await bloodBankService.getAllBloodBanks()
      if (response.success) setBloodBanks(response.data)
    } catch (error) {
      console.error("Error fetching blood banks:", error)
    } finally {
      setLoadingBanks(false)
    }
  }

  const calculateAge = (dob) => {
    if (!dob) return null
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()

      formData.append("requestType", requestType)
      formData.append("bloodType", data.bloodType)
      formData.append("unitsNeeded", data.unitsNeeded)
      formData.append("bloodBankId", data.bloodBankId)
      formData.append("emergencyLevel", data.emergencyLevel)
      formData.append("urgency", data.emergencyLevel) // map to existing field
      formData.append("requiredBeforeDate", data.requiredBeforeDate)
      formData.append("neededBy", data.requiredBeforeDate)
      formData.append("medicalNote", data.medicalNote || "")
      formData.append("medicalCondition", data.medicalNote || "")

      if (requestType === "self") {
        formData.append("patientName", `${user.firstName} ${user.lastName}`)
        formData.append("contactPhone", user.phone || "")
        formData.append("contactEmail", user.email || "")
        formData.append("contactName", `${user.firstName} ${user.lastName}`)
        formData.append("patientAge", calculateAge(user.dateOfBirth) || "")
        formData.append("location", data.location || `${user.city}, ${user.state}`)
      } else {
        formData.append("patientName", data.patientName)
        formData.append("patientAge", data.patientAge)
        formData.append("patientGender", data.patientGender)
        formData.append("contactPhone", data.contactPhone)
        formData.append("contactEmail", user?.email || "")
        formData.append("contactName", data.patientName)
        formData.append("location", data.location)
      }

      if (prescriptionFile) {
        formData.append("prescription", prescriptionFile)
      }

      const response = await requestService.createRequestWithPrescription(formData)

      if (response.success) {
        setGeneratedRequestId(response.data.requestId)
        setSubmitSuccess(true)
        reset()
        setPrescriptionFile(null)
      }
    } catch (error) {
      console.error("Error submitting request:", error)
      alert("Failed to submit request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getEmergencyColor = (level) => {
    const colors = {
      critical: "text-red-700 bg-red-100 border-red-300",
      high: "text-orange-700 bg-orange-100 border-orange-300",
      medium: "text-yellow-700 bg-yellow-100 border-yellow-300",
      low: "text-green-700 bg-green-100 border-green-300",
    }
    return colors[level] || colors.medium
  }

  const copyRequestId = () => {
    navigator.clipboard.writeText(generatedRequestId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // --- SUCCESS SCREEN ---
  if (submitSuccess) {
    return (
      <div className="pt-20 section-padding min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg mx-auto text-center relative overflow-hidden"
        >
          {/* Animated confetti dots */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 8 + 4,
                height: Math.random() * 8 + 4,
                background: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"][i % 5],
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [0, -40] }}
              transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatDelay: 3 }}
            />
          ))}

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <CheckCircle className="h-10 w-10 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold font-montserrat text-gray-900 mb-3"
          >
            Request Submitted!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600 mb-6"
          >
            Your blood request has been submitted and is under review.
          </motion.p>

          {/* Request ID */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-50 rounded-xl p-4 mb-6 border-2 border-dashed border-gray-300"
          >
            <p className="text-sm text-gray-500 mb-1">Your Request ID</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold font-mono text-blood-crimson tracking-wider">
                {generatedRequestId}
              </span>
              <button
                onClick={copyRequestId}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy Request ID"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3">
            <CustomButton
              variant="outline"
              onClick={() => { setSubmitSuccess(false); setRequestType(null) }}
              className="flex-1"
            >
              Submit Another Request
            </CustomButton>
            <CustomButton
              variant="primary"
              onClick={() => window.location.href = "/my-blood-requests"}
              className="flex-1"
            >
              View My Requests
            </CustomButton>
          </div>
        </motion.div>
      </div>
    )
  }

  // --- LOGIN CHECK ---
  if (!isAuthenticated) {
    return (
      <div className="pt-20 section-padding min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Login Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to request blood.</p>
          <CustomButton variant="primary" onClick={() => window.location.href = "/login"}>
            Login Now
          </CustomButton>
        </div>
      </div>
    )
  }

  // --- TYPE SELECTION ---
  if (!requestType) {
    return (
      <div className="pt-20 section-padding min-h-screen">
        <div className="container-custom">
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
              Who is this blood request for?
            </motion.p>
          </div>

          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Request for Myself */}
            <motion.button
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRequestType("self")}
              className="bg-white rounded-2xl shadow-xl p-8 text-left border-2 border-transparent hover:border-blood-crimson transition-all duration-300 group cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blood-crimson to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Request for Myself</h3>
              <p className="text-gray-600 mb-4">
                Your registered details will be auto-filled. Quick and easy!
              </p>
              <div className="flex flex-wrap gap-2">
                {["Auto-fill data", "Quick process", "Edit if needed"].map(tag => (
                  <span key={tag} className="text-xs bg-red-50 text-blood-crimson px-3 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>

            {/* Request for Someone Else */}
            <motion.button
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRequestType("other")}
              className="bg-white rounded-2xl shadow-xl p-8 text-left border-2 border-transparent hover:border-blue-500 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Request for Someone Else</h3>
              <p className="text-gray-600 mb-4">
                Fill in the patient&apos;s details manually for someone in need.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Manual entry", "Full form", "Upload prescription"].map(tag => (
                  <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  // --- FORM ---
  return (
    <div className="pt-20 section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-montserrat text-gradient mb-4"
          >
            Request Blood
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              requestType === "self"
                ? "bg-red-100 text-blood-crimson"
                : "bg-blue-100 text-blue-700"
            }`}>
              {requestType === "self" ? <UserCheck className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              {requestType === "self" ? "Requesting for Myself" : "Requesting for Someone Else"}
            </span>
            <button
              onClick={() => { setRequestType(null); reset() }}
              className="text-sm text-gray-500 hover:text-blood-crimson underline"
            >
              Change
            </button>
          </motion.div>
        </div>

        {/* Form Card */}
        <motion.div className="request-form max-w-4xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blood-deep to-blood-crimson p-6">
              <h2 className="text-2xl font-bold text-white font-montserrat flex items-center">
                <Droplets className="h-6 w-6 mr-3" />
                Blood Request Form
              </h2>
              <p className="text-red-100 mt-2">
                {requestType === "self"
                  ? "Your registered details are pre-filled. Edit if necessary."
                  : "Please fill in all patient details carefully."}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">

              {/* Self: User Info Preview */}
              {requestType === "self" && user && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-gray-50 to-red-50 rounded-xl p-6 border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-blood-crimson" />
                    Your Details (Auto-filled)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Name</span>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email</span>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone</span>
                      <p className="font-medium">{user.phone || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Age</span>
                      <p className="font-medium">{calculateAge(user.dateOfBirth) || "—"}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Patient Info (only for "other") */}
              {requestType === "other" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold font-montserrat text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blood-crimson" />
                    Patient Information
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
                      label="Contact Number"
                      type="tel"
                      placeholder="9876543210"
                      icon={Phone}
                      required
                      error={errors.contactPhone?.message}
                      {...register("contactPhone")}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <FormInput
                      label="Patient Age"
                      type="number"
                      min="1"
                      max="120"
                      icon={User}
                      required
                      error={errors.patientAge?.message}
                      {...register("patientAge")}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient Gender <span className="text-blood-crimson">*</span>
                      </label>
                      <select
                        {...register("patientGender")}
                        className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson py-3 px-3 ${errors.patientGender ? "border-red-500" : ""}`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.patientGender && <p className="text-sm text-red-600 mt-1">{errors.patientGender.message}</p>}
                    </div>
                    <FormInput
                      label="Location"
                      icon={MapPin}
                      required
                      placeholder="City, State"
                      error={errors.location?.message}
                      {...register("location")}
                    />
                  </div>
                </div>
              )}

              {/* Blood Requirements */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold font-montserrat text-gray-900 flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-blood-crimson" />
                  Blood Requirements
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group Required <span className="text-blood-crimson">*</span>
                    </label>
                    <select
                      {...register("bloodType")}
                      className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson py-3 px-3 ${errors.bloodType ? "border-red-500" : ""}`}
                    >
                      <option value="">Select Blood Type</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bt => (
                        <option key={bt} value={bt}>{bt}</option>
                      ))}
                    </select>
                    {errors.bloodType && <p className="text-sm text-red-600 mt-1">{errors.bloodType.message}</p>}
                  </div>

                  <FormInput
                    label="Units Required"
                    type="number"
                    min="1"
                    max="10"
                    icon={Droplets}
                    required
                    error={errors.unitsNeeded?.message}
                    {...register("unitsNeeded")}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Level <span className="text-blood-crimson">*</span>
                    </label>
                    <select
                      {...register("emergencyLevel")}
                      className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson py-3 px-3 ${errors.emergencyLevel ? "border-red-500" : ""}`}
                    >
                      <option value="low">Low — Within 1 week</option>
                      <option value="medium">Medium — Within 3 days</option>
                      <option value="high">High — Within 24 hours</option>
                      <option value="critical">Critical — Immediate</option>
                    </select>
                    {emergencyLevel && (
                      <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 border ${getEmergencyColor(emergencyLevel)}`}>
                        {emergencyLevel === "critical" && <AlertTriangle className="h-3 w-3" />}
                        {emergencyLevel.charAt(0).toUpperCase() + emergencyLevel.slice(1)} Priority
                      </div>
                    )}
                    {errors.emergencyLevel && <p className="text-sm text-red-600 mt-1">{errors.emergencyLevel.message}</p>}
                  </div>
                </div>
              </div>

              {/* Hospital / Blood Bank Selection */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold font-montserrat text-gray-900 flex items-center">
                  <Hospital className="h-5 w-5 mr-2 text-blood-crimson" />
                  Hospital / Blood Bank
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Hospital / Blood Bank <span className="text-blood-crimson">*</span>
                  </label>
                  <select
                    {...register("bloodBankId")}
                    className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson py-3 px-3 ${errors.bloodBankId ? "border-red-500" : ""}`}
                    disabled={loadingBanks}
                  >
                    <option value="">
                      {loadingBanks ? "Loading hospitals..." : "Select a hospital / blood bank"}
                    </option>
                    {bloodBanks.map((bank) => (
                      <option key={bank._id} value={bank._id}>
                        {bank.name} — {bank.address?.city || bank.city || ""}, {bank.address?.state || bank.state || ""} {bank.address?.street ? `(${bank.address.street})` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.bloodBankId && <p className="text-sm text-red-600 mt-1">{errors.bloodBankId.message}</p>}
                </div>

                <FormInput
                  label="Required Before Date"
                  type="datetime-local"
                  icon={Calendar}
                  required
                  error={errors.requiredBeforeDate?.message}
                  {...register("requiredBeforeDate")}
                />
              </div>

              {/* Self: location override */}
              {requestType === "self" && (
                <FormInput
                  label="Location (auto-filled, edit if needed)"
                  icon={MapPin}
                  error={errors.location?.message}
                  {...register("location")}
                />
              )}

              {/* Medical Note */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold font-montserrat text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blood-crimson" />
                  Medical Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Note</label>
                  <textarea
                    {...register("medicalNote")}
                    rows={3}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson py-3 px-3"
                    placeholder="Any medical notes, conditions, or special requirements..."
                  />
                </div>

                {/* Prescription Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Prescription <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blood-crimson transition-colors cursor-pointer"
                    onClick={() => document.getElementById("prescription-upload").click()}
                  >
                    <input
                      id="prescription-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => setPrescriptionFile(e.target.files[0])}
                    />
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    {prescriptionFile ? (
                      <p className="text-sm text-blood-crimson font-medium">{prescriptionFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">Click to upload or drag & drop</p>
                        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, PDF — Max 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6 border-t flex flex-col sm:flex-row gap-4">
                <CustomButton
                  type="button"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => { setRequestType(null); reset() }}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  disabled={isSubmitting}
                  icon={isSubmitting ? Clock : Heart}
                >
                  {isSubmitting ? "Submitting Request..." : "Submit Request"}
                </CustomButton>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RequestBlood
