"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import gsap from "gsap"
import { Instagram, Twitter, Facebook, Send } from "lucide-react"

export default function ContactSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    purpose: "",
    region: "",
    message: "",
  })

  useEffect(() => {
    if (inView) {
      // Animate the title
      gsap.fromTo(".contact-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

      // Animate the contact info
      gsap.fromTo(
        ".contact-info",
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, delay: 0.3, ease: "power3.out" },
      )

      // Animate the form elements with staggered effect
      gsap.fromTo(
        ".form-element",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.5,
          ease: "power2.out",
        },
      )

      // Animate the submit button
      gsap.fromTo(
        ".submit-button",
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          delay: 1.1,
          ease: "back.out(1.7)",
        },
      )

      // Create hover effect for social icons
      gsap.utils.toArray(".social-icon").forEach((icon) => {
        const element = icon as HTMLElement
        element.addEventListener("mouseenter", () => {
          gsap.to(element, {
            y: -5,
            scale: 1.2,
            color: "#BF3131",
            duration: 0.3,
          })
        })

        element.addEventListener("mouseleave", () => {
          gsap.to(element, {
            y: 0,
            scale: 1,
            color: "#FFFAFA",
            duration: 0.3,
          })
        })
      })
    }
  }, [inView])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted:", formData)
    // Reset form
    setFormData({
      name: "",
      email: "",
      purpose: "",
      region: "",
      message: "",
    })
    // Show success message or redirect
  }

  return (
    <section ref={ref} id="contactanos" className="py-20 bg-[#141414] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-l from-[#BF3131]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-[#BF3131]/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/3">
            <h2 className="contact-title text-3xl md:text-4xl font-bold text-[#BF3131] mb-6">Contáctanos</h2>

            <div className="contact-info space-y-6">
              <p className="text-[#FFFAFA]/80">
                Contáctanos hoy mismo para descubrir cómo MedML puede transformar tu proceso de seguros y llevar tu
                negocio al siguiente nivel.
              </p>

              <div>
                <h3 className="text-[#FFFAFA] font-bold mb-2">Email</h3>
                <p className="text-[#FFFAFA]/80">medml.contacto@gmail.com</p>
              </div>

              <div>
                <h3 className="text-[#FFFAFA] font-bold mb-2">Redes Sociales</h3>
                <div className="flex space-x-4">
                  <a href="#" className="social-icon text-[#FFFAFA] hover:text-[#BF3131] transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="social-icon text-[#FFFAFA] hover:text-[#BF3131] transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="social-icon text-[#FFFAFA] hover:text-[#BF3131] transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-element">
                <label htmlFor="name" className="block text-[#FFFAFA] mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#141414] border border-[#FFFAFA]/20 rounded-md px-4 py-2 text-[#FFFAFA] focus:border-[#BF3131] focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="form-element">
                <label htmlFor="email" className="block text-[#FFFAFA] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#141414] border border-[#FFFAFA]/20 rounded-md px-4 py-2 text-[#FFFAFA] focus:border-[#BF3131] focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="form-element">
                <label htmlFor="purpose" className="block text-[#FFFAFA] mb-2">
                  ¿Para qué nos contactas principalmente?
                </label>
                <select
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full bg-[#141414] border border-[#FFFAFA]/20 rounded-md px-4 py-2 text-[#FFFAFA] focus:border-[#BF3131] focus:outline-none transition-colors"
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="demo">Solicitar una demostración</option>
                  <option value="pricing">Información sobre precios</option>
                  <option value="support">Soporte técnico</option>
                  <option value="partnership">Asociación comercial</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div className="form-element">
                <label htmlFor="region" className="block text-[#FFFAFA] mb-2">
                  Región
                </label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full bg-[#141414] border border-[#FFFAFA]/20 rounded-md px-4 py-2 text-[#FFFAFA] focus:border-[#BF3131] focus:outline-none transition-colors"
                  required
                >
                  <option value="">Selecciona tu región</option>
                  <option value="northamerica">Norteamérica</option>
                  <option value="latinamerica">Latinoamérica</option>
                  <option value="europe">Europa</option>
                  <option value="asia">Asia</option>
                  <option value="africa">África</option>
                  <option value="oceania">Oceanía</option>
                </select>
              </div>

              <div className="form-element">
                <label htmlFor="message" className="block text-[#FFFAFA] mb-2">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full bg-[#141414] border border-[#FFFAFA]/20 rounded-md px-4 py-2 text-[#FFFAFA] focus:border-[#BF3131] focus:outline-none transition-colors resize-none"
                  required
                ></textarea>
              </div>

              <div className="form-element text-right">
                <button
                  type="submit"
                  className="submit-button bg-[#BF3131] text-[#FFFAFA] px-6 py-3 rounded-md hover:bg-[#BF3131]/80 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Enviar
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
