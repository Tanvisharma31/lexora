
"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from "recharts"
import { Activity, Server, Clock, AlertCircle, RefreshCw, Users, UserCog, Shield, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { getRoleDisplayName } from "@/lib/rbac-matrix"

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("analytics")
    const [stats, setStats] = useState<any>(null)
    const [logs, setLogs] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [userStats, setUserStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [userFilters, setUserFilters] = useState({ role: "", active: "" })
    const [editingUser, setEditingUser] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [statsRes, logsRes, usersRes, userStatsRes] = await Promise.all([
                fetch("/api/admin/stats"),
                fetch("/api/admin/logs?limit=50"),
                fetch("/api/admin/users"),
                fetch("/api/admin/users/stats")
            ])

            const statsData = await statsRes.json()
            const logsData = await logsRes.json()
            const usersData = await usersRes.json()
            const userStatsData = await userStatsRes.json()

            setStats(statsData)
            setLogs(logsData)
            setUsers(usersData)
            setUserStats(userStatsData)
        } catch (error) {
            console.error("Failed to fetch admin data", error)
        } finally {
            setLoading(false)
        }
    }

    const updateUser = async (userId: string, updates: { role?: string; active?: boolean }) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            })

            if (!response.ok) {
                throw new Error("Failed to update user")
            }

            toast.success("User updated successfully")
            setEditingUser(null)
            fetchData()
        } catch (error) {
            toast.error("Failed to update user")
        }
    }

    useEffect(() => {
        fetchData()
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

    if (loading && !stats) {
        return (
            <div className="flex min-h-screen flex-col bg-black">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-black">
            <Navigation />

            <main className="flex-1 px-4 py-10 md:px-6 lg:py-16">
                <div className="mx-auto max-w-7xl space-y-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-fade-in-up">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                                <span className="gradient-text-glow">Admin Dashboard</span>
                            </h1>
                            <p className="mt-4 text-lg text-white/70">Manage users, monitor system, and view analytics</p>
                        </div>
                        <Button onClick={fetchData} variant="outline" size="sm" className="hover:scale-105 active:scale-95 transition-all">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="analytics">
                                <Activity className="mr-2 h-4 w-4" />
                                Analytics
                            </TabsTrigger>
                            <TabsTrigger value="users">
                                <Users className="mr-2 h-4 w-4" />
                                Users ({userStats?.total_users || 0})
                            </TabsTrigger>
                            <TabsTrigger value="logs">
                                <Server className="mr-2 h-4 w-4" />
                                Audit Logs
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="analytics" className="space-y-4">
                            {/* Key Metrics */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.total_requests || 0}</div>
                                <p className="text-xs text-muted-foreground">All time API calls</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">24h Activity</CardTitle>
                                <Server className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.requests_24h || 0}</div>
                                <p className="text-xs text-muted-foreground">Requests in last 24 hours</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.avg_latency_ms || 0} ms</div>
                                <p className="text-xs text-muted-foreground">Average response time</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats?.status_codes?.find((s: any) => s.status_code === 500)?.count || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">Total server errors</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Top Endpoints</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.top_endpoints || []} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="endpoint" type="category" width={150} tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Status Codes</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats?.status_codes || []}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                            nameKey="status_code"
                                        >
                                            {(stats?.status_codes || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                        </TabsContent>

                        <TabsContent value="users" className="space-y-4">
                            {/* User Stats */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{userStats?.total_users || 0}</div>
                                        <p className="text-xs text-muted-foreground">All registered users</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{userStats?.recent_signups_30d || 0}</div>
                                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">By Role</CardTitle>
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {Object.keys(userStats?.by_role || {}).length}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Active role types</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* User Filters */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Filters</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4">
                                        <Select value={userFilters.role} onValueChange={(value) => setUserFilters({...userFilters, role: value})}>
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="Filter by Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Roles</SelectItem>
                                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                                <SelectItem value="ADMIN">Admin</SelectItem>
                                                <SelectItem value="JUDGE">Judge</SelectItem>
                                                <SelectItem value="LAWYER">Lawyer</SelectItem>
                                                <SelectItem value="ASSOCIATE">Associate</SelectItem>
                                                <SelectItem value="IN_HOUSE_COUNSEL">In-House Counsel</SelectItem>
                                                <SelectItem value="STUDENT">Student</SelectItem>
                                                <SelectItem value="COMPLIANCE_OFFICER">Compliance Officer</SelectItem>
                                                <SelectItem value="CLERK">Clerk</SelectItem>
                                                <SelectItem value="READ_ONLY_AUDITOR">Auditor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={userFilters.active} onValueChange={(value) => setUserFilters({...userFilters, active: value})}>
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="Filter by Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Status</SelectItem>
                                                <SelectItem value="true">Active</SelectItem>
                                                <SelectItem value="false">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button onClick={fetchData} variant="outline">
                                            Apply Filters
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Users Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Management</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <div className="relative w-full overflow-auto">
                                            <table className="w-full caption-bottom text-sm text-left">
                                                <thead className="[&_tr]:border-b">
                                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Email</th>
                                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Role</th>
                                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Created</th>
                                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="[&_tr:last-child]:border-0">
                                                    {users.map((user) => (
                                                        <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                                            <td className="p-4 align-middle">{user.email}</td>
                                                            <td className="p-4 align-middle">{user.name || '-'}</td>
                                                            <td className="p-4 align-middle">
                                                                {editingUser === user.id ? (
                                                                    <Select 
                                                                        defaultValue={user.role}
                                                                        onValueChange={(value) => updateUser(user.id, { role: value })}
                                                                    >
                                                                        <SelectTrigger className="w-[150px]">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="JUDGE">Judge</SelectItem>
                                                                            <SelectItem value="LAWYER">Lawyer</SelectItem>
                                                                            <SelectItem value="ASSOCIATE">Associate</SelectItem>
                                                                            <SelectItem value="IN_HOUSE_COUNSEL">In-House Counsel</SelectItem>
                                                                            <SelectItem value="STUDENT">Student</SelectItem>
                                                                            <SelectItem value="COMPLIANCE_OFFICER">Compliance Officer</SelectItem>
                                                                            <SelectItem value="CLERK">Clerk</SelectItem>
                                                                            <SelectItem value="READ_ONLY_AUDITOR">Auditor</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                ) : (
                                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                                                                        {getRoleDisplayName(user.role)}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 align-middle">
                                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                                    user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {user.active ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 align-middle text-muted-foreground">
                                                                {new Date(user.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-4 align-middle">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                                                                >
                                                                    <UserCog className="h-4 w-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="logs" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity Log</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <div className="relative w-full overflow-auto">
                                            <table className="w-full caption-bottom text-sm text-left">
                                                <thead className="[&_tr]:border-b">
                                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Time</th>
                                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Method</th>
                                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Endpoint</th>
                                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Latency</th>
                                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">IP</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="[&_tr:last-child]:border-0">
                                                    {logs.map((log) => (
                                                        <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                                                            <td className="p-4 align-middle">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                                            <td className="p-4 align-middle font-mono">{log.method}</td>
                                                            <td className="p-4 align-middle">{log.endpoint}</td>
                                                            <td className="p-4 align-middle">
                                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                                    log.status_code >= 500 ? 'bg-destructive/10 text-destructive' :
                                                                    log.status_code >= 400 ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                                }`}>
                                                                    {log.status_code}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 align-middle">{Math.round(log.latency_ms)}ms</td>
                                                            <td className="p-4 align-middle text-muted-foreground">{log.ip_address || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
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
