"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

const DOCUMENT_TYPES = [
  { value: "petition", label: "Petition" },
  { value: "contract", label: "Contract" },
  { value: "notice", label: "Legal Notice" },
  { value: "appeal", label: "Appeal" },
  { value: "affidavit", label: "Affidavit" }
]

export function DraftWizard() {
  const [step, setStep] = useState(1)
  const [documentType, setDocumentType] = useState("")
  const [parties, setParties] = useState({ petitioner: "", respondent: "" })
  const [facts, setFacts] = useState("")
  const [legalGrounds, setLegalGrounds] = useState("")
  const [prayer, setPrayer] = useState("")
  const [generatedDraft, setGeneratedDraft] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generateDraft = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lawyer/draft-assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_type: documentType,
          parties,
          facts,
          legal_grounds: legalGrounds,
          prayer
        }),
        credentials: "include"
      })

      if (!response.ok) throw new Error("Failed to generate draft")

      const data = await response.json()
      setGeneratedDraft(data)
      setStep(4)
      toast.success("Draft generated successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate draft")
    } finally {
      setLoading(false)
    }
  }

  const downloadDraft = () => {
    if (!generatedDraft) return
    const blob = new Blob([generatedDraft.draft], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${documentType}-${Date.now()}.txt`
    a.click()
    toast.success("Draft downloaded")
  }

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {step > s ? <CheckCircle className="h-5 w-5" /> : s}
            </div>
            {s < 4 && <div className={`w-20 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Document Type */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Document Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {DOCUMENT_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={documentType === type.value ? "default" : "outline"}
                  className="h-20"
                  onClick={() => setDocumentType(type.value)}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  {type.label}
                </Button>
              ))}
            </div>
            <Button 
              onClick={() => setStep(2)} 
              disabled={!documentType}
              className="w-full"
            >
              Next: Enter Parties
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Parties */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Enter Party Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Petitioner / Party A</Label>
              <Input
                value={parties.petitioner}
                onChange={(e) => setParties({ ...parties, petitioner: e.target.value })}
                placeholder="Enter petitioner name"
              />
            </div>
            <div className="space-y-2">
              <Label>Respondent / Party B</Label>
              <Input
                value={parties.respondent}
                onChange={(e) => setParties({ ...parties, respondent: e.target.value })}
                placeholder="Enter respondent name"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Next: Enter Facts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Facts and Legal Grounds */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Enter Facts & Legal Grounds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Facts of the Case</Label>
              <Textarea
                value={facts}
                onChange={(e) => setFacts(e.target.value)}
                placeholder="Describe the facts of the case..."
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Legal Grounds (Optional)</Label>
              <Textarea
                value={legalGrounds}
                onChange={(e) => setLegalGrounds(e.target.value)}
                placeholder="Enter legal grounds, relevant sections, articles..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Prayer / Relief Sought (Optional)</Label>
              <Textarea
                value={prayer}
                onChange={(e) => setPrayer(e.target.value)}
                placeholder="What relief is being sought..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={generateDraft} disabled={!facts || loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Draft"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Generated Draft */}
      {step === 4 && generatedDraft && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Draft</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadDraft}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                  New Draft
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="draft">
              <TabsList>
                <TabsTrigger value="draft">Draft Document</TabsTrigger>
                <TabsTrigger value="precedents">Suggested Precedents</TabsTrigger>
                <TabsTrigger value="arguments">Legal Arguments</TabsTrigger>
              </TabsList>

              <TabsContent value="draft">
                <div className="bg-muted p-6 rounded-lg">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {generatedDraft.draft}
                  </pre>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Word Count: {generatedDraft.word_count || 0}
                </p>
              </TabsContent>

              <TabsContent value="precedents">
                <div className="space-y-2">
                  {generatedDraft.suggested_precedents?.map((precedent: string, index: number) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{precedent}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="arguments">
                <div className="space-y-2">
                  {generatedDraft.legal_arguments?.map((argument: string, index: number) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{argument}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

