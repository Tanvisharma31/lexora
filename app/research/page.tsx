"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { 
  BookOpen, 
  Plus, 
  Folder, 
  Search, 
  FileText, 
  Star,
  Tag,
  Bookmark,
  FolderPlus,
  Edit,
  Trash2
} from "lucide-react"

interface ResearchFolder {
  id: string
  name: string
  description: string | null
  parentId: string | null
  color: string | null
  createdAt: string
  itemCount: number
}

interface SavedSearch {
  id: string
  query: string
  description: string | null
  tags: string[]
  folderId: string | null
  resultCount: number
  createdAt: string
  lastRunAt: string | null
}

interface CaseAnnotation {
  id: string
  caseId: string
  caseTitle: string
  annotation: string
  highlights: string[]
  tags: string[]
  importance: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface ResearchNote {
  id: string
  title: string
  content: string
  caseIds: string[]
  tags: string[]
  folderId: string | null
  createdAt: string
  updatedAt: string
}

export default function ResearchLibraryPage() {
  const { user } = useUser()
  const [folders, setFolders] = useState<ResearchFolder[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [annotations, setAnnotations] = useState<CaseAnnotation[]>([])
  const [notes, setNotes] = useState<ResearchNote[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("folders")
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [folderForm, setFolderForm] = useState({
    name: "",
    description: "",
    color: "#3b82f6"
  })

  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    tags: ""
  })

  useEffect(() => {
    if (user) {
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchFolders(),
      fetchSavedSearches(),
      fetchAnnotations(),
      fetchNotes()
    ])
    setLoading(false)
  }

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/research/folders")
      if (!response.ok) throw new Error("Failed to fetch folders")
      const data = await response.json()
      setFolders(data)
    } catch (error) {
      console.error("Error fetching folders:", error)
    }
  }

  const fetchSavedSearches = async () => {
    try {
      const response = await fetch("/api/research/searches")
      if (!response.ok) throw new Error("Failed to fetch searches")
      const data = await response.json()
      setSavedSearches(data)
    } catch (error) {
      console.error("Error fetching searches:", error)
    }
  }

  const fetchAnnotations = async () => {
    try {
      const response = await fetch("/api/research/annotations")
      if (!response.ok) throw new Error("Failed to fetch annotations")
      const data = await response.json()
      setAnnotations(data)
    } catch (error) {
      console.error("Error fetching annotations:", error)
    }
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/research/notes")
      if (!response.ok) throw new Error("Failed to fetch notes")
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      console.error("Error fetching notes:", error)
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/research/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: folderForm.name,
          description: folderForm.description || null,
          color: folderForm.color,
        }),
      })

      if (!response.ok) throw new Error("Failed to create folder")

      toast.success("Folder created successfully!")
      setIsCreateFolderOpen(false)
      setFolderForm({ name: "", description: "", color: "#3b82f6" })
      fetchFolders()
    } catch (error) {
      console.error("Error creating folder:", error)
      toast.error("Failed to create folder")
    }
  }

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const tagsArray = noteForm.tags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0)

      const response = await fetch("/api/research/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: noteForm.title,
          content: noteForm.content,
          tags: tagsArray,
        }),
      })

      if (!response.ok) throw new Error("Failed to create note")

      toast.success("Note created successfully!")
      setIsCreateNoteOpen(false)
      setNoteForm({ title: "", content: "", tags: "" })
      fetchNotes()
    } catch (error) {
      console.error("Error creating note:", error)
      toast.error("Failed to create note")
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getImportanceBadge = (importance: string) => {
    const colors = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800"
    }
    return <Badge className={colors[importance as keyof typeof colors] || ""}>{importance}</Badge>
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredAnnotations = annotations.filter(ann =>
    ann.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ann.annotation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ann.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <div className="container mx-auto px-3 sm:px-4 md:p-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Research Library</h1>
          <p className="text-muted-foreground">
            Organize your legal research, annotations, and notes
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Research Folder</DialogTitle>
                <DialogDescription>
                  Organize your research by topic or practice area
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="folderName">Folder Name *</Label>
                  <Input
                    id="folderName"
                    value={folderForm.name}
                    onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                    placeholder="e.g., Contract Law Research"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="folderDescription">Description</Label>
                  <Textarea
                    id="folderDescription"
                    value={folderForm.description}
                    onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                    placeholder="What will you store in this folder?"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="folderColor">Color</Label>
                  <Input
                    id="folderColor"
                    type="color"
                    value={folderForm.color}
                    onChange={(e) => setFolderForm({ ...folderForm, color: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Folder</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateNoteOpen} onOpenChange={setIsCreateNoteOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Research Note</DialogTitle>
                <DialogDescription>
                  Document your legal research and analysis
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="noteTitle">Title *</Label>
                  <Input
                    id="noteTitle"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    placeholder="e.g., Analysis of Contract Breach Cases"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noteContent">Content *</Label>
                  <Textarea
                    id="noteContent"
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    placeholder="Your research notes and analysis..."
                    rows={10}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noteTags">Tags (comma-separated)</Label>
                  <Input
                    id="noteTags"
                    value={noteForm.tags}
                    onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                    placeholder="contract law, breach, remedies"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateNoteOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Note</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes, annotations, and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Folders</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{folders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Searches</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedSearches.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{annotations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Research Notes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="searches">Saved Searches</TabsTrigger>
          <TabsTrigger value="annotations">Annotations</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Folders Tab */}
        <TabsContent value="folders" className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : folders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No folders yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create folders to organize your research
                </p>
                <Button onClick={() => setIsCreateFolderOpen(true)}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Create Folder
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <Card key={folder.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: folder.color || "#3b82f6" }}
                      />
                      <CardTitle className="text-lg">{folder.name}</CardTitle>
                    </div>
                    {folder.description && (
                      <CardDescription>{folder.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {folder.itemCount} items • Created {formatDate(folder.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Saved Searches Tab */}
        <TabsContent value="searches" className="space-y-4">
          {savedSearches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No saved searches yet. Save searches from the search page.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {savedSearches.map((search) => (
                <Card key={search.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{search.query}</CardTitle>
                        {search.description && (
                          <CardDescription>{search.description}</CardDescription>
                        )}
                      </div>
                      <Badge>{search.resultCount} results</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {search.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      <span className="ml-auto">
                        Saved {formatDate(search.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Annotations Tab */}
        <TabsContent value="annotations" className="space-y-4">
          {filteredAnnotations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No annotations match your search" : "No annotations yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAnnotations.map((annotation) => (
                <Card key={annotation.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{annotation.caseTitle}</CardTitle>
                        <CardDescription className="mt-2">{annotation.annotation}</CardDescription>
                      </div>
                      {getImportanceBadge(annotation.importance)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      {annotation.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      <span className="ml-auto text-muted-foreground">
                        {formatDate(annotation.updatedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          {filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notes found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "No notes match your search"
                    : "Create your first research note"
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsCreateNoteOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Note
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {note.content}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Updated {formatDate(note.updatedAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
    
  )
}

