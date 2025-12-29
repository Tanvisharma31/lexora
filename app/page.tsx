"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LegalSearch } from "@/components/legal-search"
import { Navigation } from "@/components/navigation"
import { QuickTour } from "@/components/quick-tour"

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/landing")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <>
      <Navigation />
      <LegalSearch />
      <QuickTour />
    </>
  )
}
