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
import { 
    Briefcase, FileText, Search, Clock, AlertCircle, RefreshCw, 
    Upload, FileCheck, Edit, Calendar, DollarSign, Users,
    Eye, FileSearch, Shield, Globe, MessageSquare, CheckCircle2, XCircle,
    ExternalLink, ArrowRight, Plus
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function LawyerDashboard() {
    const { isSignedIn, isLoaded } = useUser()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("drafting")
    const [drafts, setDrafts] = useState<any[]>([])
    const [cases, setCases] = useState<any[]>([])
    const [deadlines, setDeadlines] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push("/sign-in")
            return
        }

        if (isSignedIn && isLoaded) {
            checkRole()
            fetchData()
        }
    }, [isSignedIn, isLoaded, router])

    const checkRole = async () => {
        try {
            const response = await fetch("/api/user/role")
            if (response.ok) {
                const data = await response.json()
                // LAWYER, ASSOCIATE, SUPER_ADMIN, and ADMIN can access
                const allowedRoles = ['LAWYER', 'ASSOCIATE', 'SUPER_ADMIN', 'ADMIN']
                if (!allowedRoles.includes(data.role)) {
                    toast.error("Access denied. This page is for Lawyers only.")
                    router.push("/")
                }
            }
        } catch (error) {
            console.error("Failed to check role:", error)
        }
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/dashboard/lawyer/stats")
            if (!response.ok) {
                throw new Error("Failed to fetch dashboard data")
            }
            const data = await response.json()
            
            // Store stats
            setStats(data)
            
            // Update state with fetched data
            if (data.drafts) {
                setDrafts(data.drafts.map((d: any) => ({
                    ...d,
                    date: new Date(d.date)
                })))
            }
            if (data.cases) {
                setCases(data.cases)
            }
            if (data.deadlines) {
                setDeadlines(data.deadlines)
            }
        } catch (error) {
            console.error("Failed to fetch data", error)
            toast.error("Failed to load dashboard data")
            // Fallback to empty arrays on error
            setDrafts([])
            setCases([])
            setDeadlines([])
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
                                <span className="gradient-text-glow">Lawyer Dashboard</span>
                            </h1>
                            <p className="mt-4 text-lg text-white/70">Draft documents, research case law, manage clients, and track deadlines</p>
                        </div>
                        <Button onClick={fetchData} variant="outline" size="sm">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.activeCases || cases.filter(c => c.status === 'Active').length}</div>
                                <p className="text-xs text-muted-foreground">Currently handling</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Drafts in Progress</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.draftsInProgress || drafts.filter(d => d.status === 'Draft').length}</div>
                                <p className="text-xs text-muted-foreground">Pending completion</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.upcomingDeadlines || deadlines.length}</div>
                                <p className="text-xs text-muted-foreground">This week</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.billableHours || 0}</div>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="drafting">
                                <Edit className="mr-2 h-4 w-4" />
                                Drafting
                            </TabsTrigger>
                            <TabsTrigger value="research">
                                <Search className="mr-2 h-4 w-4" />
                                Case Law Research
                            </TabsTrigger>
                            <TabsTrigger value="documents">
                                <FileText className="mr-2 h-4 w-4" />
                                Documents
                            </TabsTrigger>
                            <TabsTrigger value="clients">
                                <Users className="mr-2 h-4 w-4" />
                                Clients
                            </TabsTrigger>
                            <TabsTrigger value="deadlines">
                                <Calendar className="mr-2 h-4 w-4" />
                                Deadlines
                            </TabsTrigger>
                            <TabsTrigger value="billing">
                                <DollarSign className="mr-2 h-4 w-4" />
                                Billing
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="drafting" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Draft Generation</CardTitle>
                                        <Link href="/draftgen">
                                            <Button>
                                                <Edit className="h-4 w-4 mr-2" />
                                                New Draft
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Link href="/draftgen">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <FileText className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Petition</span>
                                                    <span className="text-xs text-muted-foreground">Court petitions</span>
                                                </Button>
                                            </Link>
                                            <Link href="/draftgen">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <FileCheck className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Contract</span>
                                                    <span className="text-xs text-muted-foreground">Legal agreements</span>
                                                </Button>
                                            </Link>
                                            <Link href="/draftgen">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <Shield className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Notice</span>
                                                    <span className="text-xs text-muted-foreground">Legal notices</span>
                                                </Button>
                                            </Link>
                                            <Link href="/draftgen">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <Briefcase className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Affidavit</span>
                                                    <span className="text-xs text-muted-foreground">Sworn statements</span>
                                                </Button>
                                            </Link>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Recent Drafts</h4>
                                            {drafts.length === 0 ? (
                                                <div className="text-center py-8 border border-muted rounded-lg">
                                                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                                    <p className="text-sm text-muted-foreground">No drafts yet</p>
                                                </div>
                                            ) : (
                                                drafts.map((draft) => (
                                                    <div key={draft.id} className="p-4 rounded-lg border border-muted hover:bg-muted/50">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="font-medium">{draft.title}</h3>
                                                                <p className="text-sm text-muted-foreground mt-1">{draft.type || 'Document'}</p>
                                                            </div>
                                                            <Badge variant={draft.status === 'Draft' ? 'outline' : 'default'}>
                                                                {draft.status || 'Draft'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="research" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Case Law Research</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input placeholder="Search case laws, precedents, judgments..." />
                                            <Link href="/">
                                                <Button>
                                                    <Search className="h-4 w-4 mr-2" />
                                                    Search
                                                </Button>
                                            </Link>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Link href="/search">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <Search className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Precedent Search</span>
                                                    <span className="text-xs text-muted-foreground">Find similar cases</span>
                                                </Button>
                                            </Link>
                                            <Link href="/search">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <FileSearch className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Section Search</span>
                                                    <span className="text-xs text-muted-foreground">Search by legal sections</span>
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="documents" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Document Management</CardTitle>
                                        <Link href="/analyze">
                                            <Button variant="outline">
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload & Analyze
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg border-2 border-dashed border-muted text-center">
                                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
                                            <p className="text-xs text-muted-foreground mt-1">Supports PDF, DOCX, scanned documents (OCR)</p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Recent Documents</h4>
                                            <div className="space-y-2">
                                                <Link href="/analyze">
                                                    <div className="p-3 rounded-lg border border-muted hover:bg-muted/50 flex items-center justify-between cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-sm font-medium">Upload documents to analyze</p>
                                                                <p className="text-xs text-muted-foreground">Click to upload and analyze documents</p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="sm">
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="clients" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Client Management</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <Input placeholder="Search clients..." />
                                        {cases.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground mb-4">No cases found</p>
                                                <Link href="/workspace">
                                                    <Button variant="outline">
                                                        <ArrowRight className="h-4 w-4 mr-2" />
                                                        Go to Workspace
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {cases.map((caseItem) => (
                                                    <Link key={caseItem.id} href={`/workspace/cases/${caseItem.id}`}>
                                                        <div className="p-4 rounded-lg border border-muted hover:bg-muted/50 cursor-pointer">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h3 className="font-medium">{caseItem.client || caseItem.title}</h3>
                                                                    <p className="text-sm text-muted-foreground mt-1">{caseItem.title}</p>
                                                                </div>
                                                                <Badge variant={caseItem.status === 'Active' ? 'default' : 'outline'}>
                                                                    {caseItem.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="deadlines" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Deadline Tracking</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {deadlines.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <p className="text-muted-foreground mb-4">No deadlines tracked</p>
                                            <p className="text-sm text-muted-foreground">Deadline tracking coming soon</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {deadlines.map((deadline) => (
                                                <div key={deadline.id} className="p-4 rounded-lg border border-muted">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="font-medium">{deadline.title}</h3>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {deadline.case || 'N/A'} • {deadline.date || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <Badge variant={deadline.priority === 'high' ? 'destructive' : 'outline'}>
                                                            {deadline.priority || 'medium'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="billing" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Billing & Time Tracking</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="p-4 rounded-lg bg-muted/50">
                                                <div className="text-2xl font-bold">142</div>
                                                <div className="text-sm text-muted-foreground">Billable Hours</div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-muted/50">
                                                <div className="text-2xl font-bold">₹2,84,000</div>
                                                <div className="text-sm text-muted-foreground">This Month</div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-muted/50">
                                                <div className="text-2xl font-bold">12</div>
                                                <div className="text-sm text-muted-foreground">Active Clients</div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground text-center">
                                            Billing and time tracking features coming soon
                                        </p>
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

