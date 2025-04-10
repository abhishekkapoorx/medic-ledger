"use client"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import AboutSection from "@/components/about-section"
import FeaturesSection from "@/components/features-section"
import WhyAISection from "@/components/why-ai-section"
import ApplicationsSection from "@/components/applications-section"
import GenieSection from "@/components/genie-section"
import TransformationSection from "@/components/transformation-section"
import TestimonialsSection from "@/components/testimonal"
import ContactSection from "@/components/contact-section"
import Footer from "@/components/footer"
import { useRef } from "react"
import gsap from "gsap"

export default function Home() {
    const circleRef = useRef(null)
    if (circleRef.current) {
      gsap.to(circleRef.current, {
        scale: 1.05,
        opacity: 0.8,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }

  return (
    <main className="bg-[#141414] relative max-w-screen overflow-x-hidden min-h-screen">
      
      <HeroSection />
      <div className="absolute inset-0">
      {/* <div className="absolute top-0 right-0 rounded-full w-[600px] h-[600px] bg-radial from-[#308E70]/15 to-transparent"></div> */}
      {/* <div className="absolute -bottom-16 left-0 w-[600px] rounded-full h-[600px] bg-radial from-[#CC5A5A]/15 to-transparent"></div> */}
      <div
              ref={circleRef}
              className="absolute top-[400px] -right-[500px] transform -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[350px] md:h-[350px]  lg:w-[500px] lg:h-[500px] rounded-full bg-gradient-to-r from-[#308E70]/20 to-[#308E70]/10 blur-xl"
            ></div>
      <div
              ref={circleRef}
              className="absolute top-[600px] left-0 transform -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[350px] md:h-[350px]  lg:w-[500px] lg:h-[500px] rounded-full bg-gradient-to-r from-[#308E70]/30 to-[#308E70]/10 blur-xl"
            ></div>
    </div>

      <AboutSection />
      <div className="absolute inset-0">
      {/* <div className="absolute top-0 right-0 rounded-full w-[600px] h-[600px] bg-radial from-[#308E70]/15 to-transparent"></div> */}
      {/* <div className="absolute -bottom-16 left-0 w-[600px] rounded-full h-[600px] bg-radial from-[#CC5A5A]/15 to-transparent"></div> */}
      <div
              ref={circleRef}
              className="absolute top-[1400px] -right-[450px] transform -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[350px] md:h-[350px]  lg:w-[500px] lg:h-[500px] rounded-full bg-gradient-to-r from-[#308E70]/20 to-[#308E70]/10 blur-xl"
            ></div>
      
    </div>
    <TestimonialsSection />
      <FeaturesSection />
      {/* <WhyAISection />
      <ApplicationsSection />
      <GenieSection />
      <TransformationSection />
     
      <ContactSection /> */}
      
    </main>
  )
}
