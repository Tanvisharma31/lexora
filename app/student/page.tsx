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
import { Textarea } from "@/components/ui/textarea"

// Citation Checker Component
function CitationChecker() {
    const [citation, setCitation] = useState("")
    const [result, setResult] = useState<any>(null)
    const [checking, setChecking] = useState(false)

    const handleCheck = async () => {
        if (!citation.trim()) {
            toast.error("Please enter a citation")
            return
        }

        setChecking(true)
        try {
            const response = await fetch("/api/student/citation-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ citation }),
            })

            if (!response.ok) throw new Error("Failed to check citation")
            const data = await response.json()
            setResult(data)
        } catch (error) {
            toast.error("Failed to check citation")
        } finally {
            setChecking(false)
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium mb-2 block">Enter Citation</label>
                <Textarea
                    value={citation}
                    onChange={(e) => setCitation(e.target.value)}
                    placeholder="e.g., Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225 (SC)"
                    rows={2}
                />
            </div>
            <Button onClick={handleCheck} disabled={checking || !citation.trim()}>
                {checking ? "Checking..." : "Check Citation"}
            </Button>
            
            {result && (
                <div className={`p-4 rounded-lg border ${result.is_valid ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant={result.is_valid ? "default" : "destructive"}>
                            {result.is_valid ? "Valid" : "Invalid"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{result.format_detected}</span>
                    </div>
                    {result.feedback.correct.length > 0 && (
                        <div className="mt-2">
                            <p className="text-sm font-medium text-green-600 mb-1">Correct:</p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                                {result.feedback.correct.map((item: string, i: number) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {result.feedback.errors.length > 0 && (
                        <div className="mt-2">
                            <p className="text-sm font-medium text-red-600 mb-1">Errors:</p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                                {result.feedback.errors.map((item: string, i: number) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {result.feedback.suggestions.length > 0 && (
                        <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Suggestions:</p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                                {result.feedback.suggestions.map((item: string, i: number) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {result.example_correct && (
                        <div className="mt-3 p-2 bg-muted rounded text-xs font-mono">
                            Example: {result.example_correct}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function StudentDashboard() {
    const { isSignedIn, isLoaded } = useUser()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("bare-acts")
    const [bareActs, setBareActs] = useState<any[]>([])
    const [caseSummaries, setCaseSummaries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        // Check for tab parameter in URL
        const params = new URLSearchParams(window.location.search)
        const tab = params.get('tab')
        if (tab && ['bare-acts', 'cases', 'moot-court', 'citations', 'research', 'exams', 'progress'].includes(tab)) {
            setActiveTab(tab)
        }
    }, [])

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
            // Fetch dashboard stats
            const statsResponse = await fetch("/api/dashboard/student/stats")
            if (statsResponse.ok) {
                const statsData = await statsResponse.json()
                setStats(statsData)
            }

            // Fetch bare acts
            const bareActsResponse = await fetch("/api/student/bare-acts")
            if (bareActsResponse.ok) {
                const bareActsData = await bareActsResponse.json()
                setBareActs(bareActsData.acts || [])
            }

            // Fetch case summaries
            const caseSummariesResponse = await fetch("/api/student/case-summaries")
            if (caseSummariesResponse.ok) {
                const caseSummariesData = await caseSummariesResponse.json()
                setCaseSummaries(caseSummariesData.summaries || [])
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

            <main className="flex-1 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 lg:py-16">
                <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8 md:space-y-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 animate-fade-in-up">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                                <span className="gradient-text-glow">Student Dashboard</span>
                            </h1>
                            <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-white/70">Learn law with AI-powered summaries, case briefs, and practice tools</p>
                        </div>
                        <Button onClick={fetchData} variant="outline" size="sm" className="flex-shrink-0 text-xs sm:text-sm">
                            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                    </div>

                    {/* Key Metrics - Responsive */}
                    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                                <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium truncate pr-1">Bare Acts Studied</CardTitle>
                                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            </CardHeader>
                            <CardContent className="pt-1 sm:pt-2">
                                <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats?.bareActsStudied || bareActs.filter(a => a.status !== 'Not Started').length}</div>
                                <p className="text-[9px] sm:text-xs text-muted-foreground">Out of {stats?.totalBareActs || bareActs.length} total</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                                <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium truncate pr-1">Case Summaries</CardTitle>
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            </CardHeader>
                            <CardContent className="pt-1 sm:pt-2">
                                <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats?.caseSummariesCount || caseSummaries.length}</div>
                                <p className="text-[9px] sm:text-xs text-muted-foreground">Reviewed</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                                <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium truncate pr-1">Moot Court Sessions</CardTitle>
                                <Gavel className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            </CardHeader>
                            <CardContent className="pt-1 sm:pt-2">
                                <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats?.mootCourtSessions || 0}</div>
                                <p className="text-[9px] sm:text-xs text-muted-foreground">Completed</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                                <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium truncate pr-1">Quiz Score</CardTitle>
                                <Award className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            </CardHeader>
                            <CardContent className="pt-1 sm:pt-2">
                                <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats?.quizScore || 0}%</div>
                                <p className="text-[9px] sm:text-xs text-muted-foreground">Average</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4">
                        <TabsList className="w-full overflow-x-auto scrollbar-hide flex-wrap h-auto">
                            <TabsTrigger value="bare-acts" className="text-xs sm:text-sm px-2 sm:px-4 py-2 flex-shrink-0">
                                <BookOpen className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Bare Acts</span>
                                <span className="sm:hidden">Acts</span>
                            </TabsTrigger>
                            <TabsTrigger value="cases" className="text-xs sm:text-sm px-2 sm:px-4 py-2 flex-shrink-0">
                                <FileText className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Case Summaries</span>
                                <span className="sm:hidden">Cases</span>
                            </TabsTrigger>
                            <TabsTrigger value="moot-court" className="text-xs sm:text-sm px-2 sm:px-4 py-2 flex-shrink-0">
                                <Gavel className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Moot Court</span>
                                <span className="sm:hidden">Court</span>
                            </TabsTrigger>
                            <TabsTrigger value="citations" className="text-xs sm:text-sm px-2 sm:px-4 py-2 flex-shrink-0">
                                <FileText className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Citation Format</span>
                                <span className="sm:hidden">Citation</span>
                            </TabsTrigger>
                            <TabsTrigger value="research" className="text-xs sm:text-sm px-2 sm:px-4 py-2 flex-shrink-0">
                                <Search className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Research Structure</span>
                                <span className="sm:hidden">Research</span>
                            </TabsTrigger>
                            <TabsTrigger value="exams" className="text-xs sm:text-sm px-2 sm:px-4 py-2 flex-shrink-0">
                                <GraduationCap className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Exam Prep</span>
                                <span className="sm:hidden">Exams</span>
                            </TabsTrigger>
                            <TabsTrigger value="progress" className="text-xs sm:text-sm px-2 sm:px-4 py-2 flex-shrink-0">
                                <TrendingUp className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Progress
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
                                    <CardTitle>Citation Format Checker</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Check if your citation format is correct and get feedback
                                        </p>
                                        <CitationChecker />
                                        <div className="mt-6 space-y-2">
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
                                            <Link href="/student/quiz-practice">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <Calendar className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Daily Quiz</span>
                                                    <span className="text-xs text-muted-foreground">Test your knowledge</span>
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="outline" 
                                                className="h-auto p-4 flex-col items-start"
                                                onClick={() => setActiveTab("progress")}
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

                        <TabsContent value="progress" className="space-y-4">
                            <ProgressTracker />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}

// Progress Tracker Component
function ProgressTracker() {
    const [progress, setProgress] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProgress()
    }, [])

    const fetchProgress = async () => {
        try {
            const response = await fetch("/api/student/progress")
            if (response.ok) {
                const data = await response.json()
                setProgress(data)
            }
        } catch (error) {
            console.error("Failed to fetch progress", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </CardContent>
            </Card>
        )
    }

    if (!progress) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No progress data available</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="p-4 rounded-lg border border-muted">
                            <div className="text-2xl font-bold">{progress.bare_acts_studied || 0}</div>
                            <div className="text-sm text-muted-foreground">Bare Acts Studied</div>
                        </div>
                        <div className="p-4 rounded-lg border border-muted">
                            <div className="text-2xl font-bold">{progress.case_summaries_read || 0}</div>
                            <div className="text-sm text-muted-foreground">Case Summaries Read</div>
                        </div>
                        <div className="p-4 rounded-lg border border-muted">
                            <div className="text-2xl font-bold">{progress.quizzes_taken || 0}</div>
                            <div className="text-sm text-muted-foreground">Quizzes Taken</div>
                        </div>
                        <div className="p-4 rounded-lg border border-muted">
                            <div className="text-2xl font-bold">{progress.average_quiz_score?.toFixed(1) || 0}%</div>
                            <div className="text-sm text-muted-foreground">Average Quiz Score</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                        {(progress.achievements || []).map((achievement: any) => (
                            <div
                                key={achievement.id}
                                className={`p-4 rounded-lg border ${achievement.earned ? 'border-green-500 bg-green-500/10' : 'border-muted bg-muted/50'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Award className={`h-5 w-5 ${achievement.earned ? 'text-green-500' : 'text-muted-foreground'}`} />
                                    <div>
                                        <div className="font-medium">{achievement.title}</div>
                                        <div className="text-sm text-muted-foreground">{achievement.description}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {progress.recommendations && progress.recommendations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {progress.recommendations.map((rec: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                    <span className="text-sm">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

