"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, AlertCircle } from "lucide-react"

// Mock Data
const EVENTS = [
    { id: 1, title: "Hearing: Sharma v/s State", type: "hearing", date: new Date(new Date().setDate(new Date().getDate() + 1)), location: "Supreme Court, Court No. 4", urgency: "high" },
    { id: 2, title: "Filing Deadline: TechCorp Merger", type: "deadline", date: new Date(new Date().setDate(new Date().getDate() + 3)), location: "NCLT Delhi", urgency: "medium" },
    { id: 3, title: "Client Meeting: Estate Planning", type: "meeting", date: new Date(new Date().setDate(new Date().getDate() + 5)), location: "Office Conf Room A", urgency: "low" },
    { id: 4, title: "Evidence Submission: Civil Suit 402", type: "submission", date: new Date(new Date().setDate(new Date().getDate() + 7)), location: "District Court Saket", urgency: "high" },
]

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date())

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
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
                            const hasEvent = date && EVENTS.some(e => e.date.getDate() === date && e.date.getMonth() === currentDate.getMonth())

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
                    {EVENTS.map((event) => (
                        <div key={event.id} className="flex gap-3 items-start p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/50 transition-colors">
                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${event.urgency === 'high' ? 'bg-red-500' :
                                    event.urgency === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                                }`} />
                            <div className="space-y-1">
                                <p className="font-medium text-sm leading-none">{event.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {event.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full text-xs">View Full Schedule</Button>
                </CardContent>
            </Card>
        </div>
    )
}
