"use client"

import { SignUp } from "@clerk/nextjs"
import { useEffect, useState } from "react"

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 dark">
        <div className="liquid rounded-2xl p-8 w-full max-w-md">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/5 rounded w-1/2"></div>
            <div className="h-10 bg-white/10 rounded"></div>
            <div className="h-10 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 dark">
      <div className="liquid rounded-2xl p-8 w-full max-w-md">
        <SignUp 
          appearance={{
            variables: {
              colorPrimary: "oklch(0.5 0.18 250)",
              colorBackground: "oklch(0.12 0.025 250)",
              colorText: "oklch(0.98 0 0)",
              colorInputBackground: "oklch(0.18 0.03 250 / 0.6)",
              colorInputText: "oklch(0.98 0 0)",
              borderRadius: "1rem",
            },
            elements: {
              rootBox: "mx-auto dark",
              card: "liquid shadow-none bg-transparent border-0",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "liquid-subtle hover:liquid-hover",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground liquid-glow",
              formFieldInput: "liquid-subtle text-foreground border-primary/30",
              formFieldLabel: "text-foreground",
              footerActionLink: "text-primary hover:text-primary/80",
            }
          }}
        />
      </div>
    </div>
  )
}

