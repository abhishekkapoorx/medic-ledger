"use client"

import { useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import { BarChart3, TrendingUp, Laptop } from "lucide-react"
import Link from "next/link"

export default function FeaturesSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const iconsRef = useRef(null)

  useEffect(() => {
    if (inView) {
      // Animate the title
      gsap.fromTo(".features-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

      // Animate the feature items
      gsap.fromTo(
        ".feature-item",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          delay: 0.3,
          ease: "power2.out",
        },
      )

      // Animate the icons
      if (iconsRef.current) {
        gsap.fromTo(
          ".tech-icon",
          { opacity: 0, scale: 0, rotation: -10 },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.6,
            stagger: 0.1,
            delay: 0.8,
            ease: "back.out(1.7)",
          },
        )

        // Create floating animation for icons
        gsap.to(".tech-icon", {
          y: -10,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.2,
        })
      }
    }
  }, [inView])

  return (
    <section ref={ref} className="py-20  max-w-7xl mx-auto relative overflow-hidden">
      {/* Background gradient */}
      {/* <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-r from-[#308E70]/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-t from-[#308E70]/10 to-transparent"></div>
      </div> */}

      <div className="container mx-auto px-4 z-10 relative">
        <div className="text-center mb-12">
          <h2 className="features-title text-3xl md:text-4xl font-bold text-[#308E70] mb-4">¿Qué nos Diferencia?</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-3/5">
            <div className="space-y-8">
              <div className="feature-item bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-6 transform transition-all hover:border-[#308E70]/50 hover:shadow-[0_0_15px_rgba(191,49,49,0.2)]">
                <div className="flex items-start gap-4">
                  <div className="bg-[#308E70]/20 p-3 rounded-full">
                    <BarChart3 className="w-6 h-6 text-[#308E70]" />
                  </div>
                  <div>
                    <h3 className="text-[#FFFAFA] font-bold text-lg">Powerful Analytics and Reporting</h3>
                    <p className="text-[#FFFAFA]/70 mt-2">
                      Acceda a análisis detallados con la información analítica más valiosa disponible en un LLM en
                      línea.
                    </p>
                  </div>
                </div>
              </div>

              <div className="feature-item bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-6 transform transition-all hover:border-[#308E70]/50 hover:shadow-[0_0_15px_rgba(191,49,49,0.2)]">
                <div className="flex items-start gap-4">
                  <div className="bg-[#308E70]/20 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-[#308E70]" />
                  </div>
                  <div>
                    <h3 className="text-[#FFFAFA] font-bold text-lg">Aumento de Ingresos</h3>
                    <p className="text-[#FFFAFA]/70 mt-2">
                      Los usuarios informan de un incremento del 14% en los ingresos gracias a nuestras soluciones de
                      atención médica de IA.
                    </p>
                  </div>
                </div>
              </div>

              <div className="feature-item bg-[#141414] border border-[#FFFAFA]/10 rounded-lg p-6 transform transition-all hover:border-[#308E70]/50 hover:shadow-[0_0_15px_rgba(191,49,49,0.2)]">
                <div className="flex items-start gap-4">
                  <div className="bg-[#308E70]/20 p-3 rounded-full">
                    <Laptop className="w-6 h-6 text-[#308E70]" />
                  </div>
                  <div>
                    <h3 className="text-[#FFFAFA] font-bold text-lg">Facilidad de Uso</h3>
                    <p className="text-[#FFFAFA]/70 mt-2">
                      Nuestra interfaz intuitiva permite a los usuarios de cualquier nivel técnico aprovechar al máximo
                      nuestras soluciones de atención médica de IA.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <Link
                  href="#contactanos"
                  className="inline-block bg-[#308E70] text-[#FFFAFA] px-6 py-3 rounded-md hover:bg-[#308E70]/80 transition-all transform hover:scale-105"
                >
                  Contáctanos
                </Link>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/5" ref={iconsRef}>
            <div className="relative h-[300px] md:h-[400px]">
              {/* Technology icons floating */}
              {[
                { icon: "💻", top: "10%", left: "20%", delay: 0 },
                { icon: "📱", top: "25%", left: "70%", delay: 0.5 },
                { icon: "⚙️", top: "50%", left: "15%", delay: 1 },
                { icon: "🔍", top: "70%", left: "60%", delay: 1.5 },
                { icon: "📊", top: "85%", left: "30%", delay: 2 },
                { icon: "🖥️", top: "40%", left: "80%", delay: 2.5 },
                { icon: "🔧", top: "60%", left: "40%", delay: 3 },
              ].map((item, i) => (
                <div
                  key={i}
                  className="tech-icon absolute text-2xl md:text-3xl"
                  style={{
                    top: item.top,
                    left: item.left,
                    animationDelay: `${item.delay}s`,
                  }}
                >
                  {item.icon}
                </div>
              ))}

              {/* Red glow in the center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-gradient-to-r from-[#308E70]/30 to-[#308E70]/5 blur-3xl"></div>

              {/* Connection lines between icons */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#308E70" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#308E70" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#308E70" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                {/* Lines will be animated with GSAP */}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
