"use client"

import { useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import { MessageSquare, MessageCircle, Cpu, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function GenieSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const genieRef = useRef(null)

  useEffect(() => {
    if (inView) {
      // Animate the title and subtitle
      gsap.fromTo(".genie-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

      gsap.fromTo(
        ".genie-subtitle",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" },
      )

      // Animate the genie visualization
      if (genieRef.current) {
        gsap.fromTo(
          genieRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1, delay: 0.4, ease: "power2.out" },
        )

        // Create pulsing effect for the genie
        gsap.to(genieRef.current, {
          boxShadow: "0 0 30px rgba(191,49,49,0.5)",
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }

      // Animate the feature cards
      gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          delay: 0.6,
          ease: "back.out(1.7)",
        },
      )

      // Animate the CTA button
      gsap.fromTo(
        ".genie-cta",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 1.4,
          ease: "power2.out",
        },
      )
    }
  }, [inView])

  return (
    <section ref={ref} className="py-20  relative overflow-hidden">
      {/* Background gradient */}
      {/* <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-r from-[#308E70]/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-t from-[#308E70]/10 to-transparent"></div>
      </div> */}

      <div className="container mx-auto px-4 z-10 relative">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <h2 className="genie-title text-3xl md:text-4xl font-bold text-[#FFFAFA] mb-4">
              Descubre la Digitalización
              <br />
              <span className="text-[#308E70]">del Habla con Genie</span>
            </h2>

            <p className="genie-subtitle text-[#FFFAFA]/80 mb-8">
              Genie ofrece a los médicos un asistente de IA único al combinar el procesamiento del lenguaje natural con
              la atención médica especializada.
            </p>

            <Link
              href="#demo"
              className="genie-cta inline-block bg-[#308E70] text-[#FFFAFA] px-6 py-3 rounded-md hover:bg-[#308E70]/80 transition-all transform hover:scale-105"
            >
              Solicitar Demo Gratis
            </Link>
          </div>

          <div className="w-full md:w-1/2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="feature-card bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-6 transform transition-all hover:border-[#308E70]/50 hover:shadow-[0_0_15px_rgba(191,49,49,0.2)]">
                <div className="bg-[#308E70]/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-[#308E70]" />
                </div>
                <h3 className="text-[#308E70] font-bold text-lg mb-2">Preguntas a Genie</h3>
                <p className="text-[#FFFAFA]/70 text-sm">
                  Haz preguntas complejas sobre casos de pacientes y recibe respuestas precisas en segundos.
                </p>
              </div>

              <div className="feature-card bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-6 transform transition-all hover:border-[#308E70]/50 hover:shadow-[0_0_15px_rgba(191,49,49,0.2)]">
                <div className="bg-[#308E70]/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-[#308E70]" />
                </div>
                <h3 className="text-[#308E70] font-bold text-lg mb-2">Respuestas Personalizadas</h3>
                <p className="text-[#FFFAFA]/70 text-sm">
                  Recibe respuestas personalizadas para cada paciente basadas en su historial médico.
                </p>
              </div>

              <div className="feature-card bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-6 transform transition-all hover:border-[#308E70]/50 hover:shadow-[0_0_15px_rgba(191,49,49,0.2)] md:col-span-2">
                <div className="bg-[#308E70]/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6 text-[#308E70]" />
                </div>
                <h3 className="text-[#308E70] font-bold text-lg mb-2">Implementación Futura</h3>
                <p className="text-[#FFFAFA]/70 text-sm">
                  Pronto expandiremos la API y herramientas para que puedas integrar Genie en tu propio sistema.
                </p>
                <div className="mt-4 flex items-center text-[#308E70] text-sm font-medium">
                  <span>Próximamente</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Genie visualization */}
        <div className="mt-16 flex justify-center">
          <div
            ref={genieRef}
            className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-[#308E70] to-[#308E70]/70 flex items-center justify-center"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#141414] flex items-center justify-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-[#308E70]/80 to-[#308E70]/40 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
