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

  // Simplified Create Modal for brevity in this response, ideally would be a component
  const CreateCaseModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Modal content logic would go here, reusing existing login or new simpler one */}
      <div className="bg-background border border-border p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Case</h2>
        <p className="text-muted-foreground mb-4">Use the "Import Case" tab for automatic setup.</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button onClick={() => setShowCreateModal(false)}>Create Manual</Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-300">
      <Navigation />

      <main className="flex-1 px-4 py-8 md:px-6 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 animate-fade-in-up">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Advocate Workspace
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Manage your legal practice, deadlines, and case files efficiently.
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <Button variant="outline" className="hidden md:flex">
                <Search className="mr-2 h-4 w-4" /> Search Cases
              </Button>
              <Button onClick={() => setActiveTab("import")} className="shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Import Case
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-[600px] mb-8">
              <TabsTrigger value="cases">My Cases</TabsTrigger>
              <TabsTrigger value="calendar">Smart Calendar</TabsTrigger>
              <TabsTrigger value="import">Import Case (e-Courts)</TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="space-y-6 animate-fade-in-up md:min-h-[500px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" /> Filter
                  </Button>
                  <span className="text-sm text-muted-foreground ml-2">{cases.length} Active Cases</span>
                </div>
                <div className="flex items-center border rounded-lg p-0.5 bg-muted/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 ${viewMode === 'grid' ? 'bg-background shadow-sm' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 ${viewMode === 'list' ? 'bg-background shadow-sm' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-56 rounded-xl border border-border bg-muted/20 animate-pulse" />
                  ))}
                </div>
              ) : cases.length > 0 ? (
                <div className={viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}>
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

      {showCreateModal && <CreateCaseModal />}
    </div>
  )
}
