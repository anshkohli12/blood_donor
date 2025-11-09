"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import FormInput from "../components/FormInput"
import CustomButton from "../components/CustomButton"

const schema = yup.object({
  email: yup.string().email("Please enter a valid email address").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
})

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      setApiError("")
      const response = await login(data.email, data.password)
      
      // Redirect based on user role
      if (response.user.role === 'admin') {
        navigate("/admin-dashboard")
      } else {
        navigate("/dashboard")
      }
    } catch (error) {
      setApiError(error.response?.data?.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-montserrat text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600 text-sm">Sign in to your account to continue saving lives</p>
      </div>

      {apiError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
        >
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{apiError}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="Enter your email"
          error={errors.email?.message}
          required
          {...register("email")}
        />

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
              placeholder="Enter your password"
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
          {errors.password && (
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600">
              {errors.password.message}
            </motion.p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blood-crimson focus:ring-blood-crimson border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <Link to="/forgot-password" className="text-sm text-blood-crimson hover:text-blood-deep transition-colors">
            Forgot password?
          </Link>
        </div>

        <CustomButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full py-3 text-base font-semibold"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </CustomButton>
      </form>

      <div className="mt-6 text-center border-t border-gray-100 pt-4">
        <p className="text-gray-600 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-blood-crimson hover:text-blood-deep transition-colors">
            Create one now
          </Link>
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="text-blood-crimson hover:underline font-medium">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-blood-crimson hover:underline font-medium">
            Privacy Policy
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

export default Login
