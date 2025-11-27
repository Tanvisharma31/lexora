"use client"

import { useState, useCallback, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
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
import type { SearchResponse } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Scale, Sparkles, ArrowRight, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

const quickSuggestions = ["RTI process", "Property laws", "Consumer rights", "Labour laws"]

export function LegalSearch() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
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

    // Check if user is signed in before searching
    if (!isSignedIn) {
      toast.info("Please sign in to search", {
        description: "You need to be signed in to use the search feature.",
        duration: 3000,
      })
      router.push("/sign-in")
      return
    }

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
  }, [query, enableLLM, isSignedIn, router])

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

  // Show landing page if not signed in
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* Header without auth */}
        <header className="liquid sticky top-0 z-50 px-4 py-3 md:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 backdrop-blur liquid-glow">
                <Scale className="h-5 w-5 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold tracking-tight text-foreground">LegalAI</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Search</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push("/sign-in")}
                className="liquid-subtle"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/sign-up")}
                className="liquid-glow"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Landing Page Content */}
        <main className="flex-1 px-4 py-12 md:px-6 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center space-y-8">
              {/* Hero Section */}
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center gap-2 rounded-full liquid-subtle px-4 py-2 text-sm">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span>AI-Powered Legal Search</span>
                </div>
                
                <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
                  Find Legal Answers
                  <br />
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Instantly
                  </span>
                </h1>
                
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                  Search through Indian laws, acts, and legal precedents. Get AI-powered answers 
                  to your legal questions with citations and sources.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Button
                    size="lg"
                    onClick={() => router.push("/sign-up")}
                    className="liquid-glow text-lg px-8 py-6 h-auto font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group relative overflow-hidden"
                  >
                    <span className="flex items-center gap-2 relative z-10">
                      Start Searching Free
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-accent/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => router.push("/sign-in")}
                    className="liquid-subtle text-lg px-8 py-6 h-auto font-medium border-primary/30 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg transition-all duration-300 group backdrop-blur-sm relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <span className="flex items-center gap-2 relative z-10">
                      Sign In
                      <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid gap-6 md:grid-cols-3 mt-16">
                <div className="liquid rounded-2xl p-6 text-left liquid-hover">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 mb-4">
                    <Scale className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Comprehensive Search</h3>
                  <p className="text-muted-foreground">
                    Search across High Court judgements, Central Code, and State Acts all in one place.
                  </p>
                </div>

                <div className="liquid rounded-2xl p-6 text-left liquid-hover">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 mb-4">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Answers</h3>
                  <p className="text-muted-foreground">
                    Get intelligent answers with citations and source documents for every query.
                  </p>
                </div>

                <div className="liquid rounded-2xl p-6 text-left liquid-hover">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 mb-4">
                    <ArrowRight className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Fast & Accurate</h3>
                  <p className="text-muted-foreground">
                    Get instant results with accurate legal information and proper citations.
                  </p>
                </div>
              </div>

              {/* Search Preview */}
              <div className="mt-16 liquid rounded-2xl p-8 max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6">Try it out</h2>
                <div className="space-y-4">
                  <SuggestionChips 
                    suggestions={quickSuggestions} 
                    onSelect={(q) => {
                      setQuery(q)
                      router.push("/sign-up")
                    }} 
                    disabled={false} 
                  />
                  <p className="text-sm text-muted-foreground">
                    Sign up to start searching and get AI-powered legal answers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <SearchFooter />
      </div>
    )
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
