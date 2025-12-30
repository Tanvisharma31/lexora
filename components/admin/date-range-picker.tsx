"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateRangePickerProps {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({
  date,
  setDate,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePresetSelect = (preset: string) => {
    const now = new Date()
    let from: Date | undefined
    let to: Date | undefined = now

    switch (preset) {
      case "today":
        from = now
        break
      case "yesterday":
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        to = from
        break
      case "last7":
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "last30":
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "last90":
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "thisMonth":
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "lastMonth":
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        to = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case "thisYear":
        from = new Date(now.getFullYear(), 0, 1)
        break
      case "all":
        from = undefined
        to = undefined
        break
    }

    setDate(from && to ? { from, to } : undefined)
    if (preset !== "custom") {
      setIsOpen(false)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <Select onValueChange={handlePresetSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7">Last 7 days</SelectItem>
                <SelectItem value="last30">Last 30 days</SelectItem>
                <SelectItem value="last90">Last 90 days</SelectItem>
                <SelectItem value="thisMonth">This month</SelectItem>
                <SelectItem value="lastMonth">Last month</SelectItem>
                <SelectItem value="thisYear">This year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

