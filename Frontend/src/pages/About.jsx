"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Heart, Users, Shield, Award, Globe, Clock, CheckCircle, ArrowRight, Mail, Phone } from "lucide-react"
import CustomButton from "../components/CustomButton"

gsap.registerPlugin(ScrollTrigger)

const About = () => {
  const teamRef = useRef(null)
  const missionRef = useRef(null)
  const valuesRef = useRef(null)

  const [missionInView, setMissionInView] = useState(false)
  const [valuesInView, setValuesInView] = useState(false)

  useEffect(() => {
    // Simple intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === missionRef.current && entry.isIntersecting) {
            setMissionInView(true)
          }
          if (entry.target === valuesRef.current && entry.isIntersecting) {
            setValuesInView(true)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (missionRef.current) observer.observe(missionRef.current)
    if (valuesRef.current) observer.observe(valuesRef.current)

    return () => observer.disconnect()
  }, [])

  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "We believe in the power of human kindness and the desire to help others in their time of need.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Every donation is handled with the highest safety standards and medical protocols.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Community",
      description: "Building strong connections between donors, recipients, and healthcare providers.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Clock,
      title: "Reliability",
      description: "24/7 availability for emergency situations because every second counts in saving lives.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Making blood donation accessible to everyone, regardless of location or background.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to providing the best platform and experience for our community.",
      color: "from-yellow-500 to-orange-500",
    },
  ]

  const stats = [
    { number: "15,420", label: "Lives Saved", description: "Through our network" },
    { number: "8,750", label: "Active Donors", description: "Ready to help" },
    { number: "245", label: "Partner Hospitals", description: "Across the country" },
    { number: "99.8%", label: "Success Rate", description: "In emergency requests" },
  ]

  const team = [
    {
      name: "Dr. Sarah Mitchell",
      role: "Chief Medical Officer",
      image: "/professional-doctor-woman.jpg",
      bio: "15+ years in emergency medicine and blood bank management.",
    },
    {
      name: "Michael Chen",
      role: "Technology Director",
      image: "/tech-professional-man.png",
      bio: "Former healthcare tech executive passionate about saving lives through innovation.",
    },
    {
      name: "Maria Rodriguez",
      role: "Community Outreach Manager",
      image: "/community-manager-woman.jpg",
      bio: "Dedicated to building bridges between donors and those in need.",
    },
  ]

  const eligibilityRequirements = [
    "Age 18-65 years old",
    "Weight at least 110 pounds",
    "Good general health",
    "No recent tattoos or piercings",
    "Not pregnant or breastfeeding",
    "No recent travel to certain areas",
  ]

  const donationProcess = [
    {
      step: 1,
      title: "Registration & Health Screening",
      description: "Complete your donor profile and undergo a quick health assessment.",
      duration: "10-15 minutes",
    },
    {
      step: 2,
      title: "Medical Examination",
      description: "Brief medical check including blood pressure, pulse, and hemoglobin test.",
      duration: "5-10 minutes",
    },
    {
      step: 3,
      title: "Blood Donation",
      description: "The actual donation process in a comfortable, supervised environment.",
      duration: "8-12 minutes",
    },
    {
      step: 4,
      title: "Recovery & Refreshments",
      description: "Rest and enjoy refreshments while your body begins to replenish.",
      duration: "10-15 minutes",
    },
  ]

  return (
    <div className="pt-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-blood-deep to-blood-crimson text-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-6xl font-bold font-montserrat mb-6">
              About Our <span className="text-pink-200">Mission</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 leading-relaxed mb-8">
              We're more than just a platform – we're a community of heroes dedicated to saving lives through the power
              of blood donation and human connection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CustomButton
                variant="secondary"
                size="lg"
                className="bg-white text-blood-deep hover:bg-gray-100"
                icon={Heart}
              >
                Join Our Mission
              </CustomButton>
              <CustomButton
                variant="ghost"
                size="lg"
                className="text-white border-white hover:bg-white/10"
                icon={ArrowRight}
                iconPosition="right"
              >
                Learn More
              </CustomButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section-padding bg-white" ref={missionRef}>
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={missionInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold font-montserrat text-gray-900 mb-6">
                Our <span className="text-gradient">Mission</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                To create a seamless, reliable network that connects blood donors with those in need, ensuring that no
                life is lost due to blood shortage. We believe that every person deserves access to life-saving blood
                when they need it most.
              </p>
              <div className="space-y-4">
                {[
                  "Connect donors with recipients instantly",
                  "Maintain the highest safety standards",
                  "Build stronger, healthier communities",
                  "Provide 24/7 emergency support",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={missionInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-6 w-6 text-blood-crimson flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={missionInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img src="/blood-donation-community-heroes-helping.jpg" alt="Our Mission" className="rounded-2xl shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-blood-deep/20 to-transparent rounded-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-gray-light">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-montserrat text-gray-900 mb-6">
              Our <span className="text-gradient">Impact</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Numbers that represent real lives saved and communities strengthened.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl lg:text-5xl font-bold text-blood-crimson font-montserrat mb-2">
                  {stat.number}
                </div>
                <div className="text-xl font-semibold text-gray-900 mb-2">{stat.label}</div>
                <div className="text-gray-600">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-white" ref={valuesRef}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-montserrat text-gray-900 mb-6">
              Our <span className="text-gradient">Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The principles that guide everything we do and every decision we make.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="bg-gray-light rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group"
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${value.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold font-montserrat text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Donation Process Section */}
      <section className="section-padding bg-gradient-to-br from-blood-light to-blood-gradient text-white" id="process">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-montserrat mb-6">The Donation Process</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              A simple, safe, and comfortable experience designed with your well-being in mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {donationProcess.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                {/* Connection Line */}
                {index < donationProcess.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-white/30 transform translate-x-1/2 z-0" />
                )}

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-6 relative">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-4 w-4 text-blood-deep" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-montserrat mb-4">{step.title}</h3>
                  <p className="text-white/90 leading-relaxed mb-2">{step.description}</p>
                  <p className="text-sm text-white/70">Duration: {step.duration}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="section-padding bg-white" id="eligibility">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl lg:text-5xl font-bold font-montserrat text-gray-900 mb-6">
                Donation <span className="text-gradient">Eligibility</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Most people can donate blood safely. Here are the basic requirements to ensure both donor and recipient
                safety.
              </p>
              <div className="space-y-4">
                {eligibilityRequirements.map((requirement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-6 w-6 text-blood-crimson flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
                className="mt-8"
              >
                <CustomButton variant="primary" size="lg" icon={Heart}>
                  Check Your Eligibility
                </CustomButton>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img src="/medical-professional-checking-donor-eligibility.jpg" alt="Eligibility Check" className="rounded-2xl shadow-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-gray-light" ref={teamRef}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-montserrat text-gray-900 mb-6">
              Meet Our <span className="text-gradient">Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Dedicated professionals working tirelessly to make blood donation accessible and safe for everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-6"
                />
                <h3 className="text-2xl font-bold font-montserrat text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blood-crimson font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="section-padding bg-blood-deep text-white">
        <div className="container-custom">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold font-montserrat mb-6"
            >
              Have Questions?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              Our team is here to help. Reach out to us anytime for support, questions, or to learn more about blood
              donation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              <CustomButton
                variant="secondary"
                size="lg"
                className="bg-white text-blood-deep hover:bg-gray-100"
                icon={Mail}
              >
                Contact Us
              </CustomButton>

              <CustomButton
                variant="ghost"
                size="lg"
                className="text-white border-white hover:bg-white/10"
                icon={Phone}
              >
                Call Now
              </CustomButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center text-white/80"
            >
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>+1 (555) 123-BLOOD</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>help@blooddonornetwork.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
