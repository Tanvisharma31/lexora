"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ContractAnalyzer } from "@/components/legal/contract-analyzer"
import { Upload, Loader2, Shield } from "lucide-react"
import { toast } from "sonner"

export default function ClauseRiskDetectorPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [contractText, setContractText] = useState("")
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
      return
    }
  }, [isSignedIn, isLoaded, router])

  const analyzeContract = async () => {
    if (!contractText.trim()) {
      toast.error("Please paste contract text")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lawyer/clause-risk-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_text: contractText }),
        credentials: "include"
      })

      if (!response.ok) throw new Error("Analysis failed")

      const data = await response.json()
      setAnalysis(data)
      toast.success("Contract analyzed successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Analysis failed")
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
              <span className="gradient-text-glow">Clause Risk Detector</span>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              AI-powered contract analysis to identify risky clauses
            </p>
          </div>

          {!analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Upload or Paste Contract
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your contract text here..."
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  rows={12}
                />
                <Button onClick={analyzeContract} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Contract...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Analyze for Risks
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {analysis && (
            <ContractAnalyzer
              analysis={analysis}
              documentName="Uploaded Contract"
              loading={loading}
              onReanalyze={() => setAnalysis(null)}
            />
          )}
        </div>
      </main>
    </div>
  )
}

