"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import Link from "next/link"

export default function HeroSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const headRef = useRef(null)
  const circleRef = useRef(null)

  useEffect(() => {
    if (inView) {
      // Animate the text elements
      gsap.fromTo(".hero-title", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })

      gsap.fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" },
      )

      gsap.fromTo(
        ".hero-buttons",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: "power3.out" },
      )

      // Animate the head silhouette
      if (headRef.current) {
        gsap.fromTo(
          headRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" },
        )
      }

      // Create the pulsing effect for the circle
      if (circleRef.current) {
        gsap.to(circleRef.current, {
          scale: 1.05,
          opacity: 0.8,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }

      // Animate the digital elements around the head
      gsap.fromTo(
        ".digital-element",
        {
          opacity: 0,
          scale: 0,
          rotation: -30,
        },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
      )
    }
  }, [inView])

  return (
    <section ref={ref} className="relative min-h-screen bg-[#141414] flex items-center overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#BF3131]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-[#BF3131]/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 z-10 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 pt-20 md:pt-0">
          <motion.h1
            className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold text-[#FFFAFA] mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Automatización <br />
            <span className="text-[#BF3131]">Revolucionaria</span> para <br />
            la Atención Médica
          </motion.h1>

          <motion.p
            className="hero-subtitle text-lg text-[#FFFAFA]/80 mb-8 max-w-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Descubra cómo MedML está llevando la atención médica al siguiente nivel con nuestra plataforma en la nube
            impulsada por IA.
          </motion.p>

          <div className="hero-buttons flex flex-wrap gap-4">
            <Link
              href="#demo"
              className="bg-[#BF3131] text-[#FFFAFA] px-6 py-3 rounded-md hover:bg-[#BF3131]/80 transition-all transform hover:scale-105"
            >
              Solicitar Demo Gratis
            </Link>
            <Link
              href="#contactanos"
              className="border border-[#FFFAFA]/30 text-[#FFFAFA] px-6 py-3 rounded-md hover:bg-[#FFFAFA]/10 transition-all"
            >
              Contáctanos
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 mt-12 md:mt-0 relative">
          {/* Head silhouette with digital elements */}
          <div ref={headRef} className="relative mx-auto w-[300px] h-[400px] md:w-[400px] md:h-[500px]">
            {/* Glowing circle behind the head */}
            <div
              ref={circleRef}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[350px] md:h-[350px] rounded-full bg-gradient-to-r from-[#BF3131]/30 to-[#BF3131]/10 blur-xl"
            ></div>

            {/* Head silhouette */}
            <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Mee2kMBCERKpDoLf6BNwh9eTtKBlo8.png')] bg-contain bg-center bg-no-repeat"></div>

            {/* Digital elements around the head */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`digital-element absolute w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#BF3131] opacity-80 blur-sm`}
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${i < 4 ? 5 + Math.random() * 30 : 65 + Math.random() * 30}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}

            {/* Digital circuit lines */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`line-${i}`}
                className="digital-element absolute h-[1px] bg-gradient-to-r from-[#BF3131] to-transparent"
                style={{
                  top: `${30 + i * 10}%`,
                  left: `${i % 2 === 0 ? "10%" : "50%"}`,
                  width: `${100 - (i % 2 === 0 ? 60 : 20)}px`,
                  transform: `rotate(${i % 2 === 0 ? 20 : -20}deg)`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
