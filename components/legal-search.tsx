"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { SearchHeader } from "./search-header"
import { SearchInput } from "./search-input"
import { SuggestionChips } from "./suggestion-chips"
import { SampleQueries } from "./sample-queries"
import { ThinkingLoader } from "./thinking-loader"
import { AnswerCard } from "./answer-card"
import { DocumentList } from "./document-list"
import { SearchFooter } from "./search-footer"
import { getRateLimiter } from "@/lib/rate-limiter"
import type { SearchResponse } from "@/lib/mock-data"

const quickSuggestions = ["RTI process", "Property laws", "Consumer rights", "Labour laws"]

export function LegalSearch() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [tokensRemaining, setTokensRemaining] = useState(5)
  const [enableLLM, setEnableLLM] = useState(false)
  const maxTokens = 5

  // Update tokens on mount and periodically
  useEffect(() => {
    const updateTokens = () => {
      const limiter = getRateLimiter()
      setTokensRemaining(limiter.getTokensRemaining())
    }

    updateTokens()
    const interval = setInterval(updateTokens, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setResponse(null)

    try {
      // Use /llm-search if LLM is enabled, otherwise use /search
      const endpoint = enableLLM ? "/api/llm-search" : "/api/search"
      
      // For LLM search, check rate limit first
      if (enableLLM) {
        const limiter = getRateLimiter()
        
        if (!limiter.canMakeRequest()) {
          const waitTime = limiter.getSecondsUntilNextToken()
          toast.error(`Rate limit exceeded`, {
            description: `Too many AI requests. Please wait ${waitTime} seconds before trying again.`,
            duration: 5000,
          })
          setIsLoading(false)
          setTokensRemaining(limiter.getTokensRemaining())
          return
        }

        // Consume token for LLM search
        if (!limiter.consumeToken()) {
          const waitTime = limiter.getSecondsUntilNextToken()
          toast.error(`Rate limit exceeded`, {
            description: `Too many AI requests. Please wait ${waitTime} seconds before trying again.`,
            duration: 5000,
          })
          setIsLoading(false)
          setTokensRemaining(limiter.getTokensRemaining())
          return
        }
        
        setTokensRemaining(limiter.getTokensRemaining())
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: query.trim(), 
          top_k: enableLLM ? 5 : 10 
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Request failed" }))
        
        if (res.status === 429) {
          toast.error("Rate limit exceeded", {
            description: errorData.message || "Too many requests. Please try again later.",
            duration: 5000,
          })
          if (errorData.tokensRemaining !== undefined) {
            setTokensRemaining(errorData.tokensRemaining)
          }
        } else {
          throw new Error(errorData.error || "Search failed")
        }
        return
      }

      const data: SearchResponse = await res.json()
      setResponse(data)
      
      // Update tokens if returned from LLM search
      if (typeof data.tokensRemaining === "number") {
        setTokensRemaining(data.tokensRemaining)
      }
    } catch (error) {
      toast.error("Search failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [query, enableLLM])

  const handleSelectQuery = (selectedQuery: string) => {
    setQuery(selectedQuery)
    // Auto-submit after a brief delay for UX
    setTimeout(() => {
      const input = document.querySelector('input[aria-label="Search query"]') as HTMLInputElement
      if (input) {
        input.focus()
      }
    }, 100)
  }

  const handleClear = () => {
    setQuery("")
    setResponse(null)
  }

  const handleLLMToggle = (enabled: boolean) => {
    setEnableLLM(enabled)
    // Clear response when toggling
    if (response) {
      setResponse(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SearchHeader tokensRemaining={tokensRemaining} maxTokens={maxTokens} />

      <main className="flex-1 px-4 py-6 md:px-6 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Left Sidebar - Sample Queries (Desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <SampleQueries onSelectQuery={handleSelectQuery} disabled={isLoading} />
              </div>
            </aside>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Hero Section */}
              {!response && !isLoading && (
                <div className="mb-8 text-center lg:text-left">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl text-balance">
                    Ask Legal AI
                  </h1>
                  <p className="mt-3 text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                    Get instant answers from Indian laws, acts, and legal precedents. Powered by advanced AI to help you
                    understand legal matters.
                  </p>
                </div>
              )}

              {/* Search Input */}
              <SearchInput
                value={query}
                onChange={setQuery}
                onSubmit={handleSearch}
                onClear={handleClear}
                isLoading={isLoading}
                disabled={enableLLM && tokensRemaining === 0}
                enableLLM={enableLLM}
                onLLMToggle={handleLLMToggle}
              />

              {/* Suggestion Chips */}
              {!response && !isLoading && (
                <div className="space-y-4">
                  <SuggestionChips suggestions={quickSuggestions} onSelect={handleSelectQuery} disabled={isLoading} />

                  {/* Mobile Sample Queries */}
                  <div className="lg:hidden">
                    <SampleQueries onSelectQuery={handleSelectQuery} disabled={isLoading} />
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && <ThinkingLoader />}

              {/* Results */}
              {response && !isLoading && (
                <div className="space-y-6" role="region" aria-live="polite" aria-label="Search Results">
                  <AnswerCard response={response} />
                  <DocumentList sources={response.sources} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SearchFooter />
    </div>
  )
}
