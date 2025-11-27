"use client"

import { Zap, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuotaIndicatorProps {
  tokensRemaining: number
  maxTokens: number
}

export function QuotaIndicator({ tokensRemaining, maxTokens }: QuotaIndicatorProps) {
  const percentage = (tokensRemaining / maxTokens) * 100
  const isLow = percentage <= 40
  const isCritical = percentage <= 20

  return (
    <div className="flex items-center gap-2 liquid-subtle rounded-full px-3 py-1.5">
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium transition-colors",
          isCritical
            ? "text-destructive"
            : isLow
              ? "text-amber-400"
              : "text-accent",
        )}
      >
        <Brain className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">AI: </span>
        <span>
          {tokensRemaining}/{maxTokens}
        </span>
      </div>
      {/* Visual bar */}
      <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted/50 md:block">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isCritical ? "bg-destructive" : isLow ? "bg-amber-500" : "bg-accent",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
