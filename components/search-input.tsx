"use client"

import type React from "react"

import { Search, X, Sparkles, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onClear: () => void
  isLoading: boolean
  disabled?: boolean
  enableLLM?: boolean
  onLLMToggle?: (enabled: boolean) => void
}

export function SearchInput({ 
  value, 
  onChange, 
  onSubmit, 
  onClear, 
  isLoading, 
  disabled,
  enableLLM = false,
  onLLMToggle
}: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="liquid rounded-2xl p-2 liquid-hover">
      <div className="relative flex items-center gap-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a legal question..."
          disabled={disabled || isLoading}
          className={cn(
            "flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground",
            "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "py-3",
          )}
          aria-label="Search query"
        />

        {value && (
          <button
            onClick={onClear}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* LLM Toggle */}
        {onLLMToggle && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <Brain className="h-4 w-4 text-primary" />
            <Switch
              checked={enableLLM}
              onCheckedChange={onLLMToggle}
              disabled={disabled || isLoading}
              aria-label="Enable AI-powered search"
            />
            <span className="text-xs text-muted-foreground hidden sm:inline whitespace-nowrap">AI Mode</span>
          </div>
        )}

        <Button
          onClick={onSubmit}
          disabled={!value.trim() || disabled || isLoading}
          className={cn(
            "h-12 rounded-xl bg-primary px-6 text-primary-foreground",
            "hover:bg-primary/90 transition-all liquid-glow",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-2",
          )}
        >
          {enableLLM ? (
            <>
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Ask AI</span>
              <span className="sm:hidden">AI</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
              <span className="sm:hidden">Go</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
