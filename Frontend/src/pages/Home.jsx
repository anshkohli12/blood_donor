"use client"

import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Heart, Users, MapPin, Calendar, Shield, Clock, Award, ArrowRight, Phone, CheckCircle } from "lucide-react"
import Hero from "../components/Hero"
import FeatureCard from "../components/FeatureCard"
import TestimonialCard from "../components/TestimonialCard"
import CustomButton from "../components/CustomButton"

gsap.registerPlugin(ScrollTrigger)

const Home = () => {
  const processRef = useRef(null)
  const testimonialsRef = useRef(null)
  const statsRef = useRef(null)
  const featuresRef = useRef(null)

  const [statsInView, setStatsInView] = useState(false)
  const [featuresInView, setFeaturesInView] = useState(false)

  useEffect(() => {
    // Simple intersection observer for stats
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === statsRef.current && entry.isIntersecting) {
            setStatsInView(true)
          }
          if (entry.target === featuresRef.current && entry.isIntersecting) {
            setFeaturesInView(true)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (statsRef.current) observer.observe(statsRef.current)
    if (featuresRef.current) observer.observe(featuresRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Animate stats counters when in view
    if (statsInView) {
      const counters = statsRef.current?.querySelectorAll(".counter")
      counters?.forEach((counter) => {
        const target = Number.parseInt(counter.getAttribute("data-target"))
        gsap.to(counter, {
          innerHTML: target,
          duration: 2,
          ease: "power2.out",
          snap: { innerHTML: 1 },
          onUpdate: () => {
            counter.innerHTML = Math.ceil(counter.innerHTML).toLocaleString()
          },
        })
      })
    }
  }, [statsInView])

  const stats = [
    { number: 15420, label: "Lives Saved", icon: Heart },
    { number: 8750, label: "Active Donors", icon: Users },
    { number: 245, label: "Blood Banks", icon: MapPin },
    { number: 1200, label: "Monthly Donations", icon: Calendar },
  ]

  const features = [
    {
      icon: Users,
      title: "Find Donors",
      description: "Connect with verified blood donors in your area instantly",
      link: "/find-donors",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: MapPin,
      title: "Blood Banks",
      description: "Locate nearby blood banks and check real-time availability",
      link: "/blood-banks",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Calendar,
      title: "Donation Events",
      description: "Join community blood drives and donation campaigns",
      link: "/events",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      title: "Emergency Requests",
      description: "Get urgent blood requests and respond to emergencies",
      link: "/request-blood",
      color: "from-orange-500 to-red-500",
    },
  ]

  const donationProcess = [
    {
      step: 1,
      title: "Register",
      description: "Create your donor profile with medical information",
      icon: Users,
    },
    {
      step: 2,
      title: "Get Matched",
      description: "Receive notifications for compatible blood requests",
      icon: Heart,
    },
    {
      step: 3,
      title: "Save Lives",
      description: "Donate blood and make a life-saving difference",
      icon: Award,
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Regular Donor",
      image: "/smiling-woman-donor.jpg",
      content: "Being part of this network has been incredibly rewarding. I've helped save 12 lives so far!",
      rating: 5,
    },
    {
      name: "Dr. Michael Chen",
      role: "Emergency Physician",
      image: "/doctor-medical-professional.jpg",
      content: "This platform has revolutionized how we handle blood emergencies. Response times are incredible.",
      rating: 5,
    },
    {
      name: "Maria Rodriguez",
      role: "Blood Bank Coordinator",
      image: "/medical-coordinator-woman.jpg",
      content: "The real-time inventory system helps us manage blood supplies more efficiently than ever.",
      rating: 5,
    },
  ]

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <Hero />

      {/* Stats Section */}
      <section className="section-padding bg-white" ref={statsRef}>
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blood-deep to-blood-crimson rounded-full mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div
                    className="counter text-3xl lg:text-4xl font-bold text-gray-900 font-montserrat"
                    data-target={stat.number}
                  >
                    0
                  </div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gray-light" ref={featuresRef}>
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              className="text-4xl lg:text-5xl font-bold font-montserrat text-gray-900 mb-6"
            >
              How We <span className="text-gradient">Save Lives</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Our platform connects donors, recipients, and blood banks in a seamless network designed to save lives
              when every second counts.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="h-full"
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Process Section */}
      <section className="section-padding bg-white" ref={processRef}>
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold font-montserrat text-gray-900 mb-6">
              Simple <span className="text-gradient">3-Step Process</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Becoming a life-saver is easier than you think. Follow these simple steps to start making a difference in
              your community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
            {donationProcess.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center relative"
                >
                  {/* Arrow Connection */}
                  {index < donationProcess.length - 1 && (
                    <div className="hidden md:flex absolute top-12 -right-4 lg:-right-6 w-8 lg:w-12 h-0.5 items-center justify-center z-20">
                      <div className="w-full h-0.5 bg-gradient-to-r from-blood-crimson to-red-400"></div>
                      <div className="absolute right-0 w-0 h-0 border-l-[8px] border-l-red-400 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blood-deep to-blood-crimson rounded-full mb-6 relative shadow-lg">
                      <Icon className="h-10 w-10 text-white" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-100">
                        <span className="text-sm font-bold text-blood-deep">{step.step}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold font-montserrat text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/become-donor">
              <CustomButton variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                Start Saving Lives Today
              </CustomButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 via-white to-red-50" ref={testimonialsRef}>
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold font-montserrat text-gray-900 mb-6"
            >
              Stories from Our <span className="text-gradient">Heroes</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Hear from the amazing people who make our community stronger every day.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                viewport={{ once: true }}
              >
                <TestimonialCard {...testimonial} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency CTA Section */}
      <section className="section-padding bg-blood-deep text-white">
        <div className="container-custom">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-8"
            >
              <Phone className="h-10 w-10 text-white animate-pulse" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold font-montserrat mb-6"
            >
              Emergency Blood Needed?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              Don't wait. Every minute counts when lives are at stake. Submit an emergency request and connect with
              donors immediately.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/request-blood">
                <CustomButton
                  variant="secondary"
                  size="lg"
                  className="bg-white text-blood-deep hover:bg-gray-100 border-white"
                  icon={Heart}
                >
                  Request Blood Now
                </CustomButton>
              </Link>

              <div className="flex items-center space-x-2 text-white/80">
                <Clock className="h-5 w-5" />
                <span className="text-sm">24/7 Emergency Support</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-blood-deep to-blood-crimson rounded-3xl p-8 lg:p-16 text-center text-white">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold font-montserrat mb-6"
            >
              Ready to Save Lives?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              Join thousands of heroes in our community. Your donation can save up to three lives. Make a difference
              today.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/become-donor">
                <CustomButton
                  variant="secondary"
                  size="lg"
                  className="bg-white text-blood-deep hover:bg-gray-100 border-white"
                  icon={Heart}
                >
                  Become a Donor
                </CustomButton>
              </Link>

              <Link to="/find-donors">
                <CustomButton
                  variant="ghost"
                  size="lg"
                  className="text-white border-white hover:bg-white/10"
                  icon={Users}
                >
                  Find Donors
                </CustomButton>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="flex items-center justify-center space-x-6 mt-8 text-white/80"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Safe & Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Verified Donors</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">24/7 Support</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
