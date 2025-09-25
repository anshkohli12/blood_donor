"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { motion } from "framer-motion"
import { User, Mail, Lock, Phone, MapPin, Calendar, Droplets, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAuth } from "../context/AuthContext"
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
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  bloodType: yup.string().required("Blood type is required"),
  dateOfBirth: yup
    .date()
    .required("Date of birth is required")
    .max(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000), "You must be at least 18 years old"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  agreeToTerms: yup.boolean().oneOf([true], "You must agree to the terms and conditions"),
})

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  })

  const password = watch("password")

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      setApiError("")

      const userData = {
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        bloodType: data.bloodType,
        dateOfBirth: data.dateOfBirth,
        city: data.city,
        state: data.state,
        isDonor: true,
        isAvailable: true,
      }

      await registerUser(userData)
      navigate("/dashboard")
    } catch (error) {
      setApiError(error.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" }

    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

    return {
      strength,
      label: labels[strength - 1] || "",
      color: colors[strength - 1] || "bg-gray-300",
    }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-montserrat text-gray-900 mb-2">Join Our Community</h2>
        <p className="text-gray-600">Create an account to start saving lives through blood donation</p>
      </div>

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 font-montserrat border-b border-gray-200 pb-2">Personal Information</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormInput
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="Enter your email"
              error={errors.email?.message}
              required
              {...register("email")}
            />

            <FormInput
              label="Phone Number"
              type="tel"
              icon={Phone}
              placeholder="Enter your phone number"
              error={errors.phone?.message}
              required
              {...register("phone")}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <option value="">Select blood type</option>
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

            <FormInput
              label="Date of Birth"
              type="date"
              icon={Calendar}
              error={errors.dateOfBirth?.message}
              required
              {...register("dateOfBirth")}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </div>
        </div>

        {/* Security */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 font-montserrat border-b border-gray-200 pb-2">Security</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Password
              <span className="text-blood-crimson ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                className={`
                  block w-full rounded-lg border-gray-300 shadow-sm
                  focus:border-blood-crimson focus:ring-blood-crimson
                  pl-10 pr-12 py-3
                  ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  transition-colors duration-200
                `}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>

            {password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                </div>
              </div>
            )}

            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600"
              >
                {errors.password.message}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
              <span className="text-blood-crimson ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className={`
                  block w-full rounded-lg border-gray-300 shadow-sm
                  focus:border-blood-crimson focus:ring-blood-crimson
                  pl-10 pr-12 py-3
                  ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  transition-colors duration-200
                `}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600"
              >
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-6">
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border">
            <input
              id="agreeToTerms"
              type="checkbox"
              className="mt-1 h-4 w-4 text-blood-crimson focus:ring-blood-crimson border-gray-300 rounded"
              {...register("agreeToTerms")}
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-relaxed">
              I agree to the{" "}
              <Link to="/terms" className="text-blood-crimson hover:underline font-medium">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-blood-crimson hover:underline font-medium">
                Privacy Policy
              </Link>
              , and I consent to being contacted for blood donation requests.
            </label>
          </div>
          {errors.agreeToTerms && (
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600">
              {errors.agreeToTerms.message}
            </motion.p>
          )}
        </div>

        <CustomButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full py-4 text-lg font-semibold"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </CustomButton>
      </form>

      <div className="mt-8 text-center border-t border-gray-200 pt-6">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blood-crimson hover:text-blood-deep transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

export default Register
