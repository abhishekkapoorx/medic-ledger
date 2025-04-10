"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import { Button } from "./ui/button"
import ConnectWalletButton from "./ConnectWalletButton"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (inView) {
      gsap.fromTo(".header-logo", { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" })

      gsap.fromTo(
        ".nav-item",
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
      )

      gsap.fromTo(
        ".cta-button",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          delay: 0.5,
          ease: "elastic.out(1, 0.5)",
        },
      )
    }
  }, [inView])

  return (
    <motion.header
      ref={ref}
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#141414]/90 backdrop-blur-md py-2" : "bg-transparent py-4"
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="header-logo flex items-center">
          <div className="flex items-center">
            <span className="text-[#308E70] font-bold text-2xl">Medic</span>
            <span className="text-[#FFFAFA] font-bold text-2xl">Ledger</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/medicine" className="nav-item text-[#FFFAFA] hover:text-[#308E70] transition-colors">
            Medicine
          </Link>
          <Link href="/prescriptions" className="nav-item text-[#FFFAFA] hover:text-[#308E70] transition-colors">
            Prescriptions
          </Link>
          <Link href="/marketplace" className="nav-item text-[#FFFAFA] hover:text-[#308E70] transition-colors">
            Marketplace
          </Link>
          <ConnectWalletButton/>
        </nav>

        <button className="md:hidden text-[#FFFAFA]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </motion.header>
  )
}
