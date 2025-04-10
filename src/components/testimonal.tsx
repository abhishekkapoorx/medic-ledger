"use client"

import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function FeaturesSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [activeSlide, setActiveSlide] = useState(0)
  const totalSlides = 6

  useEffect(() => {
    if (inView) {
      // Animate the title
      gsap.fromTo(".features-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

      // Animate the feature content
      gsap.fromTo(
        ".feature-content",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power3.out" },
      )

      // Animate the profile images with staggered effect
      gsap.fromTo(
        ".feature-icon",
        { opacity: 0, scale: 0, rotation: -10 },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.6,
          stagger: 0.15,
          delay: 0.6,
          ease: "back.out(1.7)",
        },
      )
    }

    // Auto-rotate features
    if (inView) {
      const interval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % totalSlides)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [inView, activeSlide])

  const features = [
    {
      icon: "/images/manufacturer-icon.png",
      title: "Manufacturer",
      description: "We connect manufacturers with distributors to ensure efficient production and supply chain management.",
    },
    {
      icon: "/images/donor-icon.png",
      title: "Donor",
      description: "MedLedger enables secure and transparent donation tracking for life-saving medicines and resources.",
    },
    {
      icon: "/images/distributor-icon.png",
      title: "Distributor",
      description: "Our platform streamlines distribution processes, ensuring medications reach retailers and patients safely.",
    },
    {
      icon: "/images/retailer-icon.png",
      title: "Retailer",
      description: "Retailers can access trusted medication directly, ensuring quick and secure delivery to patients.",
    },
    {
      icon: "/images/patient-icon.png",
      title: "Patient",
      description: "Patients can track their medications' journey from production to delivery, ensuring safety and authenticity.",
    },
    {
      icon: "/images/doctor-icon.png",
      title: "Doctor",
      description: "Doctors can prescribe medications directly through our platform, ensuring secure and accurate prescriptions.",
    },
  ]

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  return (
    <section ref={ref} id="features" className="py-20 max-w-7xl mx-auto bg-[#141414] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-r from-[#308E70]/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-t from-[#308E70]/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="text-center mb-12">
          <h2 className="features-title text-3xl md:text-4xl font-bold text-[#FFFAFA] mb-4">
            Our Features <span className="text-[#308E70]">Nos Aman</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 relative">
            {/* Feature icons */}
            <div className="relative h-[300px] md:h-[400px]">
              <div className="feature-icon absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                {/* Make the current feature icon large */}
                <img
                  src={features[activeSlide].icon}
                  alt={features[activeSlide].title}
                  className={`w-32 h-32 md:w-40 md:h-40 ${activeSlide === 0 ? "w-48 h-48 md:w-56 md:h-56" : ""}`}
                />
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <div className="feature-content relative bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-8 transition-all">
              <div className="absolute -top-4 -left-4 text-4xl text-[#308E70] opacity-50">"</div>
              <div className="absolute -bottom-4 -right-4 text-4xl text-[#308E70] opacity-50">"</div>

              <h3 className="text-[#FFFAFA] font-bold text-xl mb-4">{features[activeSlide].title}</h3>
              <p className="text-[#FFFAFA]/90 italic mb-6">{features[activeSlide].description}</p>

              <div className="flex justify-between mt-8">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-[#FFFAFA]/5 hover:bg-[#308E70]/20 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#FFFAFA]" />
                </button>

                <div className="flex space-x-2">
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <button
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        activeSlide === i ? "bg-[#308E70] w-6" : "bg-[#FFFAFA]/30"
                      }`}
                      onClick={() => setActiveSlide(i)}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-[#FFFAFA]/5 hover:bg-[#308E70]/20 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-[#FFFAFA]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
