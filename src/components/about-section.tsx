"use client"

import { useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import { Lightbulb, Accessibility, Users } from "lucide-react"

export default function AboutSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const mapRef = useRef(null)

  useEffect(() => {
    if (inView) {
      // Animate the text elements
      gsap.fromTo(".about-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

      gsap.fromTo(
        ".about-description",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" },
      )

      // Animate the map
      if (mapRef.current) {
        gsap.fromTo(
          mapRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1, delay: 0.4, ease: "power2.out" },
        )

        // Animate map dots appearing
        gsap.fromTo(
          ".map-dot",
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.02,
            delay: 0.8,
            ease: "back.out(2)",
          },
        )
      }

      // Animate the values section
      gsap.fromTo(
        ".values-title",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: "power3.out" },
      )

      gsap.fromTo(
        ".value-item",
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.2,
          delay: 0.8,
          ease: "power2.out",
        },
      )
    }
  }, [inView])

  return (
    <section ref={ref} id="nosotros" className="py-20 bg-[#141414] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-l from-[#BF3131]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-[#BF3131]/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="text-center mb-12">
          <h2 className="about-title text-3xl md:text-4xl font-bold text-[#BF3131] mb-4">¿Quiénes somos?</h2>
          <p className="about-description text-[#FFFAFA]/80 max-w-3xl mx-auto">
            Somos una plataforma de automatización que ofrece aplicaciones de atención médica de IA, potenciadas por
            capacidades avanzadas de aprendizaje de alto nivel creativas.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          <div className="w-full md:w-3/5 relative" ref={mapRef}>
            {/* World map with hexagonal pattern */}
            <div className="relative">
              <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-upYfzWRk35vEZnvJvq51V1UZxA13Rf.png')] bg-contain bg-center bg-no-repeat"></div>

              {/* Generate random dots for the map */}
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="map-dot absolute w-1 h-1 rounded-full bg-[#BF3131]"
                  style={{
                    top: `${10 + Math.random() * 80}%`,
                    left: `${10 + Math.random() * 80}%`,
                    opacity: Math.random() * 0.7 + 0.3,
                  }}
                ></div>
              ))}

              {/* Larger dots representing major locations */}
              {[
                { top: "30%", left: "25%" },
                { top: "40%", left: "48%" },
                { top: "35%", left: "70%" },
                { top: "60%", left: "35%" },
                { top: "55%", left: "65%" },
              ].map((pos, i) => (
                <div
                  key={`major-${i}`}
                  className="map-dot absolute w-2 h-2 rounded-full bg-[#BF3131]"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    boxShadow: "0 0 8px #BF3131",
                  }}
                ></div>
              ))}

              <div className="w-full h-[300px] md:h-[400px]"></div>
            </div>
          </div>

          <div className="w-full md:w-2/5">
            <h3 className="values-title text-2xl font-bold text-[#FFFAFA] mb-8">Nuestros Valores:</h3>
            <ul className="space-y-6">
              <li className="value-item flex items-start gap-4">
                <div className="mt-1 bg-[#BF3131]/20 p-2 rounded-full">
                  <Lightbulb className="w-5 h-5 text-[#BF3131]" />
                </div>
                <div>
                  <h4 className="text-[#FFFAFA] font-semibold text-lg">Innovación</h4>
                  <p className="text-[#FFFAFA]/70 text-sm">
                    Constantemente buscamos nuevas formas de mejorar nuestras soluciones.
                  </p>
                </div>
              </li>

              <li className="value-item flex items-start gap-4">
                <div className="mt-1 bg-[#BF3131]/20 p-2 rounded-full">
                  <Accessibility className="w-5 h-5 text-[#BF3131]" />
                </div>
                <div>
                  <h4 className="text-[#FFFAFA] font-semibold text-lg">Accesibilidad</h4>
                  <p className="text-[#FFFAFA]/70 text-sm">
                    Creamos tecnología que sea accesible para todos los profesionales médicos.
                  </p>
                </div>
              </li>

              <li className="value-item flex items-start gap-4">
                <div className="mt-1 bg-[#BF3131]/20 p-2 rounded-full">
                  <Users className="w-5 h-5 text-[#BF3131]" />
                </div>
                <div>
                  <h4 className="text-[#FFFAFA] font-semibold text-lg">Colaboración</h4>
                  <p className="text-[#FFFAFA]/70 text-sm">
                    Trabajamos juntos con profesionales de la salud para crear soluciones efectivas.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
