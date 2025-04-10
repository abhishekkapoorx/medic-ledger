"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import Link from "next/link"

export default function Footer() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView) {
      // Animate the logo
      gsap.fromTo(".footer-logo", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

      // Animate the navigation links with staggered effect
      gsap.fromTo(
        ".footer-nav-item",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.3,
          ease: "power2.out",
        },
      )

      // Animate the newsletter section
      gsap.fromTo(
        ".newsletter-section",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.6,
          ease: "power3.out",
        },
      )

      // Animate the designer credit
      gsap.fromTo(
        ".designer-credit",
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.9,
          ease: "power2.out",
        },
      )
    }
  }, [inView])

  return (
    <footer ref={ref} className="bg-[#308E70] py-12 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-l from-[#141414]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-[#141414]/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="footer-logo mb-8 md:mb-0">
            <Link href="/" className="flex items-center">
              <div className="flex items-center">
                <span className="text-[#FFFAFA] font-bold text-2xl">Medic</span>
                <span className="text-[#141414] font-bold text-2xl">Ledger</span>
              </div>
            </Link>
            <p className="text-[#FFFAFA]/80 text-sm mt-2 text-justify max-w-2xl">
              Medic Ledger is a blockchain-based platform for securely managing prescription medicines, ensuring transparency and authenticity through NFT-based prescription and medicine tracking.
            </p>
          </div>

          <div className="grid grid-cols-2 md:flex md:space-x-8">
            <div className="mb-6 md:mb-0">
              <h3 className="text-[#FFFAFA] font-bold mb-3">Explore more</h3>
              <ul className="space-y-2">
                <li className="footer-nav-item">
                  <Link href="/" className="text-[#FFFAFA]/80 hover:text-[#FFFAFA] transition-colors">
                    Home
                  </Link>
                </li>
                <li className="footer-nav-item">
                  <Link href="dashboard" className="text-[#FFFAFA]/80 hover:text-[#FFFAFA] transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li className="footer-nav-item">
                  <Link href="#marketplace" className="text-[#FFFAFA]/80 hover:text-[#FFFAFA] transition-colors">
                    Marketplace
                  </Link>
                </li>
                <li className="footer-nav-item">
                  <Link href="#prescription" className="text-[#FFFAFA]/80 hover:text-[#FFFAFA] transition-colors">
                    Prescription
                  </Link>
                </li>
                <li className="footer-nav-item">
                  <Link href="#medicine" className="text-[#FFFAFA]/80 hover:text-[#FFFAFA] transition-colors">
                    Medicine
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#FFFAFA] font-bold mb-3">Subscribe to medic ledger</h3>
              <div className="newsletter-section flex mt-2">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="bg-[#FFFAFA]/10 border border-[#FFFAFA]/20 rounded-l-md px-4 py-2 text-[#FFFAFA] focus:outline-none flex-grow"
                />
                <button className="bg-[#141414] text-[#FFFAFA] px-4 py-2 rounded-r-md hover:bg-[#141414]/80 transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#FFFAFA]/20 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#FFFAFA]/60 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Medic Ledger. All rights reserved.
          </p>

          <div className="designer-credit flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#7B68EE] mr-2 flex items-center justify-center">
              <span className="text-[#FFFAFA] text-xs">K</span>
            </div>
            <div>
              <p className="text-[#FFFAFA] text-sm">
                Lorem ipsum dolor sit amet.
                <br />
                <span className="text-[#FFFAFA]/60 text-xs">@teammedicledger</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
