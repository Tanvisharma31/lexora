"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  Building2, 
  ExternalLink,
  Copy,
  RefreshCw,
  Eye
} from "lucide-react"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  address: string | null
  notes: string | null
  portalAccess: boolean
  portalToken: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export default function ClientsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: "",
    portalAccess: true,
  })

  useEffect(() => {
    if (user) {
      fetchClients()
    }
  }, [user])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/api/clients`, {
        headers: {
          "X-Clerk-User-Id": user?.id || "",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch clients")
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast.error("Failed to load clients")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`${BACKEND_URL}/api/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Clerk-User-Id": user?.id || "",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          company: formData.company || null,
          address: formData.address || null,
          notes: formData.notes || null,
          portalAccess: formData.portalAccess,
        }),
      })

      if (!response.ok) throw new Error("Failed to create client")

      toast.success("Client created successfully!")
      setIsCreateDialogOpen(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        notes: "",
        portalAccess: true,
      })
      fetchClients()
    } catch (error) {
      console.error("Error creating client:", error)
      toast.error("Failed to create client")
    }
  }

  const handleRegenerateToken = async (clientId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/clients/${clientId}/regenerate-token`, {
        method: "POST",
        headers: {
          "X-Clerk-User-Id": user?.id || "",
        },
      })

      if (!response.ok) throw new Error("Failed to regenerate token")

      toast.success("Portal token regenerated!")
      fetchClients()
    } catch (error) {
      console.error("Error regenerating token:", error)
      toast.error("Failed to regenerate token")
    }
  }

  const copyPortalLink = (token: string) => {
    const portalUrl = `${window.location.origin}/portal/${token}`
    navigator.clipboard.writeText(portalUrl)
    toast.success("Portal link copied to clipboard!")
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-muted-foreground">
            Manage your clients and their portal access
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Client</DialogTitle>
              <DialogDescription>
                Add a new client to your system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, city, state, pincode"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes about this client"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="portalAccess"
                  checked={formData.portalAccess}
                  onChange={(e) => setFormData({ ...formData, portalAccess: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="portalAccess" className="cursor-pointer">
                  Enable client portal access
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Client</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search clients by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portal Enabled</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.portalAccess).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "No clients match your search"
                : "Get started by adding your first client"
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    {client.company && (
                      <CardDescription className="flex items-center mt-1">
                        <Building2 className="w-3 h-3 mr-1" />
                        {client.company}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={client.status === "ACTIVE" ? "default" : "secondary"}>
                    {client.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    {client.email}
                  </div>
                  {client.phone && (
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      {client.phone}
                    </div>
                  )}
                </div>

                {client.portalAccess && client.portalToken && (
                  <div className="pt-3 border-t space-y-2">
                    <p className="text-xs text-muted-foreground">Client Portal</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => copyPortalLink(client.portalToken!)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRegenerateToken(client.id)}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/portal/${client.portalToken}`, "_blank")}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full mt-4"
                  variant="secondary"
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

