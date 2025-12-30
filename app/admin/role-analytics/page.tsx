"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Gavel, Briefcase, GraduationCap, Building2 } from "lucide-react"
import { toast } from "sonner"

export default function RoleAnalyticsPage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
      return
    }

    if (isSignedIn && isLoaded) {
      checkAdmin()
      fetchAnalytics()
    }
  }, [isSignedIn, isLoaded, router])

  const checkAdmin = async () => {
    try {
      const response = await fetch("/api/user/role")
      if (response.ok) {
        const data = await response.json()
        if (!['SUPER_ADMIN', 'ADMIN'].includes(data.role)) {
          toast.error("Access denied. Admin role required.")
          router.push("/")
        }
      }
    } catch (error) {
      console.error("Failed to check role:", error)
    }
  }

  const fetchAnalytics = async () => {
    // Mock data - in production, fetch from admin APIs
    setAnalytics({
      judge: {
        total_users: 25,
        active_users: 18,
        top_features: [
          { name: "Case Summarizer", usage: 450 },
          { name: "Precedent Search", usage: 380 },
          { name: "Chronology Builder", usage: 220 }
        ],
        avg_session_time: "45 mins",
        user_satisfaction: 4.6
      },
      lawyer: {
        total_users: 156,
        active_users: 112,
        top_features: [
          { name: "Draft Assistant", usage: 2100 },
          { name: "Clause Risk Detector", usage: 1450 },
          { name: "Time Tracking", usage: 980 }
        ],
        avg_session_time: "32 mins",
        user_satisfaction: 4.4
      },
      student: {
        total_users: 842,
        active_users: 524,
        top_features: [
          { name: "Quiz Practice", usage: 5600 },
          { name: "Case Summaries", usage: 4200 },
          { name: "Bare Acts Library", usage: 3800 }
        ],
        avg_session_time: "28 mins",
        user_satisfaction: 4.7
      },
      company: {
        total_users: 48,
        active_users: 36,
        top_features: [
          { name: "Compliance Tracker", usage: 890 },
          { name: "Risk Dashboard", usage: 720 },
          { name: "Contract Lifecycle", usage: 650 }
        ],
        avg_session_time: "52 mins",
        user_satisfaction: 4.5
      }
    })
  }

  if (!isLoaded || !isSignedIn) return null

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navigation />
      
      <main className="flex-1 px-4 py-10 md:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              <span className="gradient-text-glow">Role-Based Analytics</span>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Feature adoption and usage patterns by user role
            </p>
          </div>

          {analytics && (
            <Tabs defaultValue="judge" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="judge" className="flex items-center gap-2">
                  <Gavel className="h-4 w-4" />
                  Judge
                </TabsTrigger>
                <TabsTrigger value="lawyer" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Lawyer
                </TabsTrigger>
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company
                </TabsTrigger>
              </TabsList>

              {(['judge', 'lawyer', 'student', 'company'] as const).map((role) => (
                <TabsContent key={role} value={role} className="space-y-4">
                  {/* Overview Cards */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Total Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{analytics[role].total_users}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Active Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{analytics[role].active_users}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((analytics[role].active_users / analytics[role].total_users) * 100)}% active rate
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Avg Session</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{analytics[role].avg_session_time}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Satisfaction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{analytics[role].user_satisfaction}/5.0</div>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= Math.round(analytics[role].user_satisfaction) ? "text-yellow-500" : "text-gray-300"}>
                              ★
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Most Used Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics[role].top_features.map((feature: any, index: number) => (
                          <div key={feature.name} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                                {index + 1}
                              </Badge>
                              <div>
                                <h4 className="font-semibold">{feature.name}</h4>
                                <p className="text-sm text-muted-foreground">{feature.usage} uses</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {Math.round((feature.usage / analytics[role].total_users) * 10) / 10} uses/user
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>High engagement with core features for {role} role</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Above average session duration indicates deep feature usage</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-500">→</span>
                          <span>Consider adding more advanced features for power users</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}

