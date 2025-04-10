"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import Link from "next/link"

export default function WhyAISection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView) {
      // Animate the title
      gsap.fromTo(".why-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

      // Animate the cards with staggered effect
      gsap.fromTo(
        ".reason-card",
        {
          opacity: 0,
          y: 50,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          delay: 0.3,
          ease: "back.out(1.7)",
        },
      )

      // Animate the button
      gsap.fromTo(
        ".cta-button",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 1.2,
          ease: "power2.out",
        },
      )

      // Animate the numbers in each card
      gsap.fromTo(
        ".reason-number",
        {
          textShadow: "0 0 0 rgba(191,49,49,0)",
          scale: 1,
        },
        {
          textShadow: "0 0 20px rgba(191,49,49,0.7)",
          scale: 1.1,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.5,
        },
      )
    }
  }, [inView])

  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto bg-[#141414] relative overflow-hidden">
      {/* Background gradient */}
    

      <div className="container mx-auto px-4 z-10 relative">
        <div className="text-center mb-12">
          <h2 className="why-title text-3xl md:text-4xl font-bold text-[#FFFAFA] mb-4">
            ¿Por qué se necesita inteligencia artificial en los seguros de salud,
            <br />
            <span className="text-[#308E70]">cuando los métodos actuales tienen éxito?</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          <div className="reason-card w-full md:w-[30%] bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-6 transform transition-all hover:border-[#308E70]/50 hover:shadow-[0_0_15px_rgba(191,49,49,0.2)]">
            <div className="reason-number text-[#308E70] text-4xl font-bold mb-4">01</div>
            <h3 className="text-[#308E70] font-bold text-xl mb-3">Mayor Competencia</h3>
            <p className="text-[#FFFAFA]/70">
              La creciente competencia y desafíos en el mercado de seguros de salud requieren soluciones más eficientes.
            </p>
          </div>

          <div className="reason-card w-full md:w-[30%] bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-6 transform transition-all hover:border-[#308E70]/50 hover:shadow-[0_0_15px_rgba(191,49,49,0.2)]">
            <div className="reason-number text-[#308E70] text-4xl font-bold mb-4">02</div>
            <h3 className="text-[#308E70] font-bold text-xl mb-3">Transformación Necesaria</h3>
            <p className="text-[#FFFAFA]/70">
              Los métodos actuales de salud necesitan evolucionar para mantenerse al día con los avances tecnológicos.
            </p>
          </div>

          <div className="reason-card w-full md:w-[30%] bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-6 transform transition-all hover:border-[#308E70]/50 hover:shadow-[0_0_15px_rgba(191,49,49,0.2)]">
            <div className="reason-number text-[#308E70] text-4xl font-bold mb-4">03</div>
            <h3 className="text-[#308E70] font-bold text-xl mb-3">Mantenerse a la Vanguardia</h3>
            <p className="text-[#FFFAFA]/70">
              Con MedML, su organización puede liderar la innovación en el sector de la atención médica.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="#demo"
            className="cta-button inline-block bg-[#308E70] text-[#FFFAFA] px-6 py-3 rounded-md hover:bg-[#308E70]/80 transition-all transform hover:scale-105"
          >
            Solicitar Demo Gratis
          </Link>
        </div>
      </div>
    </section>
  )
}
