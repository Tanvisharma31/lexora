"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useUser } from "@clerk/nextjs"

interface TrialUsage {
  service: string
  count: number
  limit: number
  remaining: number
}

export function TrialUsageIndicator() {
  const { isSignedIn } = useUser()
  const [usage, setUsage] = useState<TrialUsage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSignedIn) return

    const fetchUsage = async () => {
      try {
        const response = await fetch("/api/trial/usage")
        if (response.ok) {
          const data = await response.json()
          setUsage(data.usage || [])
        }
      } catch (error) {
        console.error("Failed to fetch trial usage:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsage, 30000)
    return () => clearInterval(interval)
  }, [isSignedIn])

  if (!isSignedIn || loading) return null

  const totalUsed = usage.reduce((sum, u) => sum + u.count, 0)
  const totalLimit = usage.reduce((sum, u) => sum + u.limit, 0)
  const totalRemaining = totalLimit - totalUsed
  const percentage = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0

  const serviceNames: Record<string, string> = {
    search: "Search",
    llm_search: "AI Search",
    analyze_document: "Analysis",
    draftgen: "Drafting",
    translate_pdf: "Translation",
    moot_court: "Moot Court",
    workspace_case: "Workspace",
  }

  return (
    <Card className="liquid-subtle border-white/20">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trial Usage</span>
            <span className="text-xs text-muted-foreground">
              {totalRemaining} of {totalLimit} remaining
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="grid grid-cols-2 gap-2 text-xs">
            {usage.map((u) => {
              const serviceName = serviceNames[u.service] || u.service
              const isExhausted = u.remaining === 0
              return (
                <div
                  key={u.service}
                  className={`flex items-center justify-between p-2 rounded ${
                    isExhausted ? "bg-destructive/10" : "bg-muted/30"
                  }`}
                >
                  <span className="text-muted-foreground">{serviceName}</span>
                  <div className="flex items-center gap-1">
                    {isExhausted ? (
                      <AlertCircle className="h-3 w-3 text-destructive" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-primary" />
                    )}
                    <span className={isExhausted ? "text-destructive" : ""}>
                      {u.remaining}/{u.limit}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

