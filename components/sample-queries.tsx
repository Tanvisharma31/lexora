"use client"

import { MessageSquare } from "lucide-react"
import { sampleQueries } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SampleQueriesProps {
  onSelectQuery: (query: string) => void
  disabled?: boolean
  className?: string
}

export function SampleQueries({ onSelectQuery, disabled, className }: SampleQueriesProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
        <MessageSquare className="h-4 w-4 text-white/60" />
        <span>Try asking</span>
      </div>
      <div className="space-y-2.5">
        {sampleQueries.map((query, index) => (
          <button
            key={index}
            onClick={() => onSelectQuery(query)}
            disabled={disabled}
            className={cn(
              "liquid-subtle w-full rounded-xl px-5 py-3.5 text-left text-sm transition-all group",
              "hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/5 hover:translate-x-1",
              "active:scale-[0.98]",
              "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0",
              "border border-white/10",
              "animate-fade-in-up",
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className="text-white/90 group-hover:text-white font-medium transition-colors">{query}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
