"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { DraftWizard } from "@/components/lawyer/draft-wizard"
import { toast } from "sonner"

export default function DraftAssistantPage() {
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
        const allowedRoles = ['LAWYER', 'ASSOCIATE', 'SUPER_ADMIN', 'ADMIN']
        if (!allowedRoles.includes(data.role)) {
          toast.error("Access denied. This feature is for Lawyers only.")
          router.push("/")
        }
      }
    } catch (error) {
      console.error("Failed to check role:", error)
    }
  }

  if (!isLoaded || !isSignedIn) return null

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navigation />
      
      <main className="flex-1 px-4 py-10 md:px-6 lg:py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              <span className="gradient-text-glow">AI Draft Assistant</span>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Generate court-ready legal documents in minutes
            </p>
          </div>

          <DraftWizard />
        </div>
      </main>
    </div>
  )
}

