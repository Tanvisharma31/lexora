"use client"

import {  UserButton } from "@clerk/nextjs"
import { QuotaIndicator } from "./quota-indicator"
import { Scale, Sparkles } from "lucide-react"

interface SearchHeaderProps {
  tokensRemaining: number
  maxTokens: number
}

export function SearchHeader({ tokensRemaining, maxTokens }: SearchHeaderProps) {
  return (
    <header className="liquid sticky top-0 z-50 px-4 py-3 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 backdrop-blur liquid-glow">
            <Scale className="h-5 w-5 text-accent" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-foreground">LegalAI</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Search</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <QuotaIndicator tokensRemaining={tokensRemaining} maxTokens={maxTokens} />
          <div className="hidden items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs text-accent md:flex liquid-subtle">
            <Sparkles className="h-3 w-3" />
            <span>Beta</span>
          </div>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
                userButtonPopoverCard: "liquid",
              }
            }}
          />
        </div>
      </div>
    </header>
  )
}
