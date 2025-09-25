"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"

const Hero = () => {
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const statsRef = useRef(null)
  const backgroundRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()

    // Background parallax effect
    gsap.set(backgroundRef.current, { scale: 1.1 })

    // Only animate stats, not the title
    gsap.from(statsRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.5,
    })

    // Parallax scroll effect
    const handleScroll = () => {
      const scrolled = window.pageYOffset
      const parallax = scrolled * 0.5

      if (backgroundRef.current) {
        gsap.to(backgroundRef.current, {
          y: parallax,
          duration: 0.5,
          ease: "power2.out",
        })
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" ref={heroRef}>
      {/* Background Image with Better Overlay */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
        style={{
          backgroundImage: `url('/blood-donation-event-community-center.jpg')`,
        }}
      />
      {/* Enhanced Multi-layer Overlay for Better Readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blood-deep/75 via-blood-crimson/65 to-red-800/55" />
      <div className="absolute inset-0 bg-black/45" />
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom text-center text-white px-4 mt-8">
        {/* Main Heading - Light & Harmonized with Background */}
        <div ref={titleRef} className="mb-24">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light font-montserrat leading-tight tracking-wider">
            <span className="text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0.5px_0.5px_1px_rgba(0,0,0,0.4)]">Donate Blood,</span>
            <br />
            <span className="text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0.5px_0.5px_1px_rgba(0,0,0,0.4)]">
              Save Lives
            </span>
          </h1>
        </div>

        {/* Stats Preview */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { number: "15K+", label: "Lives Saved" },
            { number: "8K+", label: "Active Donors" },
            { number: "245", label: "Blood Banks" },
            { number: "24/7", label: "Emergency Support" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-bold font-montserrat text-white mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">{stat.number}</div>
              <div className="text-sm text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-1 h-3 bg-white/70 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
