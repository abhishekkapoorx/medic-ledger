"use client"

import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import { ChevronLeft, ChevronRight } from "lucide-react"
import doctor from "../../public/Doctor.png"
import patient from "../../public/patient.png"
import donar from "../../public/donar.png"
import manifacturer from "../../public/Manfifacturer.png"
import distributor from "../../public/distributor.png"
import retailer from "../../public/retailer.png"
import Image from "next/image"
export default function TestimonialsSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [activeSlide, setActiveSlide] = useState(0)
  const totalSlides = 6

  useEffect(() => {
    if (inView) {
      // Animate the title
      gsap.fromTo(".testimonials-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

      // Animate the testimonial content
      gsap.fromTo(
        ".testimonial-content",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power3.out" },
      )

      // Animate the profile images with staggered effect
      gsap.fromTo(
        ".profile-image",
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

      // Create floating animation for the main profile
      gsap.to(".main-profile", {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Create pulsing glow effect for the main profile
      gsap.to(".profile-glow", {
        boxShadow: "0 0 30px rgb(107 181 158)",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }

    // Auto-rotate testimonials
    if (inView) {
      const interval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % totalSlides)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [inView, activeSlide])



  const features = [
    {

      title: "Manufacturer",
      description: "We connect manufacturers with distributors to ensure efficient production and supply chain management.",
    },
    {
      title: "Donor",
      description: "MedLedger enables secure and transparent donation tracking for life-saving medicines and resources.",
    },
    {
      title: "Distributor",
      description: "Our platform streamlines distribution processes, ensuring medications reach retailers and patients safely.",
    },
    {
      title: "Retailer",
      description: "Retailers can access trusted medication directly, ensuring quick and secure delivery to patients.",
    },
    {
      title: "Patient",
      description: "Patients can track their medications' journey from production to delivery, ensuring safety and authenticity.",
    },
    {
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
    <section ref={ref} id="testimonios" className="py-20  relative max-w-7xl mx-auto overflow-hidden">
      {/* Background gradient */}
      

      <div className="container mx-auto px-4 z-10 relative">
        <div className="text-center mb-12">
          <h2 className="testimonials-title text-3xl md:text-4xl font-bold text-[#FFFAFA] mb-4">
            Our<span className="text-[#308E70]"> Features</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 relative">
            {/* Profile images */}
            <div className="relative h-[300px] md:h-[400px]">
              {/* Main profile */}
              <div className="main-profile profile-image absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="profile-glow w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#308E70]/20 flex items-center justify-center">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-[#141414] p-1">
                    <div className="w-full h-full rounded-full bg-cover bg-center " style={{backgroundImage: doctor.src}} >
                      <Image src={doctor} alt=""></Image>
                    </div>
                  </div>
                </div>
              </div>

              {/* Surrounding profiles */}
              {[
                { top: "10%", left: "20%", image: patient.src },
                { top: "15%", left: "70%", image: manifacturer.src },
                { top: "70%", left: "15%", image: retailer.src },
                { top: "75%", left: "75%", image: distributor.src },
                { top: "40%", left: "85%", image: donar.src },
              ].map((profile, i) => (
                <div
                  key={i}
                  className="profile-image absolute z-10"
                  style={{
                    top: profile.top,
                    left: profile.left,
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-[#141414] p-1">
                    <div
                      className="w-full h-full rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${profile.image})` }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Red glow in the background */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-gradient-to-r from-[#308E70]/30 to-[#308E70]/5 blur-3xl"></div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
  <div className="w-full md:w-1/2 relative">
    {/* Feature icons */}
    
  </div>

  <div className="w-full ">
    <div className="feature-content w-full relative bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-8 transition-all">
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
      </div>
    </section>
  )
}
