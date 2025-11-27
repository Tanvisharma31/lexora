"use client"

import { MessageSquare } from "lucide-react"
import { sampleQueries } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface SampleQueriesProps {
  onSelectQuery: (query: string) => void
  disabled?: boolean
  className?: string
}

export function SampleQueries({ onSelectQuery, disabled, className }: SampleQueriesProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageSquare className="h-4 w-4" />
        <span>Try asking</span>
      </div>
      <div className="space-y-2">
        {sampleQueries.map((query, index) => (
          <button
            key={index}
            onClick={() => onSelectQuery(query)}
            disabled={disabled}
            className={cn(
              "glass-subtle w-full rounded-xl px-4 py-3 text-left text-sm transition-all",
              "hover:bg-primary/10 hover:border-primary/30",
              "focus:outline-none focus:ring-2 focus:ring-accent/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <span className="text-foreground/90">{query}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
