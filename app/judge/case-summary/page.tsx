"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { CaseSummarizer } from "@/components/judge/case-summarizer"
import { toast } from "sonner"

export default function CaseSummaryPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
      return
    }

    if (isSignedIn && isLoaded) {
      checkRole()
    }
  }, [isSignedIn, isLoaded, router])

  const checkRole = async () => {
    try {
      const response = await fetch("/api/user/role")
      if (response.ok) {
        const data = await response.json()
        const allowedRoles = ['JUDGE', 'SUPER_ADMIN', 'ADMIN']
        if (!allowedRoles.includes(data.role)) {
          toast.error("Access denied. This feature is for Judges only.")
          router.push("/")
        }
      }
    } catch (error) {
      console.error("Failed to check role:", error)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!isSignedIn) return null

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navigation />
      
      <main className="flex-1 px-4 py-10 md:px-6 lg:py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              <span className="gradient-text-glow">AI Case Summarizer</span>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Transform 300-800 page case files into concise, actionable summaries
            </p>
          </div>

          <CaseSummarizer />
        </div>
      </main>
    </div>
  )
}

