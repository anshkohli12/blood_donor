"use client"
import { motion } from "framer-motion"

const CustomButton = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = "left",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants = {
    primary:
      "bg-gradient-to-r from-blood-deep to-blood-crimson text-white hover:shadow-lg focus:ring-blood-crimson disabled:opacity-50",
    secondary:
      "border-2 border-blood-deep text-blood-deep hover:bg-blood-deep hover:text-white focus:ring-blood-deep disabled:opacity-50",
    outline:
      "border-2 border-gray-300 text-gray-700 hover:border-blood-deep hover:text-blood-deep focus:ring-blood-deep disabled:opacity-50",
    ghost: "text-blood-deep hover:bg-blood-deep hover:bg-opacity-10 focus:ring-blood-deep disabled:opacity-50",
  }

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      {Icon && iconPosition === "left" && !loading && <Icon className="mr-2 h-5 w-5" />}

      {children}

      {Icon && iconPosition === "right" && !loading && <Icon className="ml-2 h-5 w-5" />}
    </motion.button>
  )
}

export default CustomButton
