"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, Plus, Search, Filter, LayoutGrid, List } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { toast } from "sonner"
import { CalendarView } from "@/components/workspace/calendar-view"
import { ECourtImporter } from "@/components/workspace/ecourt-importer"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface Case {
  id: string
  title: string
  description: string
  jurisdiction: string
  status: string
  updated_at: string
}

export default function WorkspacePage() {
  const { isSignedIn } = useUser()
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState("cases")

  useEffect(() => {
    if (isSignedIn) {
      fetchCases()
    }
  }, [isSignedIn])

  const fetchCases = async () => {
    try {
      const response = await fetch("/api/workspace/cases")
      if (response.ok) {
        const data = await response.json()
        setCases(data)
      }
    } catch (error) {
      console.error("Failed to fetch cases", error)
    } finally {
      setIsLoading(false)
    }
  }

  const [createCaseData, setCreateCaseData] = useState({ title: "", description: "", jurisdiction: "", status: "OPEN" })
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateCase = async () => {
    if (!createCaseData.title.trim()) {
      toast.error("Case title is required")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/workspace/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createCaseData),
      })

      if (response.ok) {
        toast.success("Case created successfully")
        setShowCreateModal(false)
        setCreateCaseData({ title: "", description: "", jurisdiction: "", status: "OPEN" })
        fetchCases()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create case")
      }
    } catch (error) {
      toast.error("Error creating case")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-300">
      <Navigation />

      <main className="flex-1 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 animate-fade-in-up">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Advocate Workspace
              </h1>
              <p className="mt-1.5 sm:mt-2 text-sm sm:text-base md:text-lg text-muted-foreground">
                Manage your legal practice, deadlines, and case files efficiently.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-shrink-0">
              <Button variant="outline" size="sm" className="hidden md:flex text-xs sm:text-sm">
                <Search className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden lg:inline">Search Cases</span>
              </Button>
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button size="sm" className="shadow-lg shadow-primary/20 text-xs sm:text-sm flex-1 sm:flex-initial">
                    <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">New Case</span><span className="sm:hidden">New</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Case</DialogTitle>
                    <DialogDescription>Add a new case to your workspace</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Case Title *</Label>
                      <Input
                        id="title"
                        value={createCaseData.title}
                        onChange={(e) => setCreateCaseData({ ...createCaseData, title: e.target.value })}
                        placeholder="e.g., Sharma v. State of Delhi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={createCaseData.description}
                        onChange={(e) => setCreateCaseData({ ...createCaseData, description: e.target.value })}
                        placeholder="Case description and details..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="jurisdiction">Jurisdiction</Label>
                        <Input
                          id="jurisdiction"
                          value={createCaseData.jurisdiction}
                          onChange={(e) => setCreateCaseData({ ...createCaseData, jurisdiction: e.target.value })}
                          placeholder="e.g., Delhi High Court"
                        />
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={createCaseData.status} onValueChange={(value) => setCreateCaseData({ ...createCaseData, status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                      <Button onClick={handleCreateCase} disabled={isCreating || !createCaseData.title.trim()}>
                        {isCreating ? "Creating..." : "Create Case"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("import")} className="text-xs sm:text-sm">
                <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Import Case</span><span className="sm:hidden">Import</span>
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-full sm:max-w-[600px] mb-4 sm:mb-8 h-auto">
              <TabsTrigger value="cases" className="text-xs sm:text-sm px-2 sm:px-4 py-2">My Cases</TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Smart Calendar</TabsTrigger>
              <TabsTrigger value="import" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Import Case</TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="space-y-4 sm:space-y-6 animate-fade-in-up md:min-h-[500px]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Filter</span>
                  </Button>
                  <span className="text-xs sm:text-sm text-muted-foreground">{cases.length} Active Cases</span>
                </div>
                <div className="flex items-center border rounded-lg p-0.5 bg-muted/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 sm:h-8 px-2 text-xs sm:text-sm ${viewMode === 'grid' ? 'bg-background shadow-sm' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 sm:h-8 px-2 text-xs sm:text-sm ${viewMode === 'list' ? 'bg-background shadow-sm' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 sm:h-56 rounded-xl border border-border bg-muted/20 animate-pulse" />
                  ))}
                </div>
              ) : cases.length > 0 ? (
                <div className={viewMode === 'grid' ? "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}>
                  {cases.map((caseItem, index) => (
                    <Link href={`/workspace/cases/${caseItem.id}`} key={caseItem.id} className="block group">
                      <div className={`
                        relative bg-card hover:bg-accent/50 border border-border hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden
                        ${viewMode === 'grid' ? 'p-6 h-full flex flex-col hover:-translate-y-1 shadow-sm hover:shadow-md' : 'p-4 flex items-center gap-6 hover:translate-x-1'}
                      `}>
                        {/* Card Content based on View Mode */}
                        <div className="flex items-start justify-between mb-4 w-full">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary ${viewMode === 'list' ? 'shrink-0' : ''}`}>
                              <Briefcase className="h-5 w-5" />
                            </div>
                            {viewMode === 'list' && (
                              <div>
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{caseItem.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">{caseItem.description}</p>
                              </div>
                            )}
                          </div>
                          <Badge variant={caseItem.status === 'OPEN' ? 'default' : 'secondary'} className={caseItem.status === 'OPEN' ? 'bg-green-500/15 text-green-600 hover:bg-green-500/25 border-green-500/20' : ''}>
                            {caseItem.status}
                          </Badge>
                        </div>

                        {viewMode === 'grid' && (
                          <>
                            <h3 className="text-lg font-semibold mb-2 line-clamp-1 text-foreground group-hover:text-primary transition-colors">{caseItem.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed flex-1">
                              {caseItem.description || "No description provided"}
                            </p>
                          </>
                        )}

                        <div className={`flex items-center text-xs text-muted-foreground ${viewMode === 'grid' ? 'pt-4 border-t border-border justify-between mt-auto' : 'ml-auto gap-6'}`}>
                          <span className="font-medium bg-muted px-2 py-1 rounded">{caseItem.jurisdiction}</span>
                          <span>Updated {new Date(caseItem.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/10">
                  <div className="bg-background h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No cases found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">Get started by importing a case from e-Courts or creating one manually.</p>
                  <Button onClick={() => setActiveTab('import')} className="shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    New Case
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar" className="animate-fade-in-up">
              <CalendarView />
            </TabsContent>

            <TabsContent value="import" className="animate-fade-in-up">
              <ECourtImporter />
            </TabsContent>
          </Tabs>
        </div>
      </main>

    </div>
  )
}
