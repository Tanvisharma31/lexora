"use client"

import * as React from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

export interface FilterConfig {
  id: string
  label: string
  type: "text" | "select" | "number" | "date"
  options?: { label: string; value: string }[]
  placeholder?: string
}

interface AdvancedFiltersProps {
  filters: FilterConfig[]
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  onApply: () => void
  onReset: () => void
}

export function AdvancedFilters({
  filters,
  values,
  onChange,
  onApply,
  onReset,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const activeFiltersCount = Object.values(values).filter(v => v !== "" && v !== null && v !== undefined).length

  const handleFilterChange = (filterId: string, value: any) => {
    onChange({ ...values, [filterId]: value })
  }

  const handleClearFilter = (filterId: string) => {
    const newValues = { ...values }
    delete newValues[filterId]
    onChange(newValues)
  }

  const handleApply = () => {
    onApply()
    setIsOpen(false)
  }

  const handleReset = () => {
    onReset()
    setIsOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
            <SheetDescription>
              Refine your search with advanced filters
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={filter.id}>{filter.label}</Label>
                  {values[filter.id] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearFilter(filter.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {filter.type === "text" && (
                  <Input
                    id={filter.id}
                    placeholder={filter.placeholder}
                    value={values[filter.id] || ""}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  />
                )}
                {filter.type === "number" && (
                  <Input
                    id={filter.id}
                    type="number"
                    placeholder={filter.placeholder}
                    value={values[filter.id] || ""}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  />
                )}
                {filter.type === "select" && (
                  <Select
                    value={values[filter.id] || ""}
                    onValueChange={(value) => handleFilterChange(filter.id, value)}
                  >
                    <SelectTrigger id={filter.id}>
                      <SelectValue placeholder={filter.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      {filter.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {filter.type === "date" && (
                  <Input
                    id={filter.id}
                    type="date"
                    value={values[filter.id] || ""}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active filters badges */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(values).map(([key, value]) => {
          if (!value) return null
          const filter = filters.find(f => f.id === key)
          if (!filter) return null
          
          return (
            <Badge key={key} variant="secondary" className="gap-1">
              {filter.label}: {String(value)}
              <button
                onClick={() => handleClearFilter(key)}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )
        })}
      </div>
    </div>
  )
}

