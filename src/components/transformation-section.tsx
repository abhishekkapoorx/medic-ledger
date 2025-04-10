"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import { Layers, GitBranch, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function TransformationSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView) {
      // Animate the title and subtitle
      gsap.fromTo(".transform-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

      gsap.fromTo(
        ".transform-subtitle",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" },
      )

      // Animate the layer cards
      gsap.fromTo(
        ".layer-card",
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          delay: 0.4,
          ease: "back.out(1.7)",
        },
      )

      // Animate the CTA section
      gsap.fromTo(
        ".cta-section",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 1.2,
          ease: "power3.out",
        },
      )

      // Create hover effect for layer cards
      gsap.utils.toArray(".layer-card").forEach((card) => {
        const element = card as HTMLElement;
        element.addEventListener("mouseenter", () => {
          gsap.to(element, {
            y: -10,
            boxShadow: "0 10px 30px rgba(191,49,49,0.3)",
            borderColor: "rgba(191,49,49,0.5)",
            duration: 0.3,
          })
        })
        element.addEventListener("mouseleave", () => {
          gsap.to(element, {
            y: 0,
            boxShadow: "0 0 0 rgba(191,49,49,0)",
            borderColor: "rgba(255,250,250,0.1)",
            duration: 0.3,
          })
        })
      })
    }
  }, [inView])

  return (
    <section ref={ref} className="py-20 bg-[#141414] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-l from-[#BF3131]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-[#BF3131]/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="text-center mb-12">
          <h2 className="transform-title text-3xl md:text-4xl font-bold text-[#BF3131] mb-4">
            Revoluciona tu Proceso con Capas de Transformación
          </h2>
          <p className="transform-subtitle text-[#FFFAFA]/80">
            MedML se destaca en el mercado por estas razones clave:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="layer-card bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-6 transition-all">
            <div className="bg-[#BF3131]/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-[#BF3131]" />
            </div>
            <h3 className="text-[#BF3131] font-bold text-lg mb-3">Capa de Tecnología Profunda</h3>
            <p className="text-[#FFFAFA]/70">
              Inteligencia transformadora que aprovecha los últimos avances en aprendizaje profundo para proporcionar
              una comprensión sin precedentes de los datos médicos complejos.
            </p>
          </div>

          <div className="layer-card bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-6 transition-all">
            <div className="bg-[#BF3131]/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <GitBranch className="w-6 h-6 text-[#BF3131]" />
            </div>
            <h3 className="text-[#BF3131] font-bold text-lg mb-3">Capa de Automatización del Flujo de Trabajo</h3>
            <p className="text-[#FFFAFA]/70">
              Sistemas avanzados que automatizan procesos, integran sistemas existentes y mejoran la eficiencia
              operativa.
            </p>
          </div>

          <div className="layer-card bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-6 transition-all">
            <div className="bg-[#BF3131]/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-[#BF3131]" />
            </div>
            <h3 className="text-[#BF3131] font-bold text-lg mb-3">Capa de Comunicación Digital</h3>
            <p className="text-[#FFFAFA]/70">
              Mejora la comunicación entre pacientes y proveedores con herramientas digitales que simplifican tus
              procesos y feedback del paciente.
            </p>
          </div>
        </div>

        {/* CTA Section with red background */}
        <div className="cta-section mt-20 bg-[#BF3131] rounded-lg overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-[#FFFAFA] mb-4">
              ¿Listo para posicionarte en la cresta de la ola?
            </h3>
            <p className="text-[#FFFAFA]/80 mb-8">
              Con la tecnología MedML, AI en la atención médica puede obtener los beneficios de la inteligencia
              artificial en tus seguros médicos en muy poco tiempo.
            </p>
            <Link
              href="#demo"
              className="inline-block bg-[#FFFAFA] text-[#BF3131] px-6 py-3 rounded-md hover:bg-[#FFFAFA]/90 transition-all transform hover:scale-105 font-medium"
            >
              Solicitar Demo Gratis
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
