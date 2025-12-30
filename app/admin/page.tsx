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
      
      <main className="flex-1 px-4 py-10 md:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                <span className="gradient-text-glow">Admin Dashboard</span>
              </h1>
              <p className="mt-4 text-lg text-white/70">
                Platform governance, analytics, and monitoring
              </p>
            </div>
            <Badge variant="outline" className="h-fit bg-purple-500/10 text-purple-400 border-purple-500/20">
              <Shield className="mr-2 h-4 w-4" />
              Admin Access
            </Badge>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stats?.total_requests?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-white/60 mt-1">API calls processed</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Active Users</CardTitle>
                <Users className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stats?.total_users?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-white/60 mt-1">Registered users</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {((stats?.total_errors || 0) / Math.max(stats?.total_requests || 1, 1) * 100).toFixed(2)}%
                </div>
                <p className="text-xs text-white/60 mt-1">{stats?.total_errors || 0} errors</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Avg Latency</CardTitle>
                <Clock className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stats?.avg_latency?.toFixed(0) || '0'}ms
                </div>
                <p className="text-xs text-white/60 mt-1">Response time</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
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
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button variant="outline" className="h-auto py-4 flex-col" asChild>
                      <Link href="/admin/role-analytics">
                        <BarChart3 className="h-6 w-6 mb-2" />
                        <span>Role Analytics</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" asChild>
                      <Link href="/admin/users">
                        <Users className="h-6 w-6 mb-2" />
                        <span>User Management</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" asChild>
                      <Link href="/admin/logs">
                        <Eye className="h-6 w-6 mb-2" />
                        <span>Audit Logs</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs - placeholder for now */}
            <TabsContent value="organizations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Management</CardTitle>
                  <CardDescription>Coming soon - Organization-wise dashboard and stats</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white/60">
                    This section will show detailed analytics for each organization/tenant.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Management</CardTitle>
                  <CardDescription>Coming soon - Document ingestion and stats</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white/60">
                    This section will show document ingestion statistics and management tools.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>Usage patterns and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40 text-white/60">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                      <p>Advanced analytics coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Monitoring</CardTitle>
                  <CardDescription>Health checks and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40 text-white/60">
                    <div className="text-center">
                      <Server className="h-12 w-12 mx-auto mb-4" />
                      <p>Real-time monitoring dashboard coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Settings</CardTitle>
                  <CardDescription>Platform configuration and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40 text-white/60">
                    <div className="text-center">
                      <Settings className="h-12 w-12 mx-auto mb-4" />
                      <p>Configuration panel coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

