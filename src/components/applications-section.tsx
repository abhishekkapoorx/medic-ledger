"use client"

import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import { FileCheck, Shield, Globe, Receipt, BarChart } from "lucide-react"

export default function ApplicationsSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [activeSlide, setActiveSlide] = useState(0)
  const totalSlides = 5

  useEffect(() => {
    if (inView) {
      // Animate the title
      gsap.fromTo(".apps-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

      // Animate the icons
      gsap.fromTo(
        ".app-icon",
        { opacity: 0, scale: 0, rotation: -10 },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.6,
          stagger: 0.15,
          delay: 0.4,
          ease: "back.out(1.7)",
        },
      )

      // Animate the stats section
      gsap.fromTo(
        ".stats-section",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.8,
          ease: "power3.out",
        },
      )

      // Animate the stats numbers with counting effect
      const statsElements = document.querySelectorAll(".stat-number")
      statsElements.forEach((el) => {
        const finalValue = Number.parseInt(el.textContent || "0", 10)
        const startValue = 0

        const counter = { value: startValue }
        gsap.to(counter, {
          value: finalValue,
          duration: 2,
          delay: 1,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.round(counter.value) + "%"
          },
        })
      })
    }

    // Auto-rotate slides
    if (inView) {
      const interval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % totalSlides)
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [inView, activeSlide])

  const applications = [
    {
      icon: <FileCheck className="w-6 h-6 text-[#308E70]" />,
      title: "Codificación Inteligente",
    },
    {
      icon: <Shield className="w-6 h-6 text-[#308E70]" />,
      title: "Redes de Identidad",
    },
    {
      icon: <Globe className="w-6 h-6 text-[#308E70]" />,
      title: "Descubrimiento de Patrones",
    },
    {
      icon: <Receipt className="w-6 h-6 text-[#308E70]" />,
      title: "Facturación Inteligente",
    },
    {
      icon: <BarChart className="w-6 h-6 text-[#308E70]" />,
      title: "Entrenamiento Cognitivo",
    },
  ]

  return (
    <section ref={ref} className="py-20 mx-auto max-w-7xl relative overflow-hidden">
      <div className="container mx-auto px-4 z-10 relative">
        <div className="text-center mb-12">
          <h2 className="apps-title text-3xl md:text-4xl font-bold text-[#308E70] mb-4">
            Descubra las Aplicaciones de Atención Médica
            <br />
            <span className="text-[#FFFAFA]">FWAE AI de MedML</span>
          </h2>
        </div>

        <div className="flex justify-center mb-16">
          <div className="flex items-center space-x-8 md:space-x-16">
            {applications.map((app, index) => (
              <div
                key={index}
                className={`app-icon flex flex-col items-center cursor-pointer transition-all duration-300 ${
                  activeSlide === index ? "scale-110" : "opacity-70 scale-90"
                }`}
                onClick={() => setActiveSlide(index)}
              >
                <div className={`p-4 rounded-full ${activeSlide === index ? "bg-[#308E70]/30" : "bg-[#FFFAFA]/5"}`}>
                  {app.icon}
                </div>
                <p className={`mt-2 text-sm ${activeSlide === index ? "text-[#FFFAFA]" : "text-[#FFFAFA]/60"}`}>
                  {app.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mb-4">
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
        </div>

        {/* Stats section with red background */}
        <div className="stats-section mt-20 bg-[#308E70] rounded-lg overflow-hidden">
          <div className="p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-[#FFFAFA] text-center mb-4">
              Este es el rendimiento que podemos darte en MedML
            </h3>
            <p className="text-[#FFFAFA]/80 text-center mb-12">
              MedML le devolverá el rendimiento que su práctica merece.
            </p>

            <div className="flex flex-wrap justify-around">
              <div className="w-full md:w-1/3 text-center mb-8 md:mb-0">
                <div className="stat-number text-4xl md:text-5xl font-bold text-[#FFFAFA]">16%</div>
                <p className="text-[#FFFAFA]/80 mt-2">Aumento en los ingresos</p>
              </div>

              <div className="w-full md:w-1/3 text-center mb-8 md:mb-0">
                <div className="stat-number text-4xl md:text-5xl font-bold text-[#FFFAFA]">16%</div>
                <p className="text-[#FFFAFA]/80 mt-2">Aumento en los ingresos</p>
              </div>

              <div className="w-full md:w-1/3 text-center">
                <div className="stat-number text-4xl md:text-5xl font-bold text-[#FFFAFA]">100%</div>
                <p className="text-[#FFFAFA]/80 mt-2">Aumento de Cuentas Nuevas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
