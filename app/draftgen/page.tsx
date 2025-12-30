"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { FileText, Download, Copy, Check, Plus, X, Folder } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

const TEMPLATES = {
  legal_notice: "Legal Notice",
  rent_agreement: "Rent Agreement",
  noc: "No Objection Certificate (NOC)",
  affidavit: "Affidavit",
  partnership_deed: "Partnership Deed",
  service_agreement: "Service Agreement",
  will: "Will/Testament",
  mou: "Memorandum of Understanding (MOU)",
  power_of_attorney: "Power of Attorney",
  freelance_contract: "Freelance Contract",
  employment_agreement: "Employment Agreement",
  ip_licensing: "IP Licensing Agreement",
  privacy_policy: "Privacy Policy",
  terms_conditions: "Terms & Conditions",
  sale_deed: "Sale Deed"
}

export default function DraftGenPage() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState("legal_notice")
  // Template-specific field suggestions
  const getFieldSuggestions = (template: string): Array<{ key: string; placeholder: string }> => {
    const suggestions: Record<string, Array<{ key: string; placeholder: string }>> = {
      legal_notice: [
        { key: "sender_name", placeholder: "Sender Name" },
        { key: "sender_address", placeholder: "Sender Address" },
        { key: "recipient_name", placeholder: "Recipient Name" },
        { key: "recipient_address", placeholder: "Recipient Address" },
        { key: "subject_matter", placeholder: "Subject Matter" },
        { key: "date", placeholder: "Date (DD/MM/YYYY)" }
      ],
      rent_agreement: [
        { key: "landlord_name", placeholder: "Landlord Name" },
        { key: "tenant_name", placeholder: "Tenant Name" },
        { key: "property_address", placeholder: "Property Address" },
        { key: "rent_amount", placeholder: "Monthly Rent (INR)" },
        { key: "security_deposit", placeholder: "Security Deposit (INR)" },
        { key: "lease_period", placeholder: "Lease Period (months)" },
        { key: "start_date", placeholder: "Start Date (DD/MM/YYYY)" }
      ],
      affidavit: [
        { key: "deponent_name", placeholder: "Deponent Name" },
        { key: "deponent_age", placeholder: "Age" },
        { key: "deponent_address", placeholder: "Address" },
        { key: "purpose", placeholder: "Purpose of Affidavit" },
        { key: "date", placeholder: "Date (DD/MM/YYYY)" }
      ],
      partnership_deed: [
        { key: "partnership_name", placeholder: "Partnership Firm Name" },
        { key: "partner1_name", placeholder: "Partner 1 Name" },
        { key: "partner2_name", placeholder: "Partner 2 Name" },
        { key: "business_nature", placeholder: "Nature of Business" },
        { key: "capital_contribution", placeholder: "Capital Contribution" },
        { key: "profit_sharing", placeholder: "Profit Sharing Ratio" },
        { key: "start_date", placeholder: "Start Date (DD/MM/YYYY)" }
      ]
    }
    return suggestions[template] || [
      { key: "party_name", placeholder: "Party Name" },
      { key: "date", placeholder: "Date (DD/MM/YYYY)" }
    ]
  }

  const [fields, setFields] = useState<Array<{ key: string; value: string }>>([
    { key: "party_name", value: "" },
    { key: "date", value: "" }
  ])
  const [generatedDocument, setGeneratedDocument] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const handleAddField = () => {
    setFields([...fields, { key: "", value: "" }])
  }

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleFieldChange = (index: number, key: string, value: string) => {
    const newFields = [...fields]
    newFields[index] = { key, value }
    setFields(newFields)
  }

  const handleGenerate = async () => {
    if (!isSignedIn) {
      toast.info("Please sign in to generate documents")
      router.push("/sign-in")
      return
    }

    const fieldsDict: Record<string, string> = {}
    fields.forEach(field => {
      if (field.key && field.value) {
        fieldsDict[field.key] = field.value
      }
    })

    if (Object.keys(fieldsDict).length === 0) {
      toast.error("Please add at least one field")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/draftgen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_type: selectedTemplate,
          fields: fieldsDict,
          jurisdiction: "India",
          include_citations: true
        })
      })

      if (!response.ok) {
        throw new Error("Document generation failed")
      }

      const data = await response.json()
      setGeneratedDocument(data.document)
      toast.success("Document generated successfully")
    } catch (error) {
      toast.error("Document generation failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const [cases, setCases] = useState<Array<{ id: string; title: string }>>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState("")

  useEffect(() => {
    if (isSignedIn) {
      fetchCases()
    }
  }, [isSignedIn])

  const fetchCases = async () => {
    try {
      const response = await fetch("/api/workspace/cases")
      if (response.ok) {
        const data = await response.json()
        setCases(data)
      }
    } catch (error) {
      console.error("Failed to fetch cases")
    }
  }

  const handleSaveToCase = async () => {
    if (!selectedCaseId) {
      toast.error("Please select a case")
      return
    }

    try {
      const response = await fetch(`/api/workspace/cases/${selectedCaseId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${TEMPLATES[selectedTemplate as keyof typeof TEMPLATES]} - Draft`,
          content: generatedDocument,
          file_type: "text/plain"
        })
      })

      if (response.ok) {
        toast.success("Saved to case successfully")
        setShowSaveModal(false)
      } else {
        toast.error("Failed to save to case")
      }
    } catch (error) {
      toast.error("Error saving to case")
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDocument)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([generatedDocument], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedTemplate}_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-300">
      <Navigation />

      <main className="flex-1 px-4 py-10 md:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              <span className="gradient-text-glow">DraftGen</span> - Legal Document Generator
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Generate professional legal documents from templates with AI assistance
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Panel - Template Selection & Fields */}
            <div className="space-y-6 animate-fade-in-up stagger-1">
              {/* Template Selection */}
              <div className="liquid rounded-2xl p-6 border border-border">
                <label className="text-sm font-semibold mb-3 block text-foreground">Select Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    setSelectedTemplate(e.target.value)
                    // Update fields based on template
                    const suggestions = getFieldSuggestions(e.target.value)
                    setFields(suggestions.map(s => ({ key: s.key, value: "" })))
                  }}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all"
                >
                  {Object.entries(TEMPLATES).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Fields */}
              <div className="liquid rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold text-foreground">Document Fields</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddField}
                    className="hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Field
                  </Button>
                </div>
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const suggestions = getFieldSuggestions(selectedTemplate)
                    const suggestion = suggestions.find(s => s.key === field.key)
                    return (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder={suggestion?.placeholder || "Field name (e.g., party_name)"}
                          value={field.key}
                          onChange={(e) => handleFieldChange(index, e.target.value, field.value)}
                          className="flex-1 rounded-lg border border-input bg-background/50 px-3 py-2 liquid-subtle text-foreground placeholder:text-muted-foreground"
                          list={`field-suggestions-${index}`}
                        />
                        <datalist id={`field-suggestions-${index}`}>
                          {suggestions.map((s, i) => (
                            <option key={i} value={s.key}>{s.placeholder}</option>
                          ))}
                        </datalist>
                        <input
                          type="text"
                          placeholder={suggestion?.placeholder || "Value"}
                          value={field.value}
                          onChange={(e) => handleFieldChange(index, field.key, e.target.value)}
                          className="flex-1 rounded-lg border border-input bg-background/50 px-3 py-2 liquid-subtle text-foreground placeholder:text-muted-foreground"
                        />
                        {fields.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveField(index)}
                            className="liquid-subtle"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading || fields.every(f => !f.key || !f.value)}
                className="w-full liquid-glow text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                <FileText className="mr-2 h-5 w-5" />
                {isLoading ? "Generating with AI..." : "Generate Document"}
              </Button>
              {fields.every(f => !f.key || !f.value) && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Please fill in at least one field to generate the document
                </p>
              )}
            </div>

            {/* Right Panel - Generated Document */}
            <div className="space-y-4">
              <div className="liquid rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium">Generated Document</label>
                  {generatedDocument && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="liquid-subtle"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                        className="liquid-subtle"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSaveModal(true)}
                        className="liquid-subtle"
                      >
                        <Folder className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <textarea
                  value={generatedDocument}
                  readOnly
                  placeholder="Generated document will appear here..."
                  className="w-full min-h-[500px] rounded-lg border border-input bg-background/50 px-4 py-3 liquid-subtle resize-none focus:outline-none font-mono text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save to Case Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="liquid rounded-2xl p-6 w-full max-w-md bg-background border border-primary/20 shadow-xl">
              <h2 className="text-xl font-semibold mb-4">Save to Case</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Select Case</label>
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    className="w-full rounded-lg border border-primary/20 bg-background/50 px-3 py-2 liquid-subtle"
                  >
                    <option value="">Select a case...</option>
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="ghost" onClick={() => setShowSaveModal(false)}>Cancel</Button>
                  <Button onClick={handleSaveToCase}>Save Document</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

