"use client"
import { motion } from "framer-motion"

const FormInput = ({ label, error, icon: Icon, className = "", required = false, ...props }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-blood-crimson ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <input
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm
            focus:border-blood-crimson focus:ring-blood-crimson
            ${Icon ? "pl-10" : "pl-3"} pr-3 py-3
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
            transition-colors duration-200
          `}
          {...props}
        />
      </div>

      {error && (
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600">
          {error}
        </motion.p>
      )}
    </div>
  )
}

export default FormInput
