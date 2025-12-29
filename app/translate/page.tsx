"use client"

import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Languages, ArrowLeftRight, Copy, Check, Upload, FileText, X, ChevronLeft, ChevronRight, Eye, Loader2, Download } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { jsPDF } from "jspdf"

const SUPPORTED_LANGUAGES = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  ta: "Tamil",
  bn: "Bengali",
  gu: "Gujarati",
  te: "Telugu",
  ml: "Malayalam"
}

export default function TranslatePage() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [sourceLang, setSourceLang] = useState("en")
  const [targetLang, setTargetLang] = useState("hi")
  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // PDF translation states
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfPages, setPdfPages] = useState<Array<{ page_number: number; original_text: string; translated_text: string }>>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isTranslatingPdf, setIsTranslatingPdf] = useState(false)
  const [pdfTranslationMode, setPdfTranslationMode] = useState(false)
  const [pdfFileData, setPdfFileData] = useState<string | null>(null)
  const [translatedPdfUrl, setTranslatedPdfUrl] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on client side before using browser APIs
  useEffect(() => {
    setIsClient(true)
  }, [])




  const swapLanguages = () => {
    const temp = sourceLang
    setSourceLang(targetLang)
    setTargetLang(temp)
    const tempText = sourceText
    setSourceText(translatedText)
    setTranslatedText(tempText)
  }

  const handlePdfUpload = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file")
      return
    }
    setPdfFile(file)
    setPdfTranslationMode(true)
    setPdfPages([])
    setPdfFileData(null)
    setTranslatedPdfUrl(null)
    setCurrentPage(1)
  }

  const handleTranslatePdf = async () => {
    if (!isSignedIn) {
      toast.info("Please sign in to translate PDFs")
      router.push("/sign-in")
      return
    }

    if (!pdfFile) {
      toast.error("Please upload a PDF file")
      return
    }

    setIsTranslatingPdf(true)

    try {
      const formData = new FormData()
      formData.append("file", pdfFile)
      formData.append("source_lang", sourceLang)
      formData.append("target_lang", targetLang)
      formData.append("preserve_legal_terms", "true")

      const response = await fetch("/api/translate-pdf", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("PDF translation failed")
      }

      const data = await response.json()
      setPdfPages(data.pages || [])
      setPdfFileData(data.file_data || null)

      if (data.file_data) {
        const byteCharacters = atob(data.file_data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        setTranslatedPdfUrl(url)
      }

      setCurrentPage(1)
      toast.success(`PDF translated successfully! ${data.total_pages} pages processed.`)
    } catch (error) {
      console.error("Translation error:", error)
      toast.error("PDF translation failed. Please try again.")
    } finally {
      setIsTranslatingPdf(false)
    }
  }

  const handleDownloadPdf = () => {
    try {
      if (pdfFileData) {
        // Download the DeepL generated PDF
        const byteCharacters = atob(pdfFileData)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "translated_document.pdf"
        link.click()
        toast.success("Original translated PDF downloaded")
      } else {
        // Fallback to generating PDF from text
        const doc = new jsPDF()

        pdfPages.forEach((page, index) => {
          if (index > 0) doc.addPage()

          doc.setFontSize(10)
          doc.text(`Page ${page.page_number} - Translated`, 10, 10)

          doc.setFontSize(12)
          const splitText = doc.splitTextToSize(page.translated_text, 180)
          doc.text(splitText, 10, 20)
        })

        doc.save("translated_document.pdf")
        toast.success("Generated PDF downloaded")
      }
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Failed to generate PDF")
    }
  }

  const handleDownloadText = () => {
    try {
      const textContent = pdfPages.map(p => `--- Page ${p.page_number} ---\n\n${p.translated_text}`).join("\n\n")
      const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "translated_document.txt"
      link.click()
      toast.success("Text file downloaded successfully")
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Failed to download text")
    }
  }

  const clearPdf = () => {
    setPdfFile(null)
    setPdfPages([])
    setPdfFileData(null)
    setTranslatedPdfUrl(null)
    setPdfTranslationMode(false)
    setCurrentPage(1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navigation />

      <main className="flex-1 px-4 py-10 md:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              <span className="gradient-text-glow">Multilingual Legal Translation</span>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Translate legal documents and PDFs between Indian languages with context preservation
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="mb-8 flex gap-4 animate-fade-in-up stagger-1">
            <Button
              variant={pdfTranslationMode ? "default" : "ghost"}
              onClick={() => setPdfTranslationMode(true)}
              className={pdfTranslationMode ? "hover:scale-105 active:scale-95 shadow-lg" : "hover:bg-white/10"}
            >
              <Upload className="h-4 w-4" />
              PDF Translation
            </Button>
          </div>

          {/* Language Selectors */}
          <div className="mb-8 flex flex-col sm:flex-row items-end justify-center gap-5 animate-fade-in-up stagger-2">
            <div className="flex-1 w-full">
              <label className="text-sm font-semibold mb-2 block text-white/90">Source Language</label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all backdrop-blur-sm"
              >
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <Button
              variant="ghost"
              onClick={swapLanguages}
              className="liquid-subtle hover:scale-110 active:scale-95 h-12 w-12"
              size="icon"
            >
              <ArrowLeftRight className="h-5 w-5" />
            </Button>

            <div className="flex-1 w-full">
              <label className="text-sm font-semibold mb-2 block text-white/90">Target Language</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all backdrop-blur-sm"
              >
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* PDF Translation Mode */}
          {pdfTranslationMode ? (
            <div className="space-y-6">
              {/* PDF Upload */}
              {!pdfFile ? (
                <div className="liquid rounded-2xl p-12 border-2 border-dashed border-white/20 hover:border-white/30 transition-all animate-fade-in-up stagger-3">
                  <div className="text-center">
                    <Upload className="mx-auto h-16 w-16 text-white/40 mb-6" />
                    <p className="text-lg text-white/80 mb-4 font-semibold">
                      Upload a PDF file to translate
                    </p>
                    <p className="text-sm text-white/50 mb-6">
                      Supports PDF files up to 10MB
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handlePdfUpload(e.target.files[0])
                        }
                      }}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload">
                      <Button variant="outline" className="hover:scale-105 active:scale-95 shadow-lg" asChild>
                        <span>Select PDF File</span>
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  {/* PDF Info */}
                  <div className="liquid rounded-2xl p-6 flex items-center justify-between border border-white/20">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-white" />
                      <div>
                        <p className="font-semibold text-white">{pdfFile.name}</p>
                        <p className="text-sm text-white/60">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearPdf}
                      className="liquid-subtle"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>



                  {/* Translate PDF Button */}
                  {!translatedPdfUrl && (
                    <Button
                      onClick={handleTranslatePdf}
                      disabled={isTranslatingPdf}
                      className="w-full liquid-glow"
                      size="lg"
                    >
                      {isTranslatingPdf ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Translating PDF...
                        </>
                      ) : (
                        <>
                          <Languages className="mr-2 h-5 w-5" />
                          Translate PDF
                        </>
                      )}
                    </Button>
                  )}

                  {/* PDF Preview Side-by-Side */}
                  {(pdfFile || translatedPdfUrl) && (
                    <div className="space-y-4">
                      <div className="liquid rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <h3 className="font-medium">Document Preview</h3>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownloadPdf}
                            disabled={!translatedPdfUrl}
                            className="liquid-subtle"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download Translated PDF
                          </Button>
                        </div>
                      </div>

                      {/* Side-by-Side View */}
                      <div className="grid gap-6 md:grid-cols-2 h-[600px]">
                        {/* Original PDF */}
                        <div className="space-y-2 h-full flex flex-col">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              {SUPPORTED_LANGUAGES[sourceLang as keyof typeof SUPPORTED_LANGUAGES]} (Original)
                            </label>
                          </div>
                          <div className="liquid rounded-lg overflow-hidden h-full border border-primary/20">
                            {pdfFile && (
                              <iframe
                                src={URL.createObjectURL(pdfFile)}
                                className="w-full h-full"
                                title="Original PDF"
                              />
                            )}
                          </div>
                        </div>

                        {/* Translated PDF */}
                        <div className="space-y-2 h-full flex flex-col">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              {SUPPORTED_LANGUAGES[targetLang as keyof typeof SUPPORTED_LANGUAGES]} (Translated)
                            </label>
                          </div>
                          <div className="liquid rounded-lg overflow-hidden h-full border border-primary/20 bg-muted/20 flex items-center justify-center">
                            {translatedPdfUrl ? (
                              <iframe
                                src={translatedPdfUrl}
                                className="w-full h-full"
                                title="Translated PDF"
                              />
                            ) : (
                              <div className="text-center text-muted-foreground p-4">
                                {isTranslatingPdf ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p>Translating document...</p>
                                  </div>
                                ) : (
                                  <p>Translation will appear here</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Source Text */}
              <div className="space-y-4">
                <div className="liquid rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">
                      {SUPPORTED_LANGUAGES[sourceLang as keyof typeof SUPPORTED_LANGUAGES]}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSourceText("")
                        setTranslatedText("")
                      }}
                      className="liquid-subtle"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Enter legal text to translate..."
                    className="w-full min-h-[300px] rounded-lg border border-primary/20 bg-background/50 px-4 py-3 liquid-subtle resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Translated Text */}
              <div className="space-y-4">
                <div className="liquid rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">
                      {SUPPORTED_LANGUAGES[targetLang as keyof typeof SUPPORTED_LANGUAGES]}
                    </label>
                    {translatedText && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(translatedText)
                          setCopied(true)
                          toast.success("Copied to clipboard")
                          setTimeout(() => setCopied(false), 2000)
                        }}
                        className="liquid-subtle"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <div className="w-full min-h-[300px] rounded-lg border border-primary/20 bg-background/50 px-4 py-3 liquid-subtle whitespace-pre-wrap">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Translating...
                      </div>
                    ) : translatedText ? (
                      translatedText
                    ) : (
                      <span className="text-muted-foreground">Translation will appear here...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="lg:col-span-2 flex justify-center">
                <Button
                  onClick={async () => {
                    if (!sourceText.trim()) return
                    setIsLoading(true)
                    try {
                      const response = await fetch("/api/translate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          text: sourceText,
                          source_lang: sourceLang,
                          target_lang: targetLang
                        })
                      })
                      const data = await response.json()
                      setTranslatedText(data.translated)
                    } catch (error) {
                      toast.error("Translation failed")
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  disabled={isLoading || !sourceText.trim()}
                  className="w-full md:w-auto min-w-[200px] liquid-glow"
                  size="lg"
                >
                  <Languages className="mr-2 h-5 w-5" />
                  Translate Text
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

