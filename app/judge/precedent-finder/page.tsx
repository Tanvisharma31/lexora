"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CaseCard } from "@/components/legal/case-card"
import { Search, Loader2, BookOpen } from "lucide-react"
import { toast } from "sonner"

export default function PrecedentFinderPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
      return
    }
  }, [isSignedIn, isLoaded, router])

  const searchPrecedents = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/judge/precedent-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, jurisdiction, top_k: 10 }),
        credentials: "include"
      })

      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      setResults(data.precedents || [])
      toast.success(`Found ${data.total_results} precedents`)
    } catch (error) {
      console.error(error)
      toast.error("Search failed")
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || !isSignedIn) return null

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navigation />
      
      <main className="flex-1 px-4 py-10 md:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              <span className="gradient-text-glow">Precedent Finder</span>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Search for relevant precedents with AI-powered semantic search
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Search Precedents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for similar cases, legal issues..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchPrecedents()}
                  className="flex-1"
                />
                <Input
                  placeholder="Jurisdiction (optional)"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-48"
                />
                <Button onClick={searchPrecedents} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Results ({results.length})</h2>
              {results.map((result, index) => (
                <CaseCard
                  key={result.id || index}
                  id={result.id}
                  title={result.title}
                  citation={result.citation}
                  court={result.court}
                  year={result.year}
                  relevance={Math.round(result.relevance_score * 100)}
                  summary={result.summary}
                  onClick={() => toast.info("Case detail view would open here")}
                />
              ))}
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No precedents found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

