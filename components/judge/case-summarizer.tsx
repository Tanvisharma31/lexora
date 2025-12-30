"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface CaseSummarizerProps {
  documentId?: string
  onSummaryGenerated?: (summary: any) => void
}

export function CaseSummarizer({ documentId, onSummaryGenerated }: CaseSummarizerProps) {
  const [documentText, setDocumentText] = useState("")
  const [summaryLevel, setSummaryLevel] = useState<"executive" | "detailed" | "full">("detailed")
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generateSummary = async () => {
    if (!documentId && !documentText.trim()) {
      toast.error("Please provide document text or ID")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/judge/case-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: documentId,
          document_text: documentText,
          summary_level: summaryLevel
        }),
        credentials: "include"
      })

      if (!response.ok) throw new Error("Failed to generate summary")

      const data = await response.json()
      setSummary(data)
      if (onSummaryGenerated) onSummaryGenerated(data)
      toast.success("Summary generated successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate summary")
    } finally {
      setLoading(false)
    }
  }

  const downloadSummary = () => {
    if (!summary) return
    
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `case-summary-${Date.now()}.json`
    a.click()
    toast.success("Summary downloaded")
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Case Summarizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Level Selector */}
          <div className="flex gap-2">
            <Button
              variant={summaryLevel === "executive" ? "default" : "outline"}
              size="sm"
              onClick={() => setSummaryLevel("executive")}
            >
              Executive (1 page)
            </Button>
            <Button
              variant={summaryLevel === "detailed" ? "default" : "outline"}
              size="sm"
              onClick={() => setSummaryLevel("detailed")}
            >
              Detailed (5 pages)
            </Button>
            <Button
              variant={summaryLevel === "full" ? "default" : "outline"}
              size="sm"
              onClick={() => setSummaryLevel("full")}
            >
              Full Analysis
            </Button>
          </div>

          {/* Input */}
          {!documentId && (
            <Textarea
              placeholder="Paste case document text here (or provide document ID)..."
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              rows={6}
            />
          )}

          {/* Generate Button */}
          <Button onClick={generateSummary} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate {summaryLevel.charAt(0).toUpperCase() + summaryLevel.slice(1)} Summary
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Summary Display */}
      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Summary</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{summaryLevel}</Badge>
                <Button variant="outline" size="sm" onClick={downloadSummary}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="parties">Parties</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="prose dark:prose-invert max-w-none">
                  <p>{summary.summary}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Points:</h4>
                  <ul className="space-y-1">
                    {summary.key_points?.map((point: string, index: number) => (
                      <li key={index} className="text-sm">{point}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="parties">
                <div className="grid gap-3">
                  {Object.entries(summary.parties || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium capitalize">{key.replace("_", " ")}:</span>
                      <span className="text-sm">{value as string}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <div className="space-y-2">
                  {summary.timeline?.map((event: any, index: number) => (
                    <div key={index} className="flex gap-3 p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm">{event.event}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="sections">
                <div className="space-y-4">
                  {Object.entries(summary.sections || {}).map(([key, value]) => (
                    <div key={key}>
                      <h4 className="font-semibold mb-2 capitalize">{key}</h4>
                      <p className="text-sm text-muted-foreground">{value as string}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

