"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, CheckCircle, AlertTriangle, Clock, Upload } from "lucide-react"
import { toast } from "sonner"

export default function ComplianceTrackerPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [compliance, setCompliance] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
      return
    }

    if (isSignedIn && isLoaded) {
      fetchCompliance()
    }
  }, [isSignedIn, isLoaded, router])

  const fetchCompliance = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company/compliance`, {
        credentials: "include"
      })
      if (!response.ok) throw new Error("Failed to fetch compliance")
      const data = await response.json()
      setCompliance(data)
    } catch (error) {
      toast.error("Failed to load compliance data")
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
              <span className="gradient-text-glow">Compliance Tracker</span>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Monitor regulatory compliance across all regulations
            </p>
          </div>

          {compliance && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{compliance.overall_compliance_score}%</div>
                    <Progress value={compliance.overall_compliance_score} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Compliant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{compliance.compliant}</div>
                    <p className="text-xs text-muted-foreground">Requirements met</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      In Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{compliance.in_progress}</div>
                    <p className="text-xs text-muted-foreground">Being addressed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Non-Compliant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{compliance.non_compliant}</div>
                    <p className="text-xs text-muted-foreground">Need attention</p>
                  </CardContent>
                </Card>
              </div>

              {/* Requirements List */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {compliance.requirements.map((req: any) => (
                      <Card key={req.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{req.regulation}</Badge>
                              <Badge variant={
                                req.status === 'COMPLIANT' ? 'default' :
                                req.status === 'IN_PROGRESS' ? 'secondary' :
                                'destructive'
                              }>
                                {req.status}
                              </Badge>
                              <Badge variant="outline">{req.priority}</Badge>
                            </div>
                            <h4 className="font-semibold mb-1">{req.requirement}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {req.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {req.dueDate && (
                                <span>Due: {new Date(req.dueDate).toLocaleDateString()}</span>
                              )}
                              {req.assignedTo && (
                                <span>Assigned: {req.assignedTo}</span>
                              )}
                              <span>Score: {req.complianceScore}%</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="outline">
                              <Upload className="h-4 w-4 mr-1" />
                              Upload Evidence
                            </Button>
                            <Button size="sm" variant="ghost">
                              View Details
                            </Button>
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

