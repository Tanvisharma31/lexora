"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Upload, FileText, AlertTriangle, CheckCircle, X, Folder, Trash2, Clock, File } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

export default function AnalyzePage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()

  // Input State
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')
  const [documentText, setDocumentText] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [clientName, setClientName] = useState("")

  // Analysis State
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // History State
  const [history, setHistory] = useState<Array<any>>([])

  // Workspace integration State
  const [cases, setCases] = useState<Array<{ id: string; title: string }>>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState("")

  useEffect(() => {
    if (isSignedIn) {
      fetchCases()
      fetchHistory()
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
      console.error("Failed to fetch cases")
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/analyze-document/history")
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) {
      console.error("Failed to fetch history")
    }
  }

  const handleDeleteHistory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const response = await fetch(`/api/analyze-document/${id}`, { method: "DELETE" })
      if (response.ok) {
        setHistory(prev => prev.filter(doc => doc.document_id !== id))
        toast.success("Document deleted")
      } else {
        toast.error("Failed to delete")
      }
    } catch (error) {
      toast.error("Error deleting document")
    }
  }

  const handleSaveToCase = async () => {
    if (!selectedCaseId) {
      toast.error("Please select a case")
      return
    }

    const content = `ANALYSIS REPORT\n\nSUMMARY:\n${analysis.summary}\n\nCOMPLIANCE SCORE: ${analysis.compliance_score}/100\n\nFULL ANALYSIS:\n${analysis.full_analysis}`

    try {
      const response = await fetch(`/api/workspace/cases/${selectedCaseId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: analysis.client_name ? `Analysis: ${analysis.client_name}` : "Document Analysis Report",
          content: content,
          file_type: "text/plain",
          fileUrl: analysis.file_url
        })
      })

      if (response.ok) {
        toast.success("Analysis saved to case")
        setShowSaveModal(false)
      } else {
        toast.error("Failed to save to case")
      }
    } catch (error) {
      toast.error("Error saving to case")
    }
  }

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File is too large (max 10MB)")
      return
    }
    setSelectedFile(file)
    setActiveTab('file')
    // Reset text input to avoid confusion
    setDocumentText("")
  }

  const handleAnalyze = async () => {
    if (!isSignedIn) {
      toast.info("Please sign in to analyze documents")
      router.push("/sign-in")
      return
    }

    // Validation
    if (!clientName.trim()) {
      toast.error("Client name is required")
      return
    }

    if (activeTab === 'text' && !documentText.trim()) {
      toast.error("Please enter document text")
      return
    }
    if (activeTab === 'file') {
      if (!selectedFile) {
        toast.error("Please select a file")
        return
      }
    }

    setIsLoading(true)
    setAnalysis(null)

    try {
      let response;

      if (activeTab === 'file' && selectedFile) {
        // File Upload Flow
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('client_name', clientName)
        formData.append('document_type', 'legal_contract') // default or add select

        response = await fetch("/api/analyze-document", {
          method: "POST",
          body: formData // Content-Type header excluded for boundary
        })
      } else {
        // Text Input Flow
        response = await fetch("/api/analyze-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            document_text: documentText,
            document_type: null,
            client_name: clientName
          })
        })
      }

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || "Analysis failed")
      }

      const data = await response.json()
      console.log("Analysis response data:", data)
      console.log("Document ID:", data.document_id)
      setAnalysis(data)
      toast.success("Document analyzed successfully")

      // Refresh history if file upload
      if (activeTab === 'file') {
        fetchHistory()
      }

    } catch (error) {
      console.error(error)
      toast.error("Document analysis failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  return (
    <>
      <Navigation />
      <main className="flex-1 px-4 py-10 md:px-6 lg:py-16 bg-black min-h-screen">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                <span className="gradient-text-glow">Document Analysis</span>
              </h1>
              <p className="mt-4 text-lg text-white/70">
                Upload PDF contracts or paste text for AI-powered legal analysis
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-xl w-fit backdrop-blur-sm">
              <button
                onClick={() => setActiveTab('text')}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'text' ? 'bg-white text-black shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                Paste Text
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'file' ? 'bg-white text-black shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                Upload PDF
              </button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Panel - Input */}
            <div className="lg:col-span-5 space-y-6">

              <div className="space-y-4">
                {/* Client Name Input - Common for both tabs */}
                <div className="space-y-2">
                  <label className="text-sm font-medium ml-1">Client Name / Identifier <span className="text-red-500">*</span></label>
                  <Input
                    placeholder="e.g. Acme Corp NDA"
                    value={clientName}
                    onChange={(e: any) => setClientName(e.target.value)}
                    className="bg-background/50 border-primary/20 focus:border-primary/50"
                  />
                  <p className="text-xs text-muted-foreground ml-1">Used to identify this document later.</p>
                </div>

                {activeTab === 'text' ? (
                  <div className="liquid rounded-2xl p-1">
                    <textarea
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder="Paste legal document text here..."
                      className="w-full min-h-[400px] rounded-xl border-none bg-background/50 px-6 py-6 liquid-subtle resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* File Drop Zone */}
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`liquid rounded-2xl p-10 border-2 border-dashed transition-all cursor-pointer group ${dragActive ? "border-primary bg-primary/5" : "border-primary/20 hover:border-primary/40"
                        } ${selectedFile ? "bg-primary/5 border-primary/50" : ""}`}
                    >
                      <div className="text-center">
                        {selectedFile ? (
                          <div className="py-4">
                            <FileText className="mx-auto h-16 w-16 text-primary mb-4 animate-in fade-in zoom-in" />
                            <p className="text-lg font-medium text-foreground break-all px-4">
                              {selectedFile.name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                              }}
                              className="mt-4 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                            >
                              Remove File
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4 group-hover:scale-110 transition-transform duration-300" />
                            <p className="text-sm text-muted-foreground mb-4">
                              Drag PDF here or click to select
                            </p>
                            <label className="cursor-pointer">
                              <span className="sr-only">Choose file</span>
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleFileSelect(e.target.files[0])
                                  }
                                }}
                                className="hidden"
                              />
                              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm">
                                Browse Files
                              </span>
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isLoading || !clientName || (activeTab === 'text' && !documentText) || (activeTab === 'file' && !selectedFile)}
                className="w-full liquid-glow h-12 text-lg font-medium shadow-lg shadow-primary/20"
              >
                <FileText className="mr-2 h-5 w-5" />
                {isLoading ? "Analyzing..." : "Analyze Document"}
              </Button>

              {/* History Section */}
              {history.length > 0 && (
                <div className="mt-8 pt-8 border-t border-border/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Recent Uploads
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((doc) => (
                      <div key={doc.document_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                        <div
                          className="flex items-center gap-3 overflow-hidden cursor-pointer"
                          onClick={() => setAnalysis(doc)}
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <File className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate text-foreground">{doc.client_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.analyzed_at).toLocaleDateString()} • {doc.compliance_score}% Score
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                            onClick={() => handleDeleteHistory(doc.document_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Analysis Results */}
            <div className="lg:col-span-7">
              {analysis ? (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  {/* Header Card */}
                  <div className="liquid rounded-2xl p-6 border-l-4 border-l-primary flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold">{analysis.client_name || "Analysis Report"}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Analyzed on {new Date(analysis.analyzed_at || Date.now()).toLocaleDateString()}
                      </p>
                      {analysis.document_id && (
                        <button
                          onClick={async () => {
                            try {
                              // Fetch signed URL from backend (expires in 1 hour)
                              const response = await fetch(`/api/analyze-document/${analysis.document_id}/signed-url`)
                              if (!response.ok) {
                                throw new Error('Failed to get signed URL')
                              }
                              const data = await response.json()
                              // Open signed URL in new tab (users can't see original document URL)
                              window.open(data.signed_url, '_blank')
                            } catch (error) {
                              console.error('Error fetching signed URL:', error)
                              toast.error('Failed to open PDF')
                            }
                          }}
                          className="text-xs text-primary hover:underline mt-2 inline-block cursor-pointer"
                        >
                          View Original PDF
                        </button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSaveModal(true)}
                      className="liquid-subtle"
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      Save to Case
                    </Button>
                  </div>

                  {/* Score & Summary Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Score */}
                    <div className="liquid rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                      <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Compliance Score</h3>
                      <div className="relative h-32 w-32 flex items-center justify-center">
                        <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                          <path className="text-muted/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          <path
                            className={`${analysis.compliance_score >= 80 ? 'text-green-500' : analysis.compliance_score >= 60 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                            strokeDasharray={`${analysis.compliance_score}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                        </svg>
                        <span className="absolute text-3xl font-bold">{analysis.compliance_score}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {analysis.compliance_score >= 80 ? 'Low Risk' : analysis.compliance_score >= 60 ? 'Audit Recommended' : 'High Risk'}
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="liquid rounded-2xl p-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Executive Summary
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground max-h-[140px] overflow-y-auto">
                        {analysis.summary}
                      </p>
                    </div>
                  </div>

                  {/* Risks & Recommendations */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="liquid rounded-2xl p-6">
                      <h3 className="text-sm font-medium text-red-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Key Risks
                      </h3>
                      <ul className="space-y-2">
                        {analysis.risks?.slice(0, 3).map((risk: string, i: number) => (
                          <li key={i} className="text-sm p-2 bg-red-500/5 rounded border border-red-500/10 flex gap-2">
                            <span className="text-red-500">•</span> {risk}
                          </li>
                        ))}
                        {(!analysis.risks || analysis.risks.length === 0) && <p className="text-sm text-muted-foreground">No major risks detected.</p>}
                      </ul>
                    </div>

                    <div className="liquid rounded-2xl p-6">
                      <h3 className="text-sm font-medium text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" /> Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {analysis.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                          <li key={i} className="text-sm p-2 bg-blue-500/5 rounded border border-blue-500/10 flex gap-2">
                            <span className="text-blue-500">•</span> {rec}
                          </li>
                        ))}
                        {(!analysis.recommendations || analysis.recommendations.length === 0) && <p className="text-sm text-muted-foreground">No recommendations available.</p>}
                      </ul>
                    </div>
                  </div>

                  {/* Full Analysis Content */}
                  <div className="liquid rounded-2xl p-8">
                    <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-white/5">Detailed Clause Analysis</h3>
                    <div className="prose prose-invert max-w-none text-sm text-muted-foreground leading-relaxed">
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {analysis.full_analysis}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[500px] liquid rounded-2xl flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-primary/10">
                  <div className="bg-primary/5 p-6 rounded-full mb-6 relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <FileText className="h-16 w-16 text-primary relative z-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Ready to Analyze</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Select a document from the left or upload a new one to receive a comprehensive AI legal analysis, risk assessment, and compliance score.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save to Case Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowSaveModal(false)}>
            <div className="liquid rounded-2xl p-6 w-full max-w-md bg-background border border-primary/20 shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-semibold mb-4">Save Analysis to Case</h2>
              <div className="space-y-4">
                {cases.length === 0 ? (
                  <div className="text-center py-6">
                    <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      No cases found. Create a case in Workspace to save your analysis.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowSaveModal(false)
                        router.push("/workspace")
                      }}
                      className="liquid-subtle w-full"
                    >
                      Go to Workspace
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Select Case</label>
                      <select
                        value={selectedCaseId}
                        onChange={(e: any) => setSelectedCaseId(e.target.value)}
                        className="w-full rounded-lg border border-primary/20 bg-background/50 px-3 py-3 liquid-subtle focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Select a case...</option>
                        {cases.map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="ghost" onClick={() => setShowSaveModal(false)}>Cancel</Button>
                      <Button onClick={handleSaveToCase} disabled={!selectedCaseId} className="liquid-glow">Save Report</Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
