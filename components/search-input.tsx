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
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 transition-all group-hover:bg-white/10">
          <Search className="h-5 w-5 text-white/60 transition-colors group-hover:text-white" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a legal question..."
          disabled={disabled || isLoading}
          className={cn(
            "flex-1 bg-transparent text-base md:text-lg text-white placeholder:text-white/40",
            "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "py-3 transition-all duration-300",
            "focus:placeholder:text-white/20",
            "selection:bg-white/20 selection:text-white"
          )}
          aria-label="Search query"
        />

        {value && (
          <button
            onClick={onClear}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* LLM Toggle */}
        {onLLMToggle && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <Brain className={cn(
              "h-4 w-4 transition-colors",
              enableLLM ? "text-white" : "text-white/40"
            )} />
            <Switch
              checked={enableLLM}
              onCheckedChange={onLLMToggle}
              disabled={disabled || isLoading}
              aria-label="Enable AI-powered search"
            />
            <span className="text-xs text-white/60 hidden sm:inline whitespace-nowrap font-medium">AI Mode</span>
          </div>
        )}

        <Button
          onClick={onSubmit}
          disabled={!value.trim() || disabled || isLoading}
          className={cn(
            "h-12 rounded-xl px-6 font-semibold",
            "transition-all duration-300",
            "hover:scale-105 active:scale-95",
            "shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            "flex items-center gap-2 relative overflow-hidden group",
            enableLLM 
              ? "bg-gradient-to-r from-white to-white/95 text-black" 
              : "bg-white text-black hover:bg-white/95"
          )}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
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
