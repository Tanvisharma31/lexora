"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
    Scale, FileText, Search, Clock, AlertCircle, RefreshCw, 
    Gavel, BookOpen, Languages, Calendar, Filter, Download,
    Eye, FileSearch, GitCompare, List, AlertTriangle, CheckCircle2,
    ExternalLink, ArrowRight
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function JudgeDashboard() {
    const { isSignedIn, isLoaded } = useUser()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("cases")
    const [cases, setCases] = useState<any[]>([])
    const [precedents, setPrecedents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCase, setSelectedCase] = useState<any>(null)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [stats, setStats] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [precedentSearchQuery, setPrecedentSearchQuery] = useState("")
    const [caseA, setCaseA] = useState<string>("")
    const [caseB, setCaseB] = useState<string>("")

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push("/sign-in")
            return
        }

        if (isSignedIn && isLoaded) {
            checkRole()
            fetchCases()
        }
    }, [isSignedIn, isLoaded, router])

    const checkRole = async () => {
        try {
            const response = await fetch("/api/user/role")
            if (response.ok) {
                const data = await response.json()
                setUserRole(data.role)
                // Only JUDGE, SUPER_ADMIN, and ADMIN should access this page
                if (data.role !== 'JUDGE' && data.role !== 'SUPER_ADMIN' && data.role !== 'ADMIN') {
                    toast.error("Access denied. This page is for Judges only.")
                    router.push("/")
                }
            }
        } catch (error) {
            console.error("Failed to check role:", error)
        }
    }

    const fetchCases = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/dashboard/judge/stats")
            if (!response.ok) {
                throw new Error("Failed to fetch dashboard data")
            }
            const data = await response.json()
            
            // Store stats
            setStats(data)
            
            // Update state with fetched data
            if (data.cases) {
                setCases(data.cases.map((c: any) => ({
                    ...c,
                    date: new Date(c.date)
                })))
            }
            if (data.precedents) {
                setPrecedents(data.precedents)
            }
        } catch (error) {
            console.error("Failed to fetch cases", error)
            toast.error("Failed to load dashboard data")
            // Fallback to empty arrays on error
            setCases([])
            setPrecedents([])
        } finally {
            setLoading(false)
        }
    }

    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
                <div className="mx-auto max-w-7xl space-y-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-fade-in-up">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                                <span className="gradient-text-glow">Judge Dashboard</span>
                            </h1>
                            <p className="mt-4 text-lg text-white/70">Manage case files, search precedents, and issue orders</p>
                        </div>
                        <Button onClick={fetchCases} variant="outline" size="sm">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                                <Gavel className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.activeCases || cases.filter(c => c.status === 'Active').length}</div>
                                <p className="text-xs text-muted-foreground">Currently reviewing</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalPages || cases.reduce((sum, c) => sum + (c.pages || 0), 0)}</div>
                                <p className="text-xs text-muted-foreground">Across all cases</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Precedents Found</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.precedentsFound || precedents.length}</div>
                                <p className="text-xs text-muted-foreground">Relevant cases</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
                                <p className="text-xs text-muted-foreground">Awaiting review</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="cases">
                                <FileText className="mr-2 h-4 w-4" />
                                Case Files
                            </TabsTrigger>
                            <TabsTrigger value="precedents">
                                <Search className="mr-2 h-4 w-4" />
                                Precedents
                            </TabsTrigger>
                            <TabsTrigger value="comparison">
                                <GitCompare className="mr-2 h-4 w-4" />
                                Case Comparison
                            </TabsTrigger>
                            <TabsTrigger value="chronology">
                                <Calendar className="mr-2 h-4 w-4" />
                                Chronology
                            </TabsTrigger>
                            <TabsTrigger value="orders">
                                <Gavel className="mr-2 h-4 w-4" />
                                Order Templates
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="cases" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Case Files (300-800 pages per matter)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <Input 
                                                placeholder="Search cases..." 
                                                className="flex-1" 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            <Link href="/workspace">
                                                <Button variant="outline">
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    All Cases
                                                </Button>
                                            </Link>
                                        </div>
                                        {cases.length === 0 ? (
                                            <div className="text-center py-12">
                                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground mb-4">No cases found</p>
                                                <Link href="/workspace">
                                                    <Button>
                                                        <ArrowRight className="h-4 w-4 mr-2" />
                                                        Go to Workspace
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {cases
                                                    .filter((caseItem) => 
                                                        searchQuery === "" || 
                                                        caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        caseItem.jurisdiction?.toLowerCase().includes(searchQuery.toLowerCase())
                                                    )
                                                    .map((caseItem) => (
                                                        <div 
                                                            key={caseItem.id} 
                                                            className="p-4 rounded-lg border border-muted hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <h3 className="font-medium">{caseItem.title}</h3>
                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                        {caseItem.jurisdiction || 'N/A'} • {caseItem.pages || 0} pages
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant={caseItem.status === 'Active' ? 'default' : 'outline'}>
                                                                        {caseItem.status}
                                                                    </Badge>
                                                                    <Link href={`/workspace/cases/${caseItem.id}`}>
                                                                        <Button variant="ghost" size="sm">
                                                                            <Eye className="h-4 w-4 mr-1" />
                                                                            View
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="precedents" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Precedent Search</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input 
                                                placeholder="Search for similar cases, precedents..." 
                                                value={precedentSearchQuery}
                                                onChange={(e) => setPrecedentSearchQuery(e.target.value)}
                                            />
                                            <Link href="/">
                                                <Button>
                                                    <Search className="h-4 w-4 mr-2" />
                                                    Search
                                                </Button>
                                            </Link>
                                        </div>
                                        {precedents.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground mb-4">No precedents found</p>
                                                <Link href="/">
                                                    <Button variant="outline">
                                                        <Search className="h-4 w-4 mr-2" />
                                                        Search Legal Database
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {precedents.map((precedent) => (
                                                    <div key={precedent.id} className="p-4 rounded-lg border border-muted hover:bg-muted/50">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="font-medium">{precedent.title}</h3>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {precedent.court || 'N/A'} • {precedent.year || 'N/A'}
                                                                </p>
                                                            </div>
                                                            <Badge variant="outline">{precedent.relevance || 0}% match</Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="comparison" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Case Comparison</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Compare similar cases side-by-side to identify patterns and differences
                                        </p>
                                        {cases.length < 2 ? (
                                            <div className="text-center py-12">
                                                <GitCompare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground mb-4">Need at least 2 cases to compare</p>
                                                <Link href="/workspace">
                                                    <Button variant="outline">
                                                        <ArrowRight className="h-4 w-4 mr-2" />
                                                        View All Cases
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Case A</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <Select value={caseA} onValueChange={setCaseA}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select case..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {cases.map((caseItem) => (
                                                                        <SelectItem key={caseItem.id} value={caseItem.id}>
                                                                            {caseItem.title}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Case B</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <Select value={caseB} onValueChange={setCaseB}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select case..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {cases
                                                                        .filter((c) => c.id !== caseA)
                                                                        .map((caseItem) => (
                                                                            <SelectItem key={caseItem.id} value={caseItem.id}>
                                                                                {caseItem.title}
                                                                            </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                                <Button 
                                                    className="w-full" 
                                                    disabled={!caseA || !caseB}
                                                    onClick={() => {
                                                        if (caseA && caseB) {
                                                            toast.info("Case comparison feature coming soon")
                                                        }
                                                    }}
                                                >
                                                    <GitCompare className="h-4 w-4 mr-2" />
                                                    Compare Cases
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="chronology" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Case Chronology</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            View case timeline and events in chronological order
                                        </p>
                                        {selectedCase ? (
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-4 p-4 rounded-lg border border-muted">
                                                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">Case Filed</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {selectedCase.date ? new Date(selectedCase.date).toLocaleDateString() : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground mb-4">Select a case to view chronology</p>
                                                <Link href="/workspace">
                                                    <Button variant="outline">
                                                        <ArrowRight className="h-4 w-4 mr-2" />
                                                        View Cases
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="orders" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Templates</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Quick access to order templates for common scenarios
                                        </p>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Link href="/draftgen">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <Gavel className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Interim Order</span>
                                                    <span className="text-xs text-muted-foreground">Temporary relief</span>
                                                </Button>
                                            </Link>
                                            <Link href="/draftgen">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <CheckCircle2 className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Bail Order</span>
                                                    <span className="text-xs text-muted-foreground">Bail application</span>
                                                </Button>
                                            </Link>
                                            <Link href="/draftgen">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <AlertTriangle className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Stay Order</span>
                                                    <span className="text-xs text-muted-foreground">Stay proceedings</span>
                                                </Button>
                                            </Link>
                                            <Link href="/draftgen">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <FileText className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Final Judgment</span>
                                                    <span className="text-xs text-muted-foreground">Case resolution</span>
                                                </Button>
                                            </Link>
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
