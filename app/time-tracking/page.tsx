"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
    Clock, Play, Pause, Plus, DollarSign, Calendar,
    TrendingUp, FileText, Download, Filter, Search
} from "lucide-react"
import { toast } from "sonner"

interface TimeEntry {
    id: string
    case_id?: string
    case_title?: string
    activity_type: string
    description: string
    duration_minutes: number
    billable: boolean
    rate_per_hour?: number
    amount?: number
    date: string
    created_at: string
}

interface ActiveTimer {
    id: string
    case_id?: string
    activity_type: string
    description: string
    duration_seconds: number
    started_at: string
}

interface TimeStats {
    total_hours: number
    billable_hours: number
    total_amount: number
    activity_breakdown: Array<{
        activity_type: string
        count: number
        hours: number
    }>
}

export default function TimeTrackingPage() {
    const { isSignedIn, isLoaded } = useUser()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("tracker")
    const [loading, setLoading] = useState(true)
    
    // Timer state
    const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
    const [timerDisplay, setTimerDisplay] = useState("00:00:00")
    
    // Time entries state
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
    const [stats, setStats] = useState<TimeStats | null>(null)
    
    // Form state
    const [showNewEntry, setShowNewEntry] = useState(false)
    const [newEntry, setNewEntry] = useState({
        activity_type: "Research",
        description: "",
        duration_minutes: 60,
        billable: true,
        rate_per_hour: 5000,
        date: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push("/sign-in")
            return
        }

        if (isSignedIn && isLoaded) {
            fetchData()
        }
    }, [isSignedIn, isLoaded, router])

    // Update timer display
    useEffect(() => {
        if (!activeTimer) return

        const interval = setInterval(() => {
            const startTime = new Date(activeTimer.started_at).getTime()
            const now = Date.now()
            const elapsed = Math.floor((now - startTime) / 1000)
            
            const hours = Math.floor(elapsed / 3600)
            const minutes = Math.floor((elapsed % 3600) / 60)
            const seconds = elapsed % 60

            setTimerDisplay(
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            )
        }, 1000)

        return () => clearInterval(interval)
    }, [activeTimer])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch active timer
            const timerRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/time-tracking/timer/active`, {
                headers: {
                    'X-Clerk-User-Id': 'current-user-id' // Replace with actual
                }
            })
            if (timerRes.ok) {
                const data = await timerRes.json()
                setActiveTimer(data)
            }

            // Fetch time entries
            const entriesRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/time-tracking/entries`)
            if (entriesRes.ok) {
                const data = await entriesRes.json()
                setTimeEntries(data)
            }

            // Fetch stats
            const statsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/time-tracking/stats?period=month`)
            if (statsRes.ok) {
                const data = await statsRes.json()
                setStats(data)
            }
        } catch (error) {
            console.error("Failed to fetch data:", error)
            toast.error("Failed to load time tracking data")
        } finally {
            setLoading(false)
        }
    }

    const startTimer = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/time-tracking/timer/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    activity_type: "Research",
                    description: "Legal research",
                    billable: true,
                    rate_per_hour: 5000
                })
            })

            if (response.ok) {
                const data = await response.json()
                setActiveTimer(data)
                toast.success("Timer started")
            } else {
                const error = await response.json()
                toast.error(error.detail || "Failed to start timer")
            }
        } catch (error) {
            toast.error("Failed to start timer")
        }
    }

    const stopTimer = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/time-tracking/timer/stop`, {
                method: 'POST'
            })

            if (response.ok) {
                const data = await response.json()
                setActiveTimer(null)
                setTimerDisplay("00:00:00")
                toast.success(`Timer stopped. ${(data.duration_minutes / 60).toFixed(2)} hours recorded`)
                fetchData()
            }
        } catch (error) {
            toast.error("Failed to stop timer")
        }
    }

    const createTimeEntry = async () => {
        if (!newEntry.description) {
            toast.error("Description is required")
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/time-tracking/entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...newEntry,
                    tags: []
                })
            })

            if (response.ok) {
                toast.success("Time entry created")
                setShowNewEntry(false)
                setNewEntry({
                    activity_type: "Research",
                    description: "",
                    duration_minutes: 60,
                    billable: true,
                    rate_per_hour: 5000,
                    date: new Date().toISOString().split('T')[0]
                })
                fetchData()
            } else {
                toast.error("Failed to create time entry")
            }
        } catch (error) {
            toast.error("Failed to create time entry")
        }
    }

    if (!isLoaded || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
                                <span className="gradient-text-glow">Time Tracking & Billing</span>
                            </h1>
                            <p className="mt-4 text-lg text-white/70">Track billable hours and generate invoices</p>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Hours (Month)</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.total_hours.toFixed(1) || 0}</div>
                                <p className="text-xs text-muted-foreground">All activities</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.billable_hours.toFixed(1) || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats ? Math.round((stats.billable_hours / stats.total_hours) * 100) : 0}% of total
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{stats?.total_amount.toLocaleString() || 0}</div>
                                <p className="text-xs text-muted-foreground">Billable revenue</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Entries</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{timeEntries.length}</div>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="tracker">
                                <Clock className="mr-2 h-4 w-4" />
                                Timer
                            </TabsTrigger>
                            <TabsTrigger value="entries">
                                <FileText className="mr-2 h-4 w-4" />
                                Time Entries
                            </TabsTrigger>
                            <TabsTrigger value="reports">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Reports
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tracker" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Active Timer</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center space-y-6">
                                        <div className="text-6xl font-mono font-bold text-white">
                                            {timerDisplay}
                                        </div>
                                        {activeTimer ? (
                                            <>
                                                <div className="text-white/70">
                                                    <p className="font-semibold">{activeTimer.activity_type}</p>
                                                    <p className="text-sm">{activeTimer.description}</p>
                                                </div>
                                                <Button onClick={stopTimer} size="lg" variant="destructive">
                                                    <Pause className="mr-2 h-5 w-5" />
                                                    Stop Timer
                                                </Button>
                                            </>
                                        ) : (
                                            <Button onClick={startTimer} size="lg">
                                                <Play className="mr-2 h-5 w-5" />
                                                Start Timer
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-white">Or add manual entry</h3>
                                <Button onClick={() => setShowNewEntry(!showNewEntry)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Entry
                                </Button>
                            </div>

                            {showNewEntry && (
                                <Card>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="text-sm font-medium text-white/90 mb-2 block">Activity Type</label>
                                                <select
                                                    value={newEntry.activity_type}
                                                    onChange={(e) => setNewEntry({...newEntry, activity_type: e.target.value})}
                                                    className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white"
                                                >
                                                    <option value="Research">Research</option>
                                                    <option value="Drafting">Drafting</option>
                                                    <option value="Court Appearance">Court Appearance</option>
                                                    <option value="Client Meeting">Client Meeting</option>
                                                    <option value="Review">Review</option>
                                                    <option value="Consultation">Consultation</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-white/90 mb-2 block">Duration (minutes)</label>
                                                <Input
                                                    type="number"
                                                    value={newEntry.duration_minutes}
                                                    onChange={(e) => setNewEntry({...newEntry, duration_minutes: parseInt(e.target.value)})}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-white/90 mb-2 block">Description</label>
                                            <textarea
                                                value={newEntry.description}
                                                onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                                                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white min-h-[100px]"
                                                placeholder="What did you work on?"
                                            />
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div>
                                                <label className="text-sm font-medium text-white/90 mb-2 block">Rate (₹/hour)</label>
                                                <Input
                                                    type="number"
                                                    value={newEntry.rate_per_hour}
                                                    onChange={(e) => setNewEntry({...newEntry, rate_per_hour: parseFloat(e.target.value)})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-white/90 mb-2 block">Date</label>
                                                <Input
                                                    type="date"
                                                    value={newEntry.date}
                                                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <label className="flex items-center text-sm font-medium text-white/90">
                                                    <input
                                                        type="checkbox"
                                                        checked={newEntry.billable}
                                                        onChange={(e) => setNewEntry({...newEntry, billable: e.target.checked})}
                                                        className="mr-2"
                                                    />
                                                    Billable
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <Button variant="ghost" onClick={() => setShowNewEntry(false)}>Cancel</Button>
                                            <Button onClick={createTimeEntry}>Create Entry</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="entries" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-white">Recent Time Entries</h3>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filter
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {timeEntries.map((entry) => (
                                    <Card key={entry.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={entry.billable ? "default" : "secondary"}>
                                                            {entry.activity_type}
                                                        </Badge>
                                                        {entry.billable && <Badge variant="outline">Billable</Badge>}
                                                    </div>
                                                    <p className="text-white font-medium">{entry.description}</p>
                                                    {entry.case_title && (
                                                        <p className="text-sm text-white/60">Case: {entry.case_title}</p>
                                                    )}
                                                    <p className="text-sm text-white/50">
                                                        {new Date(entry.date).toLocaleDateString()} • {(entry.duration_minutes / 60).toFixed(2)} hours
                                                    </p>
                                                </div>
                                                {entry.amount && (
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold text-white">₹{entry.amount.toLocaleString()}</p>
                                                        <p className="text-sm text-white/60">₹{entry.rate_per_hour}/hr</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="reports" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Activity Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {stats?.activity_breakdown.map((activity) => (
                                            <div key={activity.activity_type} className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-white">{activity.activity_type}</p>
                                                    <p className="text-sm text-white/60">{activity.count} entries</p>
                                                </div>
                                                <p className="text-lg font-bold text-white">{activity.hours.toFixed(1)}h</p>
                                            </div>
                                        ))}
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

