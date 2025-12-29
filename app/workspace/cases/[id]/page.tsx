"use client"

import { useState, useEffect, use } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Upload, Plus, Calendar, MoreVertical, Trash2, Download } from "lucide-react"
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
    created_at: string
    updated_at: string
}

interface Document {
    id: string
    title: string
    content: string
    file_url: string
    file_type: string
    created_at: string
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { isSignedIn } = useUser()
    const router = useRouter()
    const [caseData, setCaseData] = useState<Case | null>(null)
    const [documents, setDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [newDoc, setNewDoc] = useState({ title: "", content: "" })

    useEffect(() => {
        if (isSignedIn) {
            fetchCaseDetails()
            fetchDocuments()
        }
    }, [isSignedIn, id])

    const fetchCaseDetails = async () => {
        try {
            const response = await fetch(`/api/workspace/cases/${id}`)
            if (response.ok) {
                const data = await response.json()
                setCaseData(data)
            } else {
                toast.error("Case not found")
                router.push("/workspace")
            }
        } catch (error) {
            console.error("Error fetching case", error)
        }
    }

    const fetchDocuments = async () => {
        try {
            const response = await fetch(`/api/workspace/cases/${id}/documents`)
            if (response.ok) {
                const data = await response.json()
                setDocuments(data)
            }
        } catch (error) {
            console.error("Error fetching documents", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUploadDocument = async () => {
        if (!newDoc.title) {
            toast.error("Title is required")
            return
        }

        try {
            const response = await fetch(`/api/workspace/cases/${id}/documents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newDoc.title,
                    content: newDoc.content,
                    file_type: "text/plain" // Default for manual entry
                })
            })

            if (response.ok) {
                toast.success("Document added successfully")
                setShowUploadModal(false)
                setNewDoc({ title: "", content: "" })
                fetchDocuments()
            } else {
                toast.error("Failed to add document")
            }
        } catch (error) {
            toast.error("Error adding document")
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <Navigation />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navigation />

            <main className="flex-1 px-4 py-8 md:px-6 lg:py-12">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/workspace"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Workspace
                        </Link>

                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl mb-2">
                                    {caseData?.title}
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                                        {caseData?.status}
                                    </span>
                                    <span>{caseData?.jurisdiction}</span>
                                    <span className="flex items-center">
                                        <Calendar className="mr-1 h-3 w-3" />
                                        Updated {new Date(caseData?.updated_at || "").toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <Button onClick={() => setShowUploadModal(true)} className="liquid-glow">
                                <Upload className="mr-2 h-4 w-4" />
                                Add Document
                            </Button>
                        </div>

                        <p className="mt-4 text-muted-foreground max-w-3xl">
                            {caseData?.description}
                        </p>
                    </div>

                    {/* Upload Modal */}
                    {showUploadModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                            <div className="liquid rounded-2xl p-6 w-full max-w-md bg-background border border-primary/20 shadow-xl">
                                <h2 className="text-xl font-semibold mb-4">Add Document</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Document Title</label>
                                        <input
                                            type="text"
                                            value={newDoc.title}
                                            onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                                            className="w-full rounded-lg border border-primary/20 bg-background/50 px-3 py-2 liquid-subtle"
                                            placeholder="e.g. Petition Draft"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Content (Optional)</label>
                                        <textarea
                                            value={newDoc.content}
                                            onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                                            className="w-full rounded-lg border border-primary/20 bg-background/50 px-3 py-2 liquid-subtle min-h-[100px]"
                                            placeholder="Paste document content here..."
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-6">
                                        <Button variant="ghost" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                                        <Button onClick={handleUploadDocument}>Save Document</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents List */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Case Documents
                        </h2>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {documents.length > 0 ? (
                                documents.map((doc) => (
                                    <div key={doc.id} className="liquid rounded-xl p-4 liquid-hover group relative">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <h3 className="font-medium mb-1 line-clamp-1">{doc.title}</h3>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Added {new Date(doc.created_at).toLocaleDateString()}
                                        </p>
                                        <div className="flex gap-2 mt-auto">
                                            <Button variant="outline" size="sm" className="w-full text-xs h-8">
                                                View
                                            </Button>
                                            <Button variant="outline" size="sm" className="w-full text-xs h-8">
                                                <Download className="h-3 w-3 mr-1" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 liquid rounded-2xl border-dashed border-2 border-primary/20">
                                    <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground mb-4">No documents added yet</p>
                                    <Button variant="outline" onClick={() => setShowUploadModal(true)}>
                                        Upload Document
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
