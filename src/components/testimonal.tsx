"use client"

import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function TestimonialsSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [activeSlide, setActiveSlide] = useState(0)
  const totalSlides = 3

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
        boxShadow: "0 0 30px rgba(191,49,49,0.6)",
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

  const testimonials = [
    {
      quote:
        "Somos más eficientes con CEO y recientemente añadió, fue un ejecutivo en la recomendación de la IA MedML, el que permitió que nuestro personal ofrezca un mejor servicio a nuestros pacientes.",
      name: "Dr. Mohamed Sain",
      position: "Director médico de Salud Hospital",
    },
    {
      quote:
        "La implementación de MedML ha transformado nuestra práctica médica, mejorando la precisión diagnóstica y reduciendo el tiempo administrativo en un 40%.",
      name: "Dra. Ana Martínez",
      position: "Jefa de Cardiología, Centro Médico Nacional",
    },
    {
      quote:
        "Desde que integramos MedML, hemos visto un aumento del 25% en la satisfacción del paciente y una reducción significativa en los errores de facturación.",
      name: "Dr. James Wilson",
      position: "Director de Operaciones, Clínica Internacional",
    },
  ]

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  return (
    <section ref={ref} id="testimonios" className="py-20 bg-[#141414] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-r from-[#BF3131]/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-t from-[#BF3131]/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="text-center mb-12">
          <h2 className="testimonials-title text-3xl md:text-4xl font-bold text-[#FFFAFA] mb-4">
            Nuestros Clientes <span className="text-[#BF3131]">Nos Aman</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 relative">
            {/* Profile images */}
            <div className="relative h-[300px] md:h-[400px]">
              {/* Main profile */}
              <div className="main-profile profile-image absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="profile-glow w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#BF3131]/20 flex items-center justify-center">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-[#141414] p-1">
                    <div className="w-full h-full rounded-full bg-cover bg-center bg-[url('https://randomuser.me/api/portraits/men/32.jpg')]"></div>
                  </div>
                </div>
              </div>

              {/* Surrounding profiles */}
              {[
                { top: "10%", left: "20%", image: "https://randomuser.me/api/portraits/women/44.jpg" },
                { top: "15%", left: "70%", image: "https://randomuser.me/api/portraits/men/86.jpg" },
                { top: "70%", left: "15%", image: "https://randomuser.me/api/portraits/women/24.jpg" },
                { top: "75%", left: "75%", image: "https://randomuser.me/api/portraits/men/36.jpg" },
                { top: "40%", left: "85%", image: "https://randomuser.me/api/portraits/women/67.jpg" },
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
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-gradient-to-r from-[#BF3131]/30 to-[#BF3131]/5 blur-3xl"></div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <div className="testimonial-content relative bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-8 transition-all">
              <div className="absolute -top-4 -left-4 text-4xl text-[#BF3131] opacity-50">"</div>
              <div className="absolute -bottom-4 -right-4 text-4xl text-[#BF3131] opacity-50">"</div>

              <p className="text-[#FFFAFA]/90 italic mb-6">{testimonials[activeSlide].quote}</p>

              <div className="flex items-center">
                <div className="mr-4">
                  <h4 className="text-[#FFFAFA] font-bold">{testimonials[activeSlide].name}</h4>
                  <p className="text-[#FFFAFA]/60 text-sm">{testimonials[activeSlide].position}</p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-[#FFFAFA]/5 hover:bg-[#BF3131]/20 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#FFFAFA]" />
                </button>

                <div className="flex space-x-2">
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <button
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        activeSlide === i ? "bg-[#BF3131] w-6" : "bg-[#FFFAFA]/30"
                      }`}
                      onClick={() => setActiveSlide(i)}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-[#FFFAFA]/5 hover:bg-[#BF3131]/20 transition-colors"
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
