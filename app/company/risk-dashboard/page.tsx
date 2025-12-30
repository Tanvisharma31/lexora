"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, TrendingDown, Shield } from "lucide-react"
import { toast } from "sonner"

export default function RiskDashboardPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [riskData, setRiskData] = useState<any>(null)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
      return
    }

    if (isSignedIn && isLoaded) {
      fetchRiskData()
    }
  }, [isSignedIn, isLoaded, router])

  const fetchRiskData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company/risk-analysis`, {
        credentials: "include"
      })
      if (!response.ok) throw new Error("Failed to fetch risk data")
      const data = await response.json()
      setRiskData(data)
    } catch (error) {
      toast.error("Failed to load risk data")
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
              <span className="gradient-text-glow">Risk Dashboard</span>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Monitor and manage legal risks across your organization
            </p>
          </div>

          {riskData && (
            <>
              {/* Overall Risk Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Overall Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-4xl font-bold">{riskData.overall_risk_score}/100</div>
                      <Badge variant={
                        riskData.risk_level === 'low' ? 'default' :
                        riskData.risk_level === 'medium' ? 'secondary' :
                        'destructive'
                      } className="mt-2">
                        {riskData.risk_level.toUpperCase()} RISK
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {riskData.trend === 'improving' ? (
                        <>
                          <TrendingDown className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-green-500">Improving</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-5 w-5 text-red-500" />
                          <span className="text-sm text-red-500">Worsening</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Progress value={riskData.overall_risk_score} className="h-3" />
                </CardContent>
              </Card>

              {/* Risk Categories */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Contract Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-red-500">High</span>
                        <span>{riskData.contract_risks.high}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-500">Medium</span>
                        <span>{riskData.contract_risks.medium}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-500">Low</span>
                        <span>{riskData.contract_risks.low}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Compliance Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-red-500">Critical</span>
                        <span>{riskData.compliance_risks.critical}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-500">High</span>
                        <span>{riskData.compliance_risks.high}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-500">Medium</span>
                        <span>{riskData.compliance_risks.medium}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Litigation Exposure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Cases</span>
                        <span>{riskData.litigation_exposure.active_cases}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Liability</span>
                        <span>{riskData.litigation_exposure.potential_liability}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Probability</span>
                        <Badge variant="outline">{riskData.litigation_exposure.probability_of_loss}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Risks */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Risks Requiring Attention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riskData.top_risks.map((risk: any) => (
                      <Card key={risk.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                            risk.severity === 'high' ? 'text-red-500' :
                            risk.severity === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{risk.title}</h4>
                              <Badge variant={
                                risk.severity === 'high' ? 'destructive' :
                                risk.severity === 'medium' ? 'default' :
                                'secondary'
                              }>
                                {risk.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {risk.category}
                            </p>
                            <p className="text-sm mb-2">
                              <strong>Exposure:</strong> {risk.exposure}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>Mitigation:</strong> {risk.mitigation}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

