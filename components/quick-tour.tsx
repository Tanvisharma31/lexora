"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface TourStep {
  title: string
  description: string
  target?: string // CSS selector for highlighting
  action?: () => void // Action to perform
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Nyayik",
    description: "India's premier AI-powered legal technology platform. Let's take a quick tour of what we offer.",
  },
  {
    title: "Legal Search",
    description: "Search through Indian laws, acts, and legal precedents with AI-powered answers. Get instant legal information with citations.",
    target: '[href="/"]',
  },
  {
    title: "Document Analysis",
    description: "Upload legal documents for AI-powered analysis including compliance scoring, risk assessment, and clause identification.",
    target: '[href="/analyze"]',
  },
  {
    title: "Contract Drafting",
    description: "Generate legal documents from templates. Create contracts, agreements, and legal notices with AI assistance.",
    target: '[href="/draftgen"]',
  },
  {
    title: "Moot Court Simulator",
    description: "Practice legal arguments with our AI-powered moot court simulator. Play as advocate, judge, or witness.",
    target: '[href="/moot-court"]',
  },
  {
    title: "PDF Translation",
    description: "Translate legal documents and PDFs between Indian languages with AI-powered accuracy.",
    target: '[href="/translate"]',
  },
  {
    title: "Workspace",
    description: "Organize your cases and documents. Store and manage all your legal work in one place.",
    target: '[href="/workspace"]',
  },
  {
    title: "You're All Set!",
    description: "You have 5 free trials for each service. Start exploring and let us know if you need help!",
  },
]

export function QuickTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem("nyayik_tour_completed")
    if (!hasSeenTour) {
      setIsOpen(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const step = TOUR_STEPS[currentStep]
      if (step.action) {
        step.action()
      }
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem("nyayik_tour_completed", "true")
    setIsOpen(false)
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (!isOpen) return null

  const step = TOUR_STEPS[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === TOUR_STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <Card className="w-full max-w-lg liquid-glow border-white/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="gradient-text text-2xl">{step.title}</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSkip}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>

          {/* Progress indicator */}
          <div className="flex gap-2">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all ${
                  index <= currentStep
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {!isFirst && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1 liquid-subtle"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={`flex-1 liquid-glow ${isFirst ? "w-full" : ""}`}
            >
              {isLast ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {!isLast && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full text-xs text-muted-foreground"
            >
              Skip Tour
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

