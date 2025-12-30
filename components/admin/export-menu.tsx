"use client"

import * as React from "react"
import { Download, FileText, FileSpreadsheet, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface ExportMenuProps {
  reportType: string
  dateRange?: { from: Date; to: Date }
  filters?: Record<string, any>
}

export function ExportMenu({ reportType, dateRange, filters }: ExportMenuProps) {
  const exportReport = async (format: "json" | "csv" | "pdf") => {
    try {
      // Build query params
      const params = new URLSearchParams({
        report_type: reportType,
        format: format,
      })

      if (dateRange) {
        params.append("from_date", dateRange.from.toISOString())
        params.append("to_date", dateRange.to.toISOString())
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value))
        })
      }

      const response = await fetch(`/api/admin/reports/export?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error("Failed to export report")
      }

      const data = await response.json()

      // Handle different formats
      if (format === "json") {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        downloadBlob(blob, `${reportType}-${new Date().toISOString().split('T')[0]}.json`)
      } else if (format === "csv") {
        const blob = new Blob([data.csv || convertToCSV(data.data)], { type: 'text/csv' })
        downloadBlob(blob, `${reportType}-${new Date().toISOString().split('T')[0]}.csv`)
      } else if (format === "pdf") {
        // For PDF, we'd need to generate it on the server or client-side
        toast.info("PDF export coming soon")
      }

      toast.success(`Report exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export report")
    }
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return ""
    
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value).replace(/"/g, '""')
          return escaped.includes(',') ? `"${escaped}"` : escaped
        }).join(',')
      )
    ]
    
    return csvRows.join('\n')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => exportReport("json")}>
          <FileJson className="h-4 w-4 mr-2" />
          JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportReport("csv")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportReport("pdf")} disabled>
          <FileText className="h-4 w-4 mr-2" />
          PDF (Coming Soon)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

