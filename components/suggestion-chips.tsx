"use client"

import { cn } from "@/lib/utils"

interface SuggestionChipsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  disabled?: boolean
}

export function SuggestionChips({ suggestions, onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className={cn(
            "rounded-full border border-border/50 bg-secondary/50 px-4 py-2 text-sm text-secondary-foreground",
            "hover:bg-primary/10 hover:border-primary/30 transition-all",
            "focus:outline-none focus:ring-2 focus:ring-accent/50",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
