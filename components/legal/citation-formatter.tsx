"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Copy, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface CitationFormatterProps {
  onCitationGenerated?: (citation: string) => void
  mode?: "generator" | "validator" | "both"
}

export function CitationFormatter({ 
  onCitationGenerated, 
  mode = "both" 
}: CitationFormatterProps) {
  const [citationStyle, setCitationStyle] = useState<"indian" | "bluebook">("indian")
  const [copied, setCopied] = useState(false)
  
  // Form states for generator
  const [caseName, setCaseName] = useState("")
  const [year, setYear] = useState("")
  const [volume, setVolume] = useState("")
  const [reporter, setReporter] = useState("")
  const [page, setPage] = useState("")
  const [court, setCourt] = useState("")
  
  // Generated citation
  const [generatedCitation, setGeneratedCitation] = useState("")
  
  // Validator states
  const [inputCitation, setInputCitation] = useState("")
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
    suggestions?: string[]
  } | null>(null)

  const generateCitation = () => {
    if (!caseName || !year) {
      toast.error("Case name and year are required")
      return
    }

    let citation = ""
    
    if (citationStyle === "indian") {
      // Indian citation format: Name of Case, (Year) Volume Reporter Page (Court)
      citation = `${caseName}, (${year})`
      if (volume && reporter && page) {
        citation += ` ${volume} ${reporter} ${page}`
      }
      if (court) {
        citation += ` (${court})`
      }
    } else {
      // Bluebook format: Name of Case, Volume Reporter Page (Court Year)
      citation = `${caseName}`
      if (volume && reporter && page) {
        citation += `, ${volume} ${reporter} ${page}`
      }
      if (court && year) {
        citation += ` (${court} ${year})`
      }
    }

    setGeneratedCitation(citation)
    if (onCitationGenerated) {
      onCitationGenerated(citation)
    }
    toast.success("Citation generated!")
  }

  const validateCitation = () => {
    if (!inputCitation.trim()) {
      toast.error("Please enter a citation to validate")
      return
    }

    // Basic validation logic
    const indianPattern = /^.+,\s*\(\d{4}\)\s+\d+\s+\w+\s+\d+/
    const bluebookPattern = /^.+,\s+\d+\s+\w+\s+\d+/
    
    const isIndianFormat = indianPattern.test(inputCitation)
    const isBluebookFormat = bluebookPattern.test(inputCitation)

    if (isIndianFormat || isBluebookFormat) {
      setValidationResult({
        isValid: true,
        message: `Valid ${isIndianFormat ? 'Indian' : 'Bluebook'} citation format`,
        suggestions: []
      })
      toast.success("Citation is valid!")
    } else {
      // Common mistakes
      const suggestions: string[] = []
      
      if (!inputCitation.includes(",")) {
        suggestions.push("Add comma after case name")
      }
      if (!/\(\d{4}\)/.test(inputCitation) && !/\d{4}/.test(inputCitation)) {
        suggestions.push("Include year in format (YYYY) or YYYY")
      }
      if (!/\d+\s+\w+\s+\d+/.test(inputCitation)) {
        suggestions.push("Include volume, reporter, and page number")
      }

      setValidationResult({
        isValid: false,
        message: "Invalid citation format",
        suggestions
      })
      toast.error("Citation format needs correction")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Copied to clipboard")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Citation Formatter
        </CardTitle>
      </CardHeader>

      <CardContent>
        {mode === "both" ? (
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generator">Generate Citation</TabsTrigger>
              <TabsTrigger value="validator">Validate Citation</TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-4">
              {/* Citation Style Selector */}
              <div className="flex gap-2">
                <Button
                  variant={citationStyle === "indian" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCitationStyle("indian")}
                >
                  Indian Format
                </Button>
                <Button
                  variant={citationStyle === "bluebook" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCitationStyle("bluebook")}
                >
                  Bluebook Format
                </Button>
              </div>

              {/* Generator Form */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="caseName">Case Name *</Label>
                  <Input
                    id="caseName"
                    placeholder="e.g., Kesavananda Bharati v. State of Kerala"
                    value={caseName}
                    onChange={(e) => setCaseName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      placeholder="1973"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="court">Court</Label>
                    <Input
                      id="court"
                      placeholder="SC / HC / Dist"
                      value={court}
                      onChange={(e) => setCourt(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume</Label>
                    <Input
                      id="volume"
                      placeholder="4"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reporter">Reporter</Label>
                    <Input
                      id="reporter"
                      placeholder="SCC"
                      value={reporter}
                      onChange={(e) => setReporter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="page">Page</Label>
                    <Input
                      id="page"
                      placeholder="225"
                      value={page}
                      onChange={(e) => setPage(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={generateCitation} className="w-full">
                  Generate Citation
                </Button>

                {/* Generated Citation Display */}
                {generatedCitation && (
                  <div className="space-y-2">
                    <Label>Generated Citation</Label>
                    <div className="flex gap-2">
                      <Input
                        value={generatedCitation}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(generatedCitation)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Format Examples */}
              <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Format Examples:</p>
                {citationStyle === "indian" ? (
                  <>
                    <p className="text-sm text-muted-foreground font-mono">
                      Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225 (SC)
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      Indian Penal Code, 1860, s. 302
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground font-mono">
                      Brown v. Board of Education, 347 U.S. 483 (1954)
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      Roe v. Wade, 410 U.S. 113 (1973)
                    </p>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="validator" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inputCitation">Enter Citation to Validate</Label>
                <Input
                  id="inputCitation"
                  placeholder="Paste your citation here..."
                  value={inputCitation}
                  onChange={(e) => setInputCitation(e.target.value)}
                  className="font-mono"
                />
              </div>

              <Button onClick={validateCitation} className="w-full">
                Validate Citation
              </Button>

              {/* Validation Result */}
              {validationResult && (
                <div className={`p-4 rounded-lg border ${
                  validationResult.isValid 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                    : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                }`}>
                  <div className="flex items-start gap-2">
                    {validationResult.isValid ? (
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {validationResult.message}
                      </p>
                      {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {validationResult.suggestions.map((suggestion, index) => (
                            <li key={index}>• {suggestion}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Common Mistakes */}
              <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Common Mistakes to Avoid:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Missing comma after case name</li>
                  <li>• Incorrect year format (should be in parentheses)</li>
                  <li>• Missing or incorrect reporter abbreviation</li>
                  <li>• Incorrect court abbreviation</li>
                  <li>• Missing page numbers</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        ) : mode === "generator" ? (
          <div>Generator Only Mode - Not yet implemented</div>
        ) : (
          <div>Validator Only Mode - Not yet implemented</div>
        )}
      </CardContent>
    </Card>
  )
}

