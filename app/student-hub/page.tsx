"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, GraduationCap, Brain, Calendar } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function StudentHubPage() {
  const { isSignedIn } = useUser()
  const router = useRouter()

  const features = [
    {
      icon: FileText,
      title: "Case Briefs",
      description: "AI-generated case briefs for quick study",
      comingSoon: true
    },
    {
      icon: BookOpen,
      title: "Bare Act Summaries",
      description: "Simplified summaries of legal acts",
      comingSoon: true
    },
    {
      icon: GraduationCap,
      title: "Previous Year Questions",
      description: "Access PYQs with AI explanations",
      comingSoon: true
    },
    {
      icon: Brain,
      title: "Mock Viva",
      description: "Practice with AI professor",
      comingSoon: true
    },
    {
      icon: Calendar,
      title: "Daily Quiz",
      description: "Test your knowledge daily",
      comingSoon: true
    }
  ]

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navigation />
      
      <main className="flex-1 px-4 py-10 md:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              <span className="gradient-text-glow">Student Hub</span>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Your comprehensive legal learning companion
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="liquid rounded-2xl p-8 liquid-hover relative border border-white/10 hover:border-white/20 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {feature.comingSoon && (
                    <span className="absolute top-4 right-4 text-xs bg-white/20 text-white px-3 py-1.5 rounded-full border border-white/30 font-semibold">
                      Coming Soon
                    </span>
                  )}
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 border border-white/20 mb-6 group-hover:bg-white/15 group-hover:scale-110 transition-all shadow-lg shadow-white/5">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-16 liquid rounded-2xl p-10 text-center border border-white/20 shadow-premium animate-fade-in-up stagger-4">
            <h2 className="text-3xl font-semibold mb-4 text-white">Student Hub - Phase 2</h2>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
              The Student Hub will include case briefs, bare act summaries, previous year questions,
              mock viva sessions with AI, and daily quizzes to help you excel in your legal studies.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

