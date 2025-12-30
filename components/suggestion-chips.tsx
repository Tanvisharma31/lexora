"use client"

import { cn } from "@/lib/utils"

interface SuggestionChipsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  disabled?: boolean
}

export function SuggestionChips({ suggestions, onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className={cn(
            "rounded-full border border-border bg-secondary backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-muted-foreground",
            "hover:bg-secondary/80 hover:border-border/80 hover:text-foreground hover:scale-105",
            "active:scale-95 transition-all duration-300",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            "shadow-sm hover:shadow-md",
            "animate-fade-in-up",
            `stagger-${Math.min(index + 1, 5)}`
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
