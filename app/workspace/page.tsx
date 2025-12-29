"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Briefcase, Folder, FileText, Calendar, Users, Bell, Plus, Search, MoreVertical } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

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
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCase, setNewCase] = useState({ title: "", description: "", jurisdiction: "Supreme Court" })

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

  const handleCreateCase = async () => {
    if (!newCase.title) {
      toast.error("Title is required")
      return
    }

    try {
      const response = await fetch("/api/workspace/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCase)
      })

      if (response.ok) {
        toast.success("Case created successfully")
        setShowCreateModal(false)
        setNewCase({ title: "", description: "", jurisdiction: "Supreme Court" })
        fetchCases()
      } else {
        toast.error("Failed to create case")
      }
    } catch (error) {
      toast.error("Error creating case")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navigation />

      <main className="flex-1 px-4 py-10 md:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6 animate-fade-in-up">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                <span className="gradient-text-glow">Advocate Workspace</span>
              </h1>
              <p className="mt-4 text-lg text-white/70">
                Manage your cases, clients, and documents in one place
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/20">
              <Plus className="h-4 w-4" />
              New Case
            </Button>
          </div>

          {/* Create Case Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in">
              <div className="liquid rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-premium-lg animate-scale-in">
                <h2 className="text-2xl font-bold mb-6 text-white">Create New Case</h2>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold mb-2 block text-white/90">Case Title</label>
                    <input
                      type="text"
                      value={newCase.title}
                      onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                      className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all"
                      placeholder="e.g. Sharma vs State of Delhi"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block text-white/90">Description</label>
                    <textarea
                      value={newCase.description}
                      onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                      className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all min-h-[100px]"
                      placeholder="Brief details about the case..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block text-white/90">Jurisdiction</label>
                    <select
                      value={newCase.jurisdiction}
                      onChange={(e) => setNewCase({ ...newCase, jurisdiction: e.target.value })}
                      className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all"
                    >
                      <option>Supreme Court</option>
                      <option>Delhi High Court</option>
                      <option>Bombay High Court</option>
                      <option>District Court</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 mt-8">
                    <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="hover:bg-white/10">Cancel</Button>
                    <Button onClick={handleCreateCase} className="hover:scale-105 active:scale-95">Create Case</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cases Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="liquid rounded-2xl p-6 h-56 skeleton border border-white/10" />
              ))
            ) : cases.length > 0 ? (
              cases.map((caseItem, index) => (
                <Link href={`/workspace/cases/${caseItem.id}`} key={caseItem.id}>
                  <div className="liquid rounded-2xl p-6 liquid-hover group relative h-full border border-white/10 hover:border-white/20 transition-all animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/20 group-hover:bg-white/15 group-hover:scale-110 transition-all shadow-lg shadow-white/5">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${caseItem.status === 'OPEN' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white/60 border border-white/20'
                        }`}>
                        {caseItem.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 line-clamp-1 text-white group-hover:text-white transition-colors">{caseItem.title}</h3>
                    <p className="text-sm text-white/60 mb-4 line-clamp-2 leading-relaxed">
                      {caseItem.description || "No description provided"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-white/50 mt-auto pt-4 border-t border-white/10">
                      <span className="font-medium">{caseItem.jurisdiction}</span>
                      <span>{new Date(caseItem.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-16 liquid rounded-2xl border border-white/10 animate-fade-in">
                <Briefcase className="mx-auto h-16 w-16 text-white/40 mb-6" />
                <h3 className="text-xl font-semibold text-white mb-2">No cases found</h3>
                <p className="text-white/60 mb-6">Create your first case to get started</p>
                <Button onClick={() => setShowCreateModal(true)} className="hover:scale-105 active:scale-95">
                  <Plus className="h-4 w-4" />
                  Create Case
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

