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
    <div className="liquid rounded-2xl p-3 liquid-hover animate-fade-in-up group">
      <div className="relative flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted border border-border transition-all group-hover:bg-muted/80">
          <Search className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a legal question..."
          disabled={disabled || isLoading}
          className={cn(
            "flex-1 bg-transparent text-base md:text-lg text-foreground placeholder:text-muted-foreground",
            "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "py-3 transition-all duration-300",
            "focus:placeholder:text-muted-foreground/70",
            "selection:bg-primary/20 selection:text-foreground"
          )}
          aria-label="Search query"
        />

        {value && (
          <button
            onClick={onClear}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* LLM Toggle */}
        {onLLMToggle && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border backdrop-blur-sm hover:bg-muted/80 hover:border-border/80 transition-all duration-300">
            <Brain className={cn(
              "h-4 w-4 transition-colors",
              enableLLM ? "text-foreground" : "text-muted-foreground"
            )} />
            <Switch
              checked={enableLLM}
              onCheckedChange={onLLMToggle}
              disabled={disabled || isLoading}
              aria-label="Enable AI-powered search"
            />
            <span className="text-xs text-muted-foreground hidden sm:inline whitespace-nowrap font-medium">AI Mode</span>
          </div>
        )}

        <Button
          onClick={onSubmit}
          disabled={!value.trim() || disabled || isLoading}
          className={cn(
            "h-12 rounded-xl px-6 font-semibold",
            "transition-all duration-300",
            "hover:scale-105 active:scale-95",
            "shadow-lg shadow-sm hover:shadow-xl hover:shadow-md",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            "flex items-center gap-2 relative overflow-hidden group",
            enableLLM
              ? "bg-primary text-primary-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          {enableLLM ? (
            <>
              <Brain className="h-4 w-4 relative z-10" />
              <span className="hidden sm:inline relative z-10">Ask AI</span>
              <span className="sm:hidden relative z-10">AI</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 relative z-10" />
              <span className="hidden sm:inline relative z-10">Search</span>
              <span className="sm:hidden relative z-10">Go</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
