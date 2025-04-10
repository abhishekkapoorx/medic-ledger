"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import Link from "next/link"
import  Spline  from "@splinetool/react-spline"

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
    <section ref={ref} className="relative min-h-screen  max-w-7xl mx-auto overflow-hidden bg-[#141414] flex items-center ">
      {/* Background gradient effect */}
     

      <div className="container mx-auto px-4 z-10 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 pt-20 md:pt-0">
          <motion.h1
            className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold  text-[#FFFAFA] mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            <span className="text-[#308E70]">Medic Ledger</span> <br />Revolutionizing Drug <br />
            Authentication
          </motion.h1>

          <motion.p
            className="hero-subtitle text-lg text-justify text-[#FFFAFA]/80 mb-8 max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Medic Ledger leverages blockchain technology to ensure secure drug authentication and transparent pharmaceutical transactions. By using NFTs and smart contracts, it creates a decentralized system for safer, trusted medication handling.
          </motion.p>

          <div className="hero-buttons flex flex-wrap gap-4">
            <Link
              href="#demo"
              className="bg-[#308E70] text-[#FFFAFA] px-6 py-3 rounded-md hover:bg-[#308E70]/80 transition-all transform hover:scale-105"
            >
              Connect your wallet
            </Link>
            <Link
              href="#contactanos"
              className="border border-[#FFFAFA]/30 text-[#FFFAFA] px-6 py-3 rounded-md hover:bg-[#FFFAFA]/10 transition-all"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 mt-12 md:mt-0 relative">
          {/* Head silhouette with digital elements */}
          <div ref={headRef} className="relative mx-auto w-[300px] h-[400px] md:w-[400px] md:h-[500px]">
            {/* Glowing circle behind the head */}
            {/* <Spline
         scene="https://prod.spline.design/FJDPOlQagsje2F93/scene.splinecode" 
        style={{ width: "200px", height: "200px" }}
      /> */}
        <Spline
        scene="https://prod.spline.design/i5jLsUojN5uvdgh9/scene.splinecode" 
      />

            {/* Head silhouette */}
            {/* <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Mee2kMBCERKpDoLf6BNwh9eTtKBlo8.png')] bg-contain bg-center bg-no-repeat"></div> */}

            {/* Digital elements around the head */}
            {/* {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`digital-element absolute w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#308E70] opacity-80 blur-sm`}
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${i < 4 ? 5 + Math.random() * 30 : 65 + Math.random() * 30}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))} */}

            {/* Digital circuit lines */}
            {/* {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`line-${i}`}
                className="digital-element absolute h-[1px] bg-gradient-to-r from-[#308E70] to-transparent"
                style={{
                  top: `${30 + i * 10}%`,
                  left: `${i % 2 === 0 ? "10%" : "50%"}`,
                  width: `${100 - (i % 2 === 0 ? 60 : 20)}px`,
                  transform: `rotate(${i % 2 === 0 ? 20 : -20}deg)`,
                }}
              ></div>
            ))} */}
          </div>
        </div>
      </div>
    </section>
  )
}
