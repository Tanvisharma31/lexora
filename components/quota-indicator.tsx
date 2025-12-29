"use client"

import { Brain } from "lucide-react"
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
    <div className="flex items-center gap-3 liquid-subtle rounded-full px-4 py-2.5 border border-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 transition-all group backdrop-blur-sm">
      <div
        className={cn(
          "flex items-center gap-2 text-xs font-bold transition-colors",
          isCritical
            ? "text-white"
            : isLow
              ? "text-amber-400"
              : "text-white",
        )}
      >
        <Brain className={cn(
          "h-4 w-4 transition-transform group-hover:scale-110",
          isCritical && "animate-pulse"
        )} />
        <span className="hidden sm:inline">AI: </span>
        <span className="tabular-nums">
          {tokensRemaining}/{maxTokens}
        </span>
      </div>
      {/* Visual bar with glow effect */}
      <div className="hidden h-2.5 w-24 overflow-hidden rounded-full bg-white/10 md:block relative border border-white/10">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 relative overflow-hidden",
            isCritical 
              ? "bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_12px_rgba(239,68,68,0.6)]" 
              : isLow 
                ? "bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                : "bg-gradient-to-r from-white to-white/80 shadow-[0_0_8px_rgba(255,255,255,0.4)]",
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
