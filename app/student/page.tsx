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
    BookOpen, FileText, GraduationCap, Brain, Calendar, Gavel,
    Search, Languages, CheckCircle2, Clock, TrendingUp, Award,
    Eye, ArrowRight, ExternalLink, RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function StudentDashboard() {
    const { isSignedIn, isLoaded } = useUser()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("bare-acts")
    const [bareActs, setBareActs] = useState<any[]>([])
    const [caseSummaries, setCaseSummaries] = useState<any[]>([])
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
                // STUDENT, SUPER_ADMIN, and ADMIN can access
                const allowedRoles = ['STUDENT', 'SUPER_ADMIN', 'ADMIN']
                if (!allowedRoles.includes(data.role)) {
                    toast.error("Access denied. This page is for Students only.")
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
            const response = await fetch("/api/dashboard/student/stats")
            if (!response.ok) {
                throw new Error("Failed to fetch dashboard data")
            }
            const data = await response.json()
            
            // Store stats
            setStats(data)
            
            // Update state with fetched data
            if (data.bareActs) {
                setBareActs(data.bareActs)
            }
            if (data.caseSummaries) {
                setCaseSummaries(data.caseSummaries)
            }
        } catch (error) {
            console.error("Failed to fetch data", error)
            toast.error("Failed to load dashboard data")
            // Fallback to empty arrays on error
            setBareActs([])
            setCaseSummaries([])
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
                                <span className="gradient-text-glow">Student Dashboard</span>
                            </h1>
                            <p className="mt-4 text-lg text-white/70">Learn law with AI-powered summaries, case briefs, and practice tools</p>
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
                                <CardTitle className="text-sm font-medium">Bare Acts Studied</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.bareActsStudied || bareActs.filter(a => a.status !== 'Not Started').length}</div>
                                <p className="text-xs text-muted-foreground">Out of {stats?.totalBareActs || bareActs.length} total</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Case Summaries</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.caseSummariesCount || caseSummaries.length}</div>
                                <p className="text-xs text-muted-foreground">Reviewed</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Moot Court Sessions</CardTitle>
                                <Gavel className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.mootCourtSessions || 0}</div>
                                <p className="text-xs text-muted-foreground">Completed</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Quiz Score</CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.quizScore || 0}%</div>
                                <p className="text-xs text-muted-foreground">Average</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="bare-acts">
                                <BookOpen className="mr-2 h-4 w-4" />
                                Bare Acts
                            </TabsTrigger>
                            <TabsTrigger value="cases">
                                <FileText className="mr-2 h-4 w-4" />
                                Case Summaries
                            </TabsTrigger>
                            <TabsTrigger value="moot-court">
                                <Gavel className="mr-2 h-4 w-4" />
                                Moot Court
                            </TabsTrigger>
                            <TabsTrigger value="citations">
                                <FileText className="mr-2 h-4 w-4" />
                                Citation Format
                            </TabsTrigger>
                            <TabsTrigger value="research">
                                <Search className="mr-2 h-4 w-4" />
                                Research Structure
                            </TabsTrigger>
                            <TabsTrigger value="exams">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Exam Prep
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="bare-acts" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bare Acts - Simplified Summaries</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <Input placeholder="Search Bare Acts..." />
                                        {bareActs.length === 0 ? (
                                            <div className="text-center py-12">
                                                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground mb-4">No bare acts available</p>
                                                <Link href="/">
                                                    <Button variant="outline">
                                                        <Search className="h-4 w-4 mr-2" />
                                                        Search Legal Database
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {bareActs.map((act) => (
                                                    <div key={act.id} className="p-4 rounded-lg border border-muted hover:bg-muted/50">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div>
                                                                <h3 className="font-medium">{act.title}</h3>
                                                                <p className="text-sm text-muted-foreground mt-1">{act.sections || 0} sections</p>
                                                            </div>
                                                            <Badge variant={act.status === 'Studied' ? 'default' : act.status === 'In Progress' ? 'outline' : 'secondary'}>
                                                                {act.status || 'Not Started'}
                                                            </Badge>
                                                        </div>
                                                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                                                            <div 
                                                                className="bg-primary h-2 rounded-full" 
                                                                style={{ width: `${act.progress || 0}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-2">{act.progress || 0}% complete</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="cases" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Case Law Summaries</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <Input placeholder="Search case summaries..." />
                                        {caseSummaries.length === 0 ? (
                                            <div className="text-center py-12">
                                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground mb-4">No case summaries available</p>
                                                <Link href="/">
                                                    <Button variant="outline">
                                                        <Search className="h-4 w-4 mr-2" />
                                                        Search Case Laws
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {caseSummaries.map((caseItem) => (
                                                    <div key={caseItem.id} className="p-4 rounded-lg border border-muted hover:bg-muted/50">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="font-medium">{caseItem.title}</h3>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {caseItem.court || 'N/A'} • {caseItem.year || 'N/A'} • {caseItem.topic || 'Legal'}
                                                                </p>
                                                            </div>
                                                            <Button variant="ghost" size="sm" onClick={() => toast.info("Case summary viewing coming soon")}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="moot-court" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Moot Court Preparation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Practice your arguments with AI judge, opposing counsel, and witnesses
                                        </p>
                                        <Button className="w-full" onClick={() => router.push('/moot-court')}>
                                            <Gavel className="h-4 w-4 mr-2" />
                                            Start Moot Court Session
                                        </Button>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <h4 className="font-medium mb-2">Recent Sessions</h4>
                                            <p className="text-sm text-muted-foreground">12 sessions completed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="citations" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Citation Format Helper</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Learn proper citation formats for legal documents
                                        </p>
                                        <div className="space-y-2">
                                            <div className="p-4 rounded-lg border border-muted">
                                                <h4 className="font-medium mb-2">Case Citation Format</h4>
                                                <p className="text-sm font-mono text-muted-foreground">
                                                    Name of Case, (Year) Volume Reporter Page (Court)
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-2">Example: Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225 (SC)</p>
                                            </div>
                                            <div className="p-4 rounded-lg border border-muted">
                                                <h4 className="font-medium mb-2">Statute Citation Format</h4>
                                                <p className="text-sm font-mono text-muted-foreground">
                                                    Name of Act, Year, Section Number
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-2">Example: Indian Penal Code, 1860, s. 302</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="research" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Research Structure Guide</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-3 p-3 rounded-lg border border-muted">
                                                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium">1. Identify Legal Issue</h4>
                                                    <p className="text-sm text-muted-foreground">Clearly define the legal question</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 rounded-lg border border-muted">
                                                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium">2. Research Relevant Laws</h4>
                                                    <p className="text-sm text-muted-foreground">Find applicable statutes and sections</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 rounded-lg border border-muted">
                                                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium">3. Find Precedents</h4>
                                                    <p className="text-sm text-muted-foreground">Search for similar case laws</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 rounded-lg border border-muted">
                                                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium">4. Analyze & Synthesize</h4>
                                                    <p className="text-sm text-muted-foreground">Combine findings into coherent argument</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="exams" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Exam Preparation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Button 
                                                variant="outline" 
                                                className="h-auto p-4 flex-col items-start"
                                                onClick={() => toast.info("Previous Year Questions feature coming soon")}
                                            >
                                                <FileText className="h-5 w-5 mb-2" />
                                                <span className="font-medium">Previous Year Questions</span>
                                                <span className="text-xs text-muted-foreground">PYQs with AI explanations</span>
                                            </Button>
                                            <Link href="/moot-court">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <Brain className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Mock Viva</span>
                                                    <span className="text-xs text-muted-foreground">Practice with AI professor</span>
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="outline" 
                                                className="h-auto p-4 flex-col items-start"
                                                onClick={() => toast.info("Daily Quiz feature coming soon")}
                                            >
                                                <Calendar className="h-5 w-5 mb-2" />
                                                <span className="font-medium">Daily Quiz</span>
                                                <span className="text-xs text-muted-foreground">Test your knowledge</span>
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="h-auto p-4 flex-col items-start"
                                                onClick={() => toast.info("Progress Tracking feature coming soon")}
                                            >
                                                <TrendingUp className="h-5 w-5 mb-2" />
                                                <span className="font-medium">Progress Tracking</span>
                                                <span className="text-xs text-muted-foreground">Monitor your learning</span>
                                            </Button>
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

