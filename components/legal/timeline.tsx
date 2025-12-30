"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, Filter, Download, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

export interface TimelineEvent {
  id: string
  date: Date
  title: string
  description?: string
  category?: string
  location?: string
  participants?: string[]
  documents?: string[]
  importance?: "low" | "medium" | "high"
}

interface TimelineProps {
  events: TimelineEvent[]
  onAddEvent?: (event: Omit<TimelineEvent, 'id'>) => void
  onDeleteEvent?: (id: string) => void
  onExport?: () => void
  editable?: boolean
  showFilters?: boolean
  compactView?: boolean
}

export function Timeline({
  events,
  onAddEvent,
  onDeleteEvent,
  onExport,
  editable = false,
  showFilters = true,
  compactView = false
}: TimelineProps) {
  const [filterQuery, setFilterQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    const comparison = a.date.getTime() - b.date.getTime()
    return sortOrder === "asc" ? comparison : -comparison
  })

  // Filter events
  const filteredEvents = sortedEvents.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(filterQuery.toLowerCase())
    
    const matchesCategory = 
      selectedCategory === "all" || 
      event.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = ["all", ...new Set(events.map(e => e.category).filter(Boolean))]

  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      // Default export as JSON
      const dataStr = JSON.stringify(events, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `timeline-${Date.now()}.json`
      link.click()
      toast.success("Timeline exported")
    }
  }

  const getImportanceColor = (importance?: string) => {
    switch (importance) {
      case "high": return "bg-red-500"
      case "medium": return "bg-yellow-500"
      case "low": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Case Chronology
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{filteredEvents.length} events</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "Oldest First" : "Newest First"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            {editable && onAddEvent && (
              <Button size="sm" onClick={() => toast.info("Add event modal would open here")}>
                <Plus className="h-4 w-4 mr-1" />
                Add Event
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex items-center gap-2 mt-4">
            <Input
              placeholder="Search events..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="max-w-xs"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events found</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              {/* Events */}
              <div className="space-y-6">
                {filteredEvents.map((event, index) => (
                  <div key={event.id} className="relative pl-12">
                    {/* Timeline Dot */}
                    <div 
                      className={`absolute left-2 w-4 h-4 rounded-full border-2 border-background ${getImportanceColor(event.importance)}`}
                    />

                    {/* Event Card */}
                    <Card className={compactView ? "" : "p-4"}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Date */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Calendar className="h-3 w-3" />
                            {event.date.toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                            {event.date.getHours() !== 0 && (
                              <span>• {event.date.toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="font-semibold text-base mb-1">
                            {event.title}
                          </h4>

                          {/* Description */}
                          {event.description && !compactView && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                          )}

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {event.category && (
                              <Badge variant="secondary" className="text-xs">
                                {event.category}
                              </Badge>
                            )}
                            {event.location && (
                              <Badge variant="outline" className="text-xs">
                                📍 {event.location}
                              </Badge>
                            )}
                            {event.participants && event.participants.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                👥 {event.participants.length} participants
                              </Badge>
                            )}
                            {event.documents && event.documents.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                📄 {event.documents.length} documents
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {editable && onDeleteEvent && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => {
                              onDeleteEvent(event.id)
                              toast.success("Event deleted")
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

