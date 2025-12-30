"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  FileText, Download, ZoomIn, ZoomOut, Search, 
  Highlighter, Bookmark, MessageSquare, X 
} from "lucide-react"
import { toast } from "sonner"

interface Annotation {
  id: string
  page: number
  text: string
  note: string
  color: string
  createdAt: Date
}

interface DocumentViewerProps {
  documentUrl: string
  documentName: string
  documentType?: string
  onAnnotate?: (annotation: Annotation) => void
  onBookmark?: (page: number) => void
  readOnly?: boolean
}

export function DocumentViewer({
  documentUrl,
  documentName,
  documentType = "PDF",
  onAnnotate,
  onBookmark,
  readOnly = false
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(1) // Would be calculated from PDF
  const [searchQuery, setSearchQuery] = useState("")
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [selectedText, setSelectedText] = useState("")
  const [noteInput, setNoteInput] = useState("")

  const handleZoomIn = () => {
    if (zoom < 200) setZoom(zoom + 10)
  }

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 10)
  }

  const handleDownload = () => {
    // Create a download link
    const link = document.createElement('a')
    link.href = documentUrl
    link.download = documentName
    link.click()
    toast.success("Document download started")
  }

  const handleAddAnnotation = () => {
    if (!selectedText || !noteInput) {
      toast.error("Please select text and add a note")
      return
    }

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      page: currentPage,
      text: selectedText,
      note: noteInput,
      color: "#FFEB3B",
      createdAt: new Date()
    }

    setAnnotations([...annotations, newAnnotation])
    if (onAnnotate) onAnnotate(newAnnotation)
    
    setSelectedText("")
    setNoteInput("")
    toast.success("Annotation added")
  }

  const handleBookmark = () => {
    if (onBookmark) onBookmark(currentPage)
    toast.success(`Page ${currentPage} bookmarked`)
  }

  const handleSearch = () => {
    if (!searchQuery) return
    toast.info(`Searching for: ${searchQuery}`)
    // Implement actual search in PDF
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">
      {/* Main Document Viewer */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <div>
                  <CardTitle className="text-lg">{documentName}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {documentType} • Page {currentPage} of {totalPages}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{zoom}%</Badge>
                <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                {!readOnly && (
                  <Button variant="ghost" size="icon" onClick={handleBookmark}>
                    <Bookmark className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0">
            {/* Search Bar */}
            <div className="px-4 pb-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Search in document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Document Content */}
            <ScrollArea className="h-full px-4">
              <div 
                className="bg-white rounded-lg shadow-inner p-8 min-h-[600px]"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              >
                {/* PDF/Document rendering would go here */}
                {/* For now, showing placeholder */}
                <div className="prose max-w-none">
                  <p className="text-center text-muted-foreground py-12">
                    Document viewer loading...
                    <br />
                    <span className="text-sm">
                      In production, this would render: {documentUrl}
                    </span>
                  </p>
                  
                  {/* Sample content for demonstration */}
                  <div className="space-y-4 mt-8">
                    <h2>Sample Legal Document Content</h2>
                    <p>
                      This is where the actual document content would be rendered. 
                      The document viewer supports:
                    </p>
                    <ul>
                      <li>PDF rendering with zoom controls</li>
                      <li>Text selection and highlighting</li>
                      <li>Annotations and notes</li>
                      <li>Bookmarking pages</li>
                      <li>Full-text search</li>
                      <li>Document download</li>
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Page Navigation */}
            <div className="flex items-center justify-center gap-4 p-4 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Annotations Sidebar */}
      {!readOnly && (
        <div className="w-full lg:w-80">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Annotations
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnnotations(!showAnnotations)}
                >
                  {showAnnotations ? "Hide" : "Show"}
                </Button>
              </div>
            </CardHeader>
            
            {showAnnotations && (
              <CardContent className="flex-1 flex flex-col space-y-4">
                {/* Add New Annotation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Add Annotation</label>
                  <Input
                    placeholder="Selected text..."
                    value={selectedText}
                    onChange={(e) => setSelectedText(e.target.value)}
                  />
                  <Textarea
                    placeholder="Your note..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddAnnotation} 
                    size="sm" 
                    className="w-full"
                  >
                    <Highlighter className="h-4 w-4 mr-2" />
                    Add Annotation
                  </Button>
                </div>

                {/* Annotations List */}
                <div className="flex-1">
                  <ScrollArea className="h-full">
                    {annotations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No annotations yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {annotations.map((annotation) => (
                          <div 
                            key={annotation.id}
                            className="p-3 rounded-lg border bg-card"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                Page {annotation.page}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  setAnnotations(annotations.filter(a => a.id !== annotation.id))
                                  toast.success("Annotation removed")
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm font-medium mb-1 line-clamp-2">
                              "{annotation.text}"
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {annotation.note}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {annotation.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

