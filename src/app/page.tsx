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

export default function Home() {
  return (
    <main className="bg-[#141414] min-h-screen">
      <Header />
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
