"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const FeatureCard = ({ icon: Icon, title, description, link, color }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group h-full flex flex-col"
    >
      {/* Icon Section */}
      <div className="flex justify-center mb-6">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${color} rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}
        >
          <Icon className="h-10 w-10 text-white" />
        </div>
      </div>

      {/* Content Section - Flex Grow */}
      <div className="flex flex-col flex-grow text-center">
        <h3 className="text-2xl font-bold font-montserrat text-gray-900 mb-4 group-hover:text-blood-crimson transition-colors">
          {title}
        </h3>

        <p className="text-gray-600 leading-relaxed mb-6 flex-grow">{description}</p>

        {/* Link Section - Always at Bottom */}
        <div className="mt-auto">
          <Link
            to={link}
            className="inline-flex items-center justify-center text-blood-crimson hover:text-blood-deep font-semibold group-hover:translate-x-2 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-red-50"
          >
            Learn More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default FeatureCard
