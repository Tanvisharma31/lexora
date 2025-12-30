"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Shield, Users, FileText, Activity, DollarSign, Globe, 
  AlertTriangle, Eye, Database, Settings, TrendingUp, Server,
  BarChart3, Clock, CheckCircle2, XCircle, Loader2
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface AdminStats {
  total_requests?: number
  total_users?: number
  total_errors?: number
  avg_latency?: number
  organizations?: {
    total: number
    active: number
    by_type: Record<string, number>
  }
  documents?: {
    total: number
    by_source: Record<string, number>
  }
  api_usage?: {
    total_requests: number
    by_endpoint: Record<string, number>
  }
}

export default function AdminDashboard() {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
      return
    }

    if (isSignedIn && isLoaded) {
      checkAdmin()
      fetchStats()
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

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        throw new Error("Failed to fetch stats")
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
          <p className="text-white/70">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navigation />
      
      <main className="flex-1 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 lg:py-16">
        <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 md:space-y-8">
          {/* Header - Responsive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                <span className="gradient-text-glow">Admin Dashboard</span>
              </h1>
              <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-white/70">
                Platform governance, analytics, and monitoring
              </p>
            </div>
            <Badge variant="outline" className="h-fit bg-purple-500/10 text-purple-400 border-purple-500/20 flex-shrink-0 text-xs sm:text-sm">
              <Shield className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Admin Access</span>
              <span className="sm:hidden">Admin</span>
            </Badge>
          </div>

          {/* Quick Stats Cards - Responsive */}
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-white/90 truncate pr-1">Total Requests</CardTitle>
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 flex-shrink-0" />
              </CardHeader>
              <CardContent className="pt-1 sm:pt-2">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  {stats?.total_requests?.toLocaleString() || '0'}
                </div>
                <p className="text-[9px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">API calls processed</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-white/90 truncate pr-1">Active Users</CardTitle>
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
              </CardHeader>
              <CardContent className="pt-1 sm:pt-2">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  {stats?.total_users?.toLocaleString() || '0'}
                </div>
                <p className="text-[9px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">Registered users</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-white/90 truncate pr-1">Error Rate</CardTitle>
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400 flex-shrink-0" />
              </CardHeader>
              <CardContent className="pt-1 sm:pt-2">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  {((stats?.total_errors || 0) / Math.max(stats?.total_requests || 1, 1) * 100).toFixed(2)}%
                </div>
                <p className="text-[9px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">{stats?.total_errors || 0} errors</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-white/90 truncate pr-1">Avg Latency</CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 flex-shrink-0" />
              </CardHeader>
              <CardContent className="pt-1 sm:pt-2">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  {stats?.avg_latency?.toFixed(0) || '0'}ms
                </div>
                <p className="text-[9px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">Response time</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs - Responsive */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto overflow-x-auto scrollbar-hide">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Overview</TabsTrigger>
              <TabsTrigger value="organizations" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Organizations</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Documents</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Analytics</TabsTrigger>
              <TabsTrigger value="monitoring" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Monitoring</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab - Responsive */}
            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Organizations
                    </CardTitle>
                    <CardDescription>Multi-tenant overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Total Organizations</span>
                      <span className="text-2xl font-bold text-white">
                        {stats?.organizations?.total || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Active Organizations</span>
                      <span className="text-2xl font-bold text-green-400">
                        {stats?.organizations?.active || 0}
                      </span>
                    </div>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href="/admin/organizations">
                        View Details →
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documents
                    </CardTitle>
                    <CardDescription>Ingestion statistics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Total Documents</span>
                      <span className="text-2xl font-bold text-white">
                        {stats?.documents?.total || 0}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {stats?.documents?.by_source && Object.entries(stats.documents.by_source).map(([source, count]) => (
                        <div key={source} className="flex justify-between text-sm">
                          <span className="text-white/60 capitalize">{source}</span>
                          <span className="text-white/90">{count}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href="/admin/documents">
                        Manage Documents →
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <Button variant="outline" className="h-auto py-3 sm:py-4 flex-col" asChild>
                      <Link href="/admin/role-analytics">
                        <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 mb-1.5 sm:mb-2" />
                        <span className="text-xs sm:text-sm">Role Analytics</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 sm:py-4 flex-col" asChild>
                      <Link href="/admin/users">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 mb-1.5 sm:mb-2" />
                        <span className="text-xs sm:text-sm">User Management</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 sm:py-4 flex-col sm:col-span-2 md:col-span-1" asChild>
                      <Link href="/admin/logs">
                        <Eye className="h-5 w-5 sm:h-6 sm:w-6 mb-1.5 sm:mb-2" />
                        <span className="text-xs sm:text-sm">Audit Logs</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Organizations Tab */}
            <TabsContent value="organizations" className="space-y-6">
              <OrganizationsTab />
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <DocumentsTab />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsTab />
            </TabsContent>

            {/* Monitoring Tab */}
            <TabsContent value="monitoring" className="space-y-6">
              <MonitoringTab />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

// Organizations Tab Component
function OrganizationsTab() {
  const [orgData, setOrgData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/organizations')
      .then(res => res.json())
      .then(data => {
        setOrgData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Statistics</CardTitle>
          <CardDescription>Multi-tenant usage overview</CardDescription>
        </CardHeader>
        <CardContent>
          {orgData ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border border-muted">
                  <div className="text-2xl font-bold text-white">{orgData.total_organizations || 0}</div>
                  <div className="text-sm text-white/60">Total Organizations</div>
                </div>
                <div className="p-4 rounded-lg border border-muted">
                  <div className="text-2xl font-bold text-green-400">{orgData.active_organizations || 0}</div>
                  <div className="text-sm text-white/60">Active Organizations</div>
                </div>
                <div className="p-4 rounded-lg border border-muted">
                  <div className="text-2xl font-bold text-white">{orgData.total_users || 0}</div>
                  <div className="text-sm text-white/60">Total Users</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-white/60">No organization data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Documents Tab Component
function DocumentsTab() {
  const [docData, setDocData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/documents')
      .then(res => res.json())
      .then(data => {
        setDocData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Ingestion Statistics</CardTitle>
          <CardDescription>Document management and OCR status</CardDescription>
        </CardHeader>
        <CardContent>
          {docData ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border border-muted">
                  <div className="text-2xl font-bold text-white">{docData.total_documents || 0}</div>
                  <div className="text-sm text-white/60">Total Documents</div>
                </div>
                <div className="p-4 rounded-lg border border-muted">
                  <div className="text-2xl font-bold text-white">
                    {docData.by_source 
                      ? (Object.values(docData.by_source) as number[]).reduce((a: number, b: number) => a + b, 0)
                      : 0}
                  </div>
                  <div className="text-sm text-white/60">Documents by Source</div>
                </div>
              </div>
              {docData.by_source && (
                <div className="space-y-2">
                  {Object.entries(docData.by_source).map(([source, count]: [string, any]) => (
                    <div key={source} className="flex justify-between p-2 rounded border border-muted">
                      <span className="text-white/70 capitalize">{source}</span>
                      <span className="text-white font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-white/60">No document data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Analytics Tab Component
function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search & AI Usage Analytics</CardTitle>
          <CardDescription>Feature usage patterns and insights</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border border-muted">
                  <div className="text-2xl font-bold text-white">{analytics.total_searches || 0}</div>
                  <div className="text-sm text-white/60">Total Searches</div>
                </div>
                <div className="p-4 rounded-lg border border-muted">
                  <div className="text-2xl font-bold text-white">{analytics.ai_requests || 0}</div>
                  <div className="text-sm text-white/60">AI Requests</div>
                </div>
                <div className="p-4 rounded-lg border border-muted">
                  <div className="text-2xl font-bold text-white">{analytics.most_used_feature || 'N/A'}</div>
                  <div className="text-sm text-white/60">Most Used Feature</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-white/60">No analytics data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Monitoring Tab Component
function MonitoringTab() {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/system/health')
      .then(res => res.json())
      .then(data => {
        setHealth(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Real-time system monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          {health ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className={`p-4 rounded-lg border ${health.status === 'healthy' ? 'border-green-500' : 'border-red-500'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {health.status === 'healthy' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <div className="text-lg font-bold text-white capitalize">{health.status}</div>
                  </div>
                  <div className="text-sm text-white/60">System Status</div>
                </div>
                <div className="p-4 rounded-lg border border-muted">
                  <div className="text-2xl font-bold text-white">{health.uptime || 'N/A'}</div>
                  <div className="text-sm text-white/60">Uptime</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-white/60">No health data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Settings Tab Component
function SettingsTab() {
  const [toggles, setToggles] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/feature-toggles')
      .then(res => res.json())
      .then(data => {
        setToggles(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Toggles</CardTitle>
          <CardDescription>Enable/disable platform features</CardDescription>
        </CardHeader>
        <CardContent>
          {toggles ? (
            <div className="space-y-4">
              {Object.entries(toggles).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-muted">
                  <span className="text-white/70 capitalize">{key.replace(/_/g, ' ')}</span>
                  <Badge variant={value ? "default" : "secondary"}>
                    {value ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60">No feature toggles available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

