"use client"

import { LandingHero } from "@/components/landing-hero"
import { LandingFeatures } from "@/components/landing-features"
import { LandingHowItWorks } from "@/components/landing-how-it-works"
import { LandingTestimonials } from "@/components/landing-testimonials"
import { LandingCTA } from "@/components/landing-cta"
import { LandingFooter } from "@/components/landing-footer"
import { LandingTrustIndicators } from "@/components/landing-trust-indicators"
import { Navigation } from "@/components/navigation"
import { SmoothScroll } from "@/components/smooth-scroll"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SmoothScroll />
      <Navigation />
      <LandingHero />
      <LandingTrustIndicators />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingTestimonials />
      <LandingCTA />
      <LandingFooter />
    </div>
  )
}

