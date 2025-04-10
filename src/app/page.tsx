import AboutSection from "@/components/about-section"
import ApplicationsSection from "@/components/applications-section"
import ContactSection from "@/components/contact-section"
import FeaturesSection from "@/components/features-section"
import Footer from "@/components/footer"
import GenieSection from "@/components/genie-section"
import HeroSection from "@/components/hero-section"
import TestimonialsSection from "@/components/testimonal"
import TransformationSection from "@/components/transformation-section"
import WhyAISection from "@/components/why-ai-section"

export default function Home() {
  return (
    <main className="bg-[#141414] min-h-screen">

      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <WhyAISection />
      <ApplicationsSection />
      <GenieSection />
      <TransformationSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
