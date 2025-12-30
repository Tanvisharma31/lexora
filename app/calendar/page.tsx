"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  Calendar as CalendarIcon, 
  Plus, 
  AlertTriangle, 
  Clock, 
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Filter
} from "lucide-react"
import { Navigation } from "@/components/navigation"


interface Deadline {
  id: string
  title: string
  description: string | null
  deadlineType: string
  date: string
  time: string | null
  durationMinutes: number | null
  location: string | null
  priority: string
  reminderDays: number[]
  assignedTo: string[]
  status: string
  recurring: boolean
  recurrencePattern: string | null
  notes: string | null
  createdAt: string
  daysRemaining: number | null
  isOverdue: boolean
}

interface DeadlineStats {
  totalDeadlines: number
  pendingDeadlines: number
  overdueDeadlines: number
  completedDeadlines: number
  upcomingThisWeek: number
  byType: Record<string, number>
  byPriority: Record<string, number>
}

export default function CalendarPage() {
  const { user } = useUser()
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [stats, setStats] = useState<DeadlineStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadlineType: "COURT_DATE",
    date: "",
    time: "",
    durationMinutes: "",
    location: "",
    priority: "MEDIUM",
    reminderDays: "7,3,1",
    notes: ""
  })

  useEffect(() => {
    if (user) {
      fetchDeadlines()
      fetchStats()
    }
  }, [user, filter])

  const fetchDeadlines = async () => {
    try {
      setLoading(true)
      let url = "/api/deadlines?limit=100"
      
      if (filter === "pending") url += "&status=PENDING"
      else if (filter === "completed") url += "&status=COMPLETED"
      else if (filter === "overdue") url += "&overdue=true"
      else if (filter === "upcoming") url = "/api/deadlines/upcoming?days=7"

      const response = await fetch(url)

      if (!response.ok) throw new Error("Failed to fetch deadlines")
      const data = await response.json()
      setDeadlines(data)
    } catch (error) {
      console.error("Error fetching deadlines:", error)
      toast.error("Failed to load deadlines")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/deadlines/stats/overview")

      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleCreateDeadline = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const reminderDaysArray = formData.reminderDays
        .split(",")
        .map(d => parseInt(d.trim()))
        .filter(d => !isNaN(d))

      // Validate required fields
      if (!formData.title.trim()) {
        toast.error("Please enter a title")
        return
      }
      if (!formData.date) {
        toast.error("Please select a date")
        return
      }

      // Format date properly - ensure it's in ISO format
      let dateValue = formData.date
      // If it's just a date (YYYY-MM-DD), add time if provided
      if (dateValue && typeof dateValue === 'string' && !dateValue.includes('T')) {
        if (formData.time && formData.time.trim()) {
          dateValue = `${dateValue}T${formData.time}:00`
        } else {
          dateValue = `${dateValue}T00:00:00`
        }
      }

      const response = await fetch("/api/deadlines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          deadlineType: formData.deadlineType,
          date: dateValue,
          time: formData.time || null,
          durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : null,
          location: formData.location || null,
          priority: formData.priority,
          reminderDays: reminderDaysArray.length > 0 ? reminderDaysArray : [7, 3, 1],
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        const errorMessage = errorData.details || errorData.error || "Failed to create deadline"
        throw new Error(errorMessage)
      }

      toast.success("Deadline created successfully!")
      setIsCreateDialogOpen(false)
      setFormData({
        title: "",
        description: "",
        deadlineType: "COURT_DATE",
        date: "",
        time: "",
        durationMinutes: "",
        location: "",
        priority: "MEDIUM",
        reminderDays: "7,3,1",
        notes: ""
      })
      fetchDeadlines()
      fetchStats()
    } catch (error) {
      console.error("Error creating deadline:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create deadline"
      toast.error(errorMessage)
    }
  }

  const handleMarkComplete = async (deadlineId: string) => {
    try {
      const response = await fetch(`/api/deadlines/${deadlineId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "COMPLETED" }),
      })

      if (!response.ok) throw new Error("Failed to update deadline")

      toast.success("Deadline marked as complete!")
      fetchDeadlines()
      fetchStats()
    } catch (error) {
      console.error("Error updating deadline:", error)
      toast.error("Failed to update deadline")
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800"
    }
    return <Badge className={colors[priority as keyof typeof colors] || ""}>{priority}</Badge>
  }

  const getStatusBadge = (deadline: Deadline) => {
    if (deadline.status === "COMPLETED") {
      return <Badge variant="default"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>
    }
    if (deadline.isOverdue) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Overdue</Badge>
    }
    if (deadline.daysRemaining !== null && deadline.daysRemaining <= 3) {
      return <Badge variant="outline" className="border-orange-500 text-orange-500"><AlertTriangle className="w-3 h-3 mr-1" />Due Soon</Badge>
    }
    return <Badge variant="secondary">Pending</Badge>
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A"
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const formatDateTime = (dateStr: string | null | undefined, timeStr: string | null | undefined) => {
    if (!dateStr) return "N/A"
    try {
      if (timeStr) {
        return `${formatDate(dateStr)} at ${timeStr}`
      }
      return formatDate(dateStr)
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navigation />

      <div className="container mx-auto px-3 sm:px-4 md:p-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Calendar & Deadlines</h1>
            <p className="text-sm sm:text-base text-white/70 mt-1">
              Manage court dates, filings, and important deadlines
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs sm:text-sm flex-shrink-0">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">New Deadline</span>
                <span className="sm:hidden">New</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Deadline</DialogTitle>
              <DialogDescription>
                Add a new deadline or calendar event
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDeadline} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., High Court Hearing - Case #123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about this deadline"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadlineType">Type *</Label>
                  <Select
                    value={formData.deadlineType}
                    onValueChange={(value) => setFormData({ ...formData, deadlineType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COURT_DATE">Court Date</SelectItem>
                      <SelectItem value="FILING_DEADLINE">Filing Deadline</SelectItem>
                      <SelectItem value="HEARING">Hearing</SelectItem>
                      <SelectItem value="CONSULTATION">Consultation</SelectItem>
                      <SelectItem value="MEETING">Meeting</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    placeholder="60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderDays">Reminder Days (comma-separated)</Label>
                  <Input
                    id="reminderDays"
                    value={formData.reminderDays}
                    onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
                    placeholder="7,3,1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Court address or meeting location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Deadline</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDeadlines}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.pendingDeadlines}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.overdueDeadlines}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <CalendarIcon className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.upcomingThisWeek}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.completedDeadlines}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "upcoming" ? "default" : "outline"}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming (7 days)
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
        >
          Pending
        </Button>
        <Button
          variant={filter === "overdue" ? "default" : "outline"}
          onClick={() => setFilter("overdue")}
        >
          Overdue
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
      </div>

      {/* Deadlines List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading deadlines...</p>
        </div>
      ) : deadlines.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No deadlines found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === "all" 
                ? "Get started by creating your first deadline"
                : `No ${filter} deadlines at the moment`
              }
            </p>
            {filter === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Deadline
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {deadlines.map((deadline) => (
            <Card key={deadline.id} className={deadline.isOverdue ? "border-red-500" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{deadline.title}</CardTitle>
                      {getPriorityBadge(deadline.priority)}
                      {getStatusBadge(deadline)}
                    </div>
                    <CardDescription>
                      {deadline.deadlineType ? deadline.deadlineType.replace(/_/g, " ") : "Deadline"}
                      {deadline.description && ` • ${deadline.description}`}
                    </CardDescription>
                  </div>
                  {deadline.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkComplete(deadline.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-medium">{formatDateTime(deadline.date, deadline.time)}</p>
                  </div>
                  {deadline.location && (
                    <div>
                      <p className="text-muted-foreground mb-1">Location</p>
                      <p className="font-medium flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {deadline.location}
                      </p>
                    </div>
                  )}
                  {deadline.durationMinutes && (
                    <div>
                      <p className="text-muted-foreground mb-1">Duration</p>
                      <p className="font-medium">{deadline.durationMinutes} minutes</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground mb-1">Days Remaining</p>
                    <p className={`font-medium ${deadline.isOverdue ? "text-red-500" : ""}`}>
                      {deadline.daysRemaining !== null 
                        ? deadline.isOverdue 
                          ? `${Math.abs(deadline.daysRemaining)} days overdue`
                          : `${deadline.daysRemaining} days`
                        : "N/A"
                      }
                    </p>
                  </div>
                </div>
                {deadline.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">{deadline.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </div>
  )
}

