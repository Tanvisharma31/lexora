"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

interface CalendarEvent {
    id: string
    title: string
    start: string
    end?: string
    type: string
    priority: string
    case_title?: string
    location?: string
    status: string
}

export function CalendarView() {
    const { user } = useUser()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchCalendarEvents()
        }
    }, [user, currentDate])

    const fetchCalendarEvents = async () => {
        try {
            setLoading(true)
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
            
            const response = await fetch(
                `${BACKEND_URL}/api/deadlines/calendar?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`,
                {
                    headers: {
                        "X-Clerk-User-Id": user?.id || "",
                    },
                }
            )

            if (!response.ok) throw new Error("Failed to fetch calendar events")
            const data = await response.json()
            setEvents(data || [])
        } catch (error) {
            console.error("Error fetching calendar events:", error)
            toast.error("Failed to load calendar events")
        } finally {
            setLoading(false)
        }
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

    const dates = []
    for (let i = 0; i < firstDay; i++) {
        dates.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
        dates.push(i)
    }

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Calendar Grid */}
            <Card className="lg:col-span-2 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </CardTitle>
                    <div className="flex gap-1">
                        <Button variant="outline" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 font-medium text-muted-foreground">
                        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {dates.map((date, i) => {
                            const isToday = date === new Date().getDate() && currentDate.getMonth() === new Date().getMonth()
                            const dateStr = date ? new Date(currentDate.getFullYear(), currentDate.getMonth(), date).toISOString().split('T')[0] : null
                            const hasEvent = dateStr && events.some(e => {
                                const eventDate = new Date(e.start).toISOString().split('T')[0]
                                return eventDate === dateStr
                            })

                            return (
                                <div
                                    key={i}
                                    className={`
                    h-14 rounded-lg flex flex-col items-center justify-center text-sm border transition-colors
                    ${!date ? 'border-transparent' : 'border-border bg-card/50 hover:bg-muted'}
                    ${isToday ? 'ring-2 ring-primary bg-primary/5' : ''}
                    ${hasEvent ? 'bg-secondary font-semibold' : ''}
                  `}
                                >
                                    {date}
                                    {hasEvent && <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1" />}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Agenda */}
            <Card className="shadow-md h-fit">
                <CardHeader>
                    <CardTitle className="text-lg">Upcoming Matters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">Loading events...</div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">No upcoming events</div>
                    ) : (
                        events.slice(0, 5).map((event) => {
                            const eventDate = new Date(event.start)
                            const priorityColor = event.priority === 'URGENT' || event.priority === 'HIGH' ? 'bg-red-500' :
                                event.priority === 'MEDIUM' ? 'bg-orange-500' : 'bg-green-500'
                            
                            return (
                                <div key={event.id} className="flex gap-3 items-start p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/50 transition-colors">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${priorityColor}`} />
                                    <div className="space-y-1 flex-1">
                                        <p className="font-medium text-sm leading-none">{event.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                {event.location}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <Button 
                        variant="outline" 
                        className="w-full text-xs"
                        onClick={() => window.location.href = '/calendar'}
                    >
                        View Full Schedule
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
