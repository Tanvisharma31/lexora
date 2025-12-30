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
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <MessageSquare className="h-4 w-4 text-muted-foreground/70" />
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
              "hover:bg-secondary/20 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:translate-x-1",
              "active:scale-[0.98]",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0",
              "border border-border",
              "animate-fade-in-up",
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className="text-foreground/90 group-hover:text-foreground font-medium transition-colors">{query}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
