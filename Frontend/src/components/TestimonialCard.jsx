"use client"
import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const TestimonialCard = ({ name, role, image, content, rating }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className="flex items-center mb-6">
        <img src={image || "/placeholder.svg"} alt={name} className="w-16 h-16 rounded-full object-cover mr-4" />
        <div>
          <h4 className="text-lg font-bold font-montserrat text-gray-900">{name}</h4>
          <p className="text-blood-crimson font-medium">{role}</p>
        </div>
      </div>

      <div className="flex items-center mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
        ))}
      </div>

      <div className="relative">
        <Quote className="absolute -top-2 -left-2 h-8 w-8 text-blood-light opacity-20" />
        <p className="text-gray-700 leading-relaxed italic pl-6">"{content}"</p>
      </div>
    </motion.div>
  )
}

export default TestimonialCard
