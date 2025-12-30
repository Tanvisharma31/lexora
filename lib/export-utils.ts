/**
 * Export Utilities for PDF, CSV, and Excel generation
 * Handles data export for reports, time entries, invoices, etc.
 */

import jsPDF from "jspdf"
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow } from "docx"

// ==================== CSV EXPORT ====================

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    throw new Error("No data to export")
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(","), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape commas and quotes
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ""
      }).join(",")
    )
  ].join("\n")

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ==================== JSON EXPORT ====================

export function exportToJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: "application/json" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.json`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ==================== PDF EXPORT ====================

export interface PDFInvoiceData {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  startDate: string
  endDate: string
  entries: Array<{
    date: string
    description: string
    hours: number
    rate: number
    amount: number
  }>
  totalHours: number
  totalAmount: number
  lawyerName: string
  lawyerEmail: string
  firmName?: string
}

export function generateInvoicePDF(data: PDFInvoiceData) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("INVOICE", 105, 20, { align: "center" })
  
  // Firm/Lawyer Info
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(data.firmName || data.lawyerName, 20, 40)
  doc.text(data.lawyerEmail, 20, 45)
  
  // Invoice Details
  doc.setFont("helvetica", "bold")
  doc.text("Invoice #:", 140, 40)
  doc.setFont("helvetica", "normal")
  doc.text(data.invoiceNumber, 170, 40)
  
  doc.setFont("helvetica", "bold")
  doc.text("Date:", 140, 45)
  doc.setFont("helvetica", "normal")
  doc.text(new Date().toLocaleDateString(), 170, 45)
  
  // Client Info
  doc.setFont("helvetica", "bold")
  doc.text("Bill To:", 20, 60)
  doc.setFont("helvetica", "normal")
  doc.text(data.clientName, 20, 65)
  doc.text(data.clientEmail, 20, 70)
  
  // Period
  doc.setFont("helvetica", "bold")
  doc.text("Period:", 20, 80)
  doc.setFont("helvetica", "normal")
  doc.text(`${data.startDate} - ${data.endDate}`, 40, 80)
  
  // Table Header
  const tableTop = 95
  doc.setFillColor(240, 240, 240)
  doc.rect(20, tableTop, 170, 8, "F")
  
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text("Date", 22, tableTop + 5)
  doc.text("Description", 50, tableTop + 5)
  doc.text("Hours", 130, tableTop + 5)
  doc.text("Rate", 150, tableTop + 5)
  doc.text("Amount", 170, tableTop + 5)
  
  // Table Rows
  doc.setFont("helvetica", "normal")
  let yPos = tableTop + 13
  
  data.entries.forEach((entry, index) => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }
    
    doc.text(entry.date, 22, yPos)
    doc.text(entry.description.substring(0, 40), 50, yPos)
    doc.text(entry.hours.toFixed(2), 130, yPos)
    doc.text(`₹${entry.rate.toFixed(0)}`, 150, yPos)
    doc.text(`₹${entry.amount.toFixed(0)}`, 170, yPos)
    
    yPos += 7
  })
  
  // Total
  yPos += 5
  doc.setDrawColor(200, 200, 200)
  doc.line(20, yPos, 190, yPos)
  yPos += 8
  
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Total Hours:", 130, yPos)
  doc.text(data.totalHours.toFixed(2), 165, yPos, { align: "right" })
  
  yPos += 7
  doc.setFontSize(12)
  doc.text("Total Amount:", 130, yPos)
  doc.text(`₹${data.totalAmount.toFixed(0)}`, 185, yPos, { align: "right" })
  
  // Footer
  doc.setFontSize(8)
  doc.setFont("helvetica", "italic")
  doc.text("Thank you for your business!", 105, 280, { align: "center" })
  doc.text("Payment due within 30 days", 105, 285, { align: "center" })
  
  // Save
  doc.save(`invoice-${data.invoiceNumber}.pdf`)
}

export interface PDFReportData {
  title: string
  subtitle?: string
  sections: Array<{
    heading: string
    content: string | string[]
    table?: {
      headers: string[]
      rows: string[][]
    }
  }>
  footer?: string
}

export function generateReportPDF(data: PDFReportData) {
  const doc = new jsPDF()
  let yPos = 20
  
  // Title
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(data.title, 105, yPos, { align: "center" })
  yPos += 10
  
  // Subtitle
  if (data.subtitle) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "italic")
    doc.text(data.subtitle, 105, yPos, { align: "center" })
    yPos += 15
  } else {
    yPos += 10
  }
  
  // Sections
  doc.setFontSize(10)
  data.sections.forEach(section => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }
    
    // Section heading
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text(section.heading, 20, yPos)
    yPos += 8
    
    // Section content
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    
    if (typeof section.content === "string") {
      const lines = doc.splitTextToSize(section.content, 170)
      lines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.text(line, 20, yPos)
        yPos += 6
      })
    } else {
      section.content.forEach(line => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.text(`• ${line}`, 25, yPos)
        yPos += 6
      })
    }
    
    // Table
    if (section.table) {
      yPos += 5
      
      // Table header
      doc.setFillColor(240, 240, 240)
      const colWidth = 170 / section.table.headers.length
      section.table.headers.forEach((header, i) => {
        doc.rect(20 + i * colWidth, yPos, colWidth, 8, "F")
        doc.setFont("helvetica", "bold")
        doc.text(header, 22 + i * colWidth, yPos + 5)
      })
      yPos += 10
      
      // Table rows
      doc.setFont("helvetica", "normal")
      section.table.rows.forEach(row => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        row.forEach((cell, i) => {
          doc.text(cell, 22 + i * colWidth, yPos)
        })
        yPos += 7
      })
    }
    
    yPos += 10
  })
  
  // Footer
  if (data.footer) {
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text(data.footer, 105, 285, { align: "center" })
  }
  
  // Save
  const filename = data.title.toLowerCase().replace(/\s+/g, "-")
  doc.save(`${filename}.pdf`)
}

// ==================== WORD EXPORT ====================

export async function exportToWord(data: PDFReportData, filename: string) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          text: data.title,
          heading: "Heading1",
          alignment: "center",
        }),
        
        // Subtitle
        ...(data.subtitle ? [new Paragraph({
          text: data.subtitle,
          alignment: "center",
          spacing: { after: 400 },
        })] : []),
        
        // Sections
        ...data.sections.flatMap(section => [
          new Paragraph({
            text: section.heading,
            heading: "Heading2",
            spacing: { before: 400, after: 200 },
          }),
          
          ...(typeof section.content === "string" 
            ? [new Paragraph({ text: section.content })]
            : section.content.map(line => new Paragraph({
                text: line,
                bullet: { level: 0 },
              }))
          ),
          
          ...(section.table ? [
            new Table({
              rows: [
                new TableRow({
                  children: section.table.headers.map(header => 
                    new TableCell({
                      children: [new Paragraph({ text: header })],
                    })
                  ),
                }),
                ...section.table.rows.map(row => 
                  new TableRow({
                    children: row.map(cell => 
                      new TableCell({
                        children: [new Paragraph({ text: cell })],
                      })
                    ),
                  })
                ),
              ],
            })
          ] : []),
        ]),
        
        // Footer
        ...(data.footer ? [new Paragraph({
          text: data.footer,
          alignment: "center",
          spacing: { before: 800 },
        })] : []),
      ],
    }],
  })
  
  const blob = await Packer.toBlob(doc)
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.docx`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ==================== HELPER FUNCTIONS ====================

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

