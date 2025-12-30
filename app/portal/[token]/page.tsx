"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  MessageSquare,
  Download,
  Eye,
  Lock,
  Shield
} from "lucide-react"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

interface PortalData {
  client: {
    id: string
    name: string
    email: string
    company: string | null
  }
  cases: Array<{
    id: string
    title: string
    description: string | null
    status: string
    createdAt: string
  }>
  documents: Array<{
    id: string
    title: string
    fileType: string | null
    fileUrl: string | null
    createdAt: string
  }>
  invoices: Array<{
    id: string
    startDate: string
    endDate: string
    totalHours: number
    totalAmount: number
    status: string
    createdAt: string
  }>
  messages: Array<{
    id: string
    subject: string
    preview: string | null
    read: boolean
    createdAt: string
  }>
}

export default function ClientPortalPage() {
  const params = useParams()
  const token = params.token as string
  const [portalData, setPortalData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      fetchPortalData()
    }
  }, [token])

  const fetchPortalData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${BACKEND_URL}/api/clients/portal/${token}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Invalid portal link. Please contact your lawyer.")
        }
        throw new Error("Failed to load portal data")
      }

      const data = await response.json()
      setPortalData(data)
    } catch (error: any) {
      console.error("Error fetching portal data:", error)
      setError(error.message)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    )
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground mb-4">
              {error || "Unable to load portal data"}
            </p>
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact your lawyer.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Client Portal</h1>
              <p className="text-muted-foreground">Welcome, {portalData.client.name}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure Portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {portalData.cases.filter(c => c.status === "OPEN").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portalData.documents.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoices</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portalData.invoices.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {portalData.messages.filter(m => !m.read).length}
              </div>
              <p className="text-xs text-muted-foreground">Unread</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cases" className="space-y-4">
          <TabsList className="bg-white">
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Cases Tab */}
          <TabsContent value="cases" className="space-y-4">
            {portalData.cases.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No cases assigned yet</p>
                </CardContent>
              </Card>
            ) : (
              portalData.cases.map((case_) => (
                <Card key={case_.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{case_.title}</CardTitle>
                        {case_.description && (
                          <CardDescription className="mt-2">{case_.description}</CardDescription>
                        )}
                      </div>
                      <Badge variant={case_.status === "OPEN" ? "default" : "secondary"}>
                        {case_.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Created: {formatDate(case_.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {portalData.documents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No documents available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portalData.documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{doc.title}</CardTitle>
                      <CardDescription>
                        {doc.fileType?.toUpperCase() || "Document"} • {formatDate(doc.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {doc.fileUrl && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => window.open(doc.fileUrl!, "_blank")}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                const a = document.createElement("a")
                                a.href = doc.fileUrl!
                                a.download = doc.title
                                a.click()
                              }}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            {portalData.invoices.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No invoices yet</p>
                </CardContent>
              </Card>
            ) : (
              portalData.invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Invoice #{invoice.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription>
                          {formatDate(invoice.startDate)} - {formatDate(invoice.endDate)}
                        </CardDescription>
                      </div>
                      <Badge variant={invoice.status === "PAID" ? "default" : "secondary"}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Hours</p>
                        <p className="font-medium">{invoice.totalHours} hours</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium text-lg">{formatCurrency(invoice.totalAmount)}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="mt-4">
                      <Download className="w-3 h-3 mr-1" />
                      Download Invoice
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            {portalData.messages.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No messages</p>
                </CardContent>
              </Card>
            ) : (
              portalData.messages.map((message) => (
                <Card key={message.id} className={!message.read ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base">{message.subject}</CardTitle>
                        {message.preview && (
                          <CardDescription className="mt-2">{message.preview}</CardDescription>
                        )}
                      </div>
                      {!message.read && (
                        <Badge variant="default">New</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(message.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t bg-white mt-12">
        <div className="container mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
          <p>This is a secure client portal. Do not share your portal link with others.</p>
          <p className="mt-2">© 2024 Lexora. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

