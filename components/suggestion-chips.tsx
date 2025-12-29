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
            "rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-white/80",
            "hover:bg-white/10 hover:border-white/30 hover:text-white hover:scale-105",
            "active:scale-95 transition-all duration-300",
            "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            "shadow-sm hover:shadow-md hover:shadow-white/10",
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
