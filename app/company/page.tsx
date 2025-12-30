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
    Building2, FileText, Shield, AlertTriangle, CheckCircle2, Clock,
    Search, Globe, DollarSign, TrendingUp, Users, Eye, Download,
    ExternalLink, ArrowRight, Plus, Upload, RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function CompanyDashboard() {
    const { isSignedIn, isLoaded } = useUser()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("contracts")
    const [contracts, setContracts] = useState<any[]>([])
    const [compliance, setCompliance] = useState<any[]>([])
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
                // IN_HOUSE_COUNSEL, COMPLIANCE_OFFICER, SUPER_ADMIN, and ADMIN can access
                const allowedRoles = ['IN_HOUSE_COUNSEL', 'COMPLIANCE_OFFICER', 'SUPER_ADMIN', 'ADMIN']
                if (!allowedRoles.includes(data.role)) {
                    toast.error("Access denied. This page is for Company Legal teams only.")
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
            const response = await fetch("/api/dashboard/company/stats")
            if (!response.ok) {
                throw new Error("Failed to fetch dashboard data")
            }
            const data = await response.json()
            
            // Store stats
            setStats(data)
            
            // Update state with fetched data
            if (data.contracts) {
                setContracts(data.contracts.map((c: any) => ({
                    ...c,
                    date: new Date(c.date)
                })))
            }
            if (data.compliance) {
                setCompliance(data.compliance)
            }
        } catch (error) {
            console.error("Failed to fetch data", error)
            toast.error("Failed to load dashboard data")
            // Fallback to empty arrays on error
            setContracts([])
            setCompliance([])
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
                                <span className="gradient-text-glow">Company Legal Dashboard</span>
                            </h1>
                            <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-white/70">Manage contracts, track compliance, and monitor legal risks</p>
                        </div>
                        <Button onClick={fetchData} variant="outline" size="sm" className="flex-shrink-0 text-xs sm:text-sm">
                            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                    </div>

                    {/* Key Metrics - Responsive */}
                    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.activeContracts || contracts.length}</div>
                                <p className="text-xs text-muted-foreground">Under review</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.highRiskItems || contracts.filter(c => c.risk === 'High').length}</div>
                                <p className="text-xs text-muted-foreground">Require attention</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.compliantRegulations || compliance.filter(c => c.status === 'Compliant').length}/{stats?.totalRegulations || compliance.length}</div>
                                <p className="text-xs text-muted-foreground">Compliant regulations</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Legal Costs</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{stats?.legalCosts ? (stats.legalCosts / 1000).toFixed(1) + 'L' : '2.5L'}</div>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="contracts">
                                <FileText className="mr-2 h-4 w-4" />
                                Contracts
                            </TabsTrigger>
                            <TabsTrigger value="compliance">
                                <Shield className="mr-2 h-4 w-4" />
                                Compliance
                            </TabsTrigger>
                            <TabsTrigger value="risks">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Risk Analysis
                            </TabsTrigger>
                            <TabsTrigger value="regulatory">
                                <Globe className="mr-2 h-4 w-4" />
                                Regulatory Updates
                            </TabsTrigger>
                            <TabsTrigger value="litigation">
                                <Building2 className="mr-2 h-4 w-4" />
                                Litigation
                            </TabsTrigger>
                            <TabsTrigger value="policies">
                                <FileText className="mr-2 h-4 w-4" />
                                Policies
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="contracts" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Contract Review & Management</CardTitle>
                                        <Link href="/analyze">
                                            <Button>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload Contract
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <Input placeholder="Search contracts..." />
                                        {contracts.length === 0 ? (
                                            <div className="text-center py-12">
                                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground mb-4">No contracts found</p>
                                                <Link href="/analyze">
                                                    <Button>
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Upload Contract
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {contracts.map((contract) => (
                                                    <div key={contract.id} className="p-4 rounded-lg border border-muted hover:bg-muted/50">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="font-medium">{contract.title}</h3>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {contract.vendor || 'N/A'} • {contract.date ? new Date(contract.date).toLocaleDateString() : 'N/A'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={
                                                                    contract.risk === 'High' ? 'destructive' : 
                                                                    contract.risk === 'Medium' ? 'outline' : 'default'
                                                                }>
                                                                    {contract.risk || 'Medium'} Risk
                                                                </Badge>
                                                                <Badge variant={contract.status === 'Approved' ? 'default' : 'outline'}>
                                                                    {contract.status || 'Pending Review'}
                                                                </Badge>
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

                        <TabsContent value="compliance" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compliance Tracking</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {compliance.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground mb-4">No compliance data available</p>
                                                <p className="text-sm text-muted-foreground">Compliance tracking coming soon</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    {compliance.map((item) => (
                                                        <div key={item.id} className="p-4 rounded-lg border border-muted">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h3 className="font-medium">{item.regulation}</h3>
                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                        Last checked: {item.lastCheck || 'N/A'}
                                                                    </p>
                                                                </div>
                                                                <Badge variant={item.status === 'Compliant' ? 'default' : 'destructive'}>
                                                                    {item.status || 'Unknown'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button className="w-full" onClick={() => toast.info("Compliance check feature coming soon")}>
                                                    <Shield className="h-4 w-4 mr-2" />
                                                    Run Compliance Check
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="risks" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contract Risk Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">High Risk Contracts</span>
                                                <Badge variant="destructive">{contracts.filter(c => c.risk === 'High').length}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">Medium Risk Contracts</span>
                                                <Badge variant="outline">{contracts.filter(c => c.risk === 'Medium').length}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Low Risk Contracts</span>
                                                <Badge>{contracts.filter(c => c.risk === 'Low').length}</Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {contracts.filter(c => c.risk === 'High').map((contract) => (
                                                <div key={contract.id} className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="font-medium">{contract.title}</h3>
                                                            <p className="text-sm text-muted-foreground mt-1">{contract.vendor}</p>
                                                        </div>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="regulatory" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Regulatory Updates</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Stay updated with latest regulatory changes affecting your business
                                        </p>
                                        <div className="space-y-2">
                                            <div className="p-4 rounded-lg border border-muted">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-medium">DPDP Act 2023 Updates</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">New data privacy requirements</p>
                                                    </div>
                                                    <Badge variant="outline">New</Badge>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg border border-muted">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-medium">Labor Law Amendments</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">Updated compliance requirements</p>
                                                    </div>
                                                    <Badge variant="outline">Updated</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="litigation" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Litigation Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="p-4 rounded-lg bg-muted/50">
                                                <div className="text-2xl font-bold">5</div>
                                                <div className="text-sm text-muted-foreground">Active Cases</div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-muted/50">
                                                <div className="text-2xl font-bold">2</div>
                                                <div className="text-sm text-muted-foreground">Pending</div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-muted/50">
                                                <div className="text-2xl font-bold">₹15L</div>
                                                <div className="text-sm text-muted-foreground">Legal Costs</div>
                                            </div>
                                        </div>
                                        <Button className="w-full">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View All Cases
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="policies" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Policy Drafting</CardTitle>
                                        <Link href="/draftgen">
                                            <Button>
                                                <FileText className="h-4 w-4 mr-2" />
                                                New Policy
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Link href="/draftgen">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <Shield className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Data Privacy Policy</span>
                                                    <span className="text-xs text-muted-foreground">DPDP compliant</span>
                                                </Button>
                                            </Link>
                                            <Link href="/draftgen">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <Users className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">HR Policy</span>
                                                    <span className="text-xs text-muted-foreground">Employee guidelines</span>
                                                </Button>
                                            </Link>
                                            <Link href="/draftgen">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <FileText className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">IT Security Policy</span>
                                                    <span className="text-xs text-muted-foreground">Cybersecurity</span>
                                                </Button>
                                            </Link>
                                            <Link href="/draftgen">
                                                <Button variant="outline" className="h-auto p-4 flex-col items-start w-full">
                                                    <Globe className="h-5 w-5 mb-2" />
                                                    <span className="font-medium">Compliance Policy</span>
                                                    <span className="text-xs text-muted-foreground">Regulatory compliance</span>
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

