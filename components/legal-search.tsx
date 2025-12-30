"use client"

import { useState, useCallback, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import { TrialExpiredModal } from "./trial-expired-modal"
import { QuotaIndicator } from "./quota-indicator"

const quickSuggestions = ["RTI process", "Property laws", "Consumer rights", "Labour laws"]

export function LegalSearch() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [tokensRemaining, setTokensRemaining] = useState(5)
  const [enableLLM, setEnableLLM] = useState(false)
  const [showTrialModal, setShowTrialModal] = useState(false)
  const [trialService, setTrialService] = useState<string>("")
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

        if (res.status === 403 && errorData.trial_expired) {
          // Show trial expired modal
          setTrialService(errorData.service || "search")
          setShowTrialModal(true)
          setIsLoading(false)
          return
        }

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
    // Redirect to landing page if not signed in
    router.push("/landing")
    return null
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col bg-background">

        {/* Landing Page Content */}
        <main className="flex-1 px-4 py-12 md:px-6 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center space-y-8">
              {/* Hero Section */}
              <div className="space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 rounded-full liquid-subtle px-5 py-2.5 text-sm border border-white/20 shadow-lg shadow-white/5">
                  <Sparkles className="h-4 w-4 text-white" />
                  <span className="text-foreground font-semibold">AI-Powered Legal Search</span>
                </div>

                <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance leading-tight">
                  Find Legal Answers
                  <br />
                  <span className="gradient-text-glow">
                    Instantly
                  </span>
                </h1>

                <p className="mx-auto max-w-2xl text-xl text-muted-foreground md:text-2xl leading-relaxed">
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
              <div className="grid gap-6 md:grid-cols-3 mt-20">
                <div className="liquid rounded-2xl p-8 text-left liquid-hover border border-white/20 shadow-premium animate-fade-in-up stagger-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 mb-6 border border-white/20 shadow-lg shadow-white/5 group-hover:scale-110 transition-transform">
                    <Scale className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Comprehensive Search</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Search across High Court judgements, Central Code, and State Acts all in one place.
                  </p>
                </div>

                <div className="liquid rounded-2xl p-8 text-left liquid-hover border border-white/20 shadow-premium animate-fade-in-up stagger-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 mb-6 border border-white/20 shadow-lg shadow-white/5 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">AI-Powered Answers</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Get intelligent answers with citations and source documents for every query.
                  </p>
                </div>

                <div className="liquid rounded-2xl p-8 text-left liquid-hover border border-white/20 shadow-premium animate-fade-in-up stagger-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 mb-6 border border-white/20 shadow-lg shadow-white/5 group-hover:scale-110 transition-transform">
                    <ArrowRight className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Fast & Accurate</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Get instant results with accurate legal information and proper citations.
                  </p>
                </div>
              </div>

              {/* Search Preview */}
              <div className="mt-20 liquid rounded-2xl p-10 max-w-3xl mx-auto border border-white/20 shadow-premium animate-fade-in-up stagger-4">
                <h2 className="text-3xl font-semibold mb-8 text-white text-center">Try it out</h2>
                <div className="space-y-6">
                  <SuggestionChips
                    suggestions={quickSuggestions}
                    onSelect={(q) => {
                      setQuery(q)
                      router.push("/sign-up")
                    }}
                    disabled={false}
                  />
                  <p className="text-sm text-white/60 text-center font-medium">
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
                <div className="animate-fade-in-up">
                  <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="text-center lg:text-left space-y-4">
                      <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance gradient-text-glow">
                        Ask Nyayik
                      </h1>
                      <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                        Get instant answers from Indian laws, acts, and legal precedents. Powered by advanced AI to help you
                        understand legal matters.
                      </p>
                    </div>
                    <div className="flex justify-center lg:justify-end items-center gap-4 mt-6 lg:mt-0">
                      <QuotaIndicator tokensRemaining={tokensRemaining} maxTokens={maxTokens} />
                      <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-foreground liquid-subtle border border-border shadow-lg shadow-sm hover:bg-secondary/80 transition-all">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                        <span className="text-white">Beta</span>
                      </div>
                    </div>
                  </div>
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
                <div className="space-y-6 animate-fade-in-up stagger-2">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Quick suggestions:</p>
                    <SuggestionChips suggestions={quickSuggestions} onSelect={handleSelectQuery} disabled={isLoading} />
                  </div>

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
                <div className="space-y-8 animate-fade-in-up" role="region" aria-live="polite" aria-label="Search Results">
                  <AnswerCard response={response} />
                  <DocumentList sources={response.sources} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SearchFooter />
      {showTrialModal && (
        <TrialExpiredModal
          service={trialService}
          onClose={() => setShowTrialModal(false)}
        />
      )}
    </div>
  )
}
