"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  FileText, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  XCircle,
  Clock,
  TrendingUp,
  FileCheck
} from "lucide-react"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

interface Contract {
  id: string
  title: string
  contractType: string
  startDate: string
  endDate: string | null
  renewalDate: string | null
  autoRenew: boolean
  status: string
  value: number | null
  currency: string
  partyA: string | null
  partyB: string | null
  daysUntilExpiry: number | null
  isExpiring: boolean
  createdAt: string
}

interface ContractStats {
  totalContracts: number
  activeContracts: number
  expiringContracts: number
  expiredContracts: number
  totalValue: number
  contractsByType: Record<string, number>
  upcomingRenewals: number
}

export default function ContractsPage() {
  const { user } = useUser()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [stats, setStats] = useState<ContractStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    contractType: "SERVICE_AGREEMENT",
    startDate: "",
    endDate: "",
    renewalDate: "",
    autoRenew: false,
    value: "",
    partyA: "",
    partyB: "",
    alertDays: "30"
  })

  useEffect(() => {
    if (user) {
      fetchContracts()
      fetchStats()
    }
  }, [user, filter])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      let url = `${BACKEND_URL}/api/contracts?limit=100`
      
      if (filter === "active") url += "&status=ACTIVE"
      else if (filter === "expired") url += "&status=EXPIRED"
      else if (filter === "expiring") url = `${BACKEND_URL}/api/contracts/expiring?days=30`

      const response = await fetch(url, {
        headers: {
          "X-Clerk-User-Id": user?.id || "",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch contracts")
      const data = await response.json()
      setContracts(data)
    } catch (error) {
      console.error("Error fetching contracts:", error)
      toast.error("Failed to load contracts")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/contracts/stats`, {
        headers: {
          "X-Clerk-User-Id": user?.id || "",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`${BACKEND_URL}/api/contracts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Clerk-User-Id": user?.id || "",
        },
        body: JSON.stringify({
          title: formData.title,
          contractType: formData.contractType,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          renewalDate: formData.renewalDate || null,
          autoRenew: formData.autoRenew,
          value: formData.value ? parseFloat(formData.value) : null,
          partyA: formData.partyA || null,
          partyB: formData.partyB || null,
          alertDays: parseInt(formData.alertDays),
        }),
      })

      if (!response.ok) throw new Error("Failed to create contract")

      toast.success("Contract created successfully!")
      setIsCreateDialogOpen(false)
      setFormData({
        title: "",
        contractType: "SERVICE_AGREEMENT",
        startDate: "",
        endDate: "",
        renewalDate: "",
        autoRenew: false,
        value: "",
        partyA: "",
        partyB: "",
        alertDays: "30"
      })
      fetchContracts()
      fetchStats()
    } catch (error) {
      console.error("Error creating contract:", error)
      toast.error("Failed to create contract")
    }
  }

  const getStatusBadge = (contract: Contract) => {
    if (contract.status === "EXPIRED") {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>
    }
    if (contract.isExpiring) {
      return <Badge variant="outline" className="border-orange-500 text-orange-500"><AlertTriangle className="w-3 h-3 mr-1" />Expiring Soon</Badge>
    }
    if (contract.status === "ACTIVE") {
      return <Badge variant="default"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>
    }
    return <Badge variant="secondary">{contract.status}</Badge>
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return "N/A"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contract Management</h1>
          <p className="text-muted-foreground">
            Track and manage all your legal contracts
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
              <DialogDescription>
                Add a new contract to track its lifecycle and obligations
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateContract} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Contract Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Service Agreement with TechCorp"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractType">Contract Type *</Label>
                  <Select
                    value={formData.contractType}
                    onValueChange={(value) => setFormData({ ...formData, contractType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SERVICE_AGREEMENT">Service Agreement</SelectItem>
                      <SelectItem value="NDA">NDA</SelectItem>
                      <SelectItem value="EMPLOYMENT">Employment Contract</SelectItem>
                      <SelectItem value="LEASE">Lease Agreement</SelectItem>
                      <SelectItem value="PARTNERSHIP">Partnership Deed</SelectItem>
                      <SelectItem value="VENDOR">Vendor Agreement</SelectItem>
                      <SelectItem value="LICENSE">License Agreement</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Contract Value (₹)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="renewalDate">Renewal Date</Label>
                  <Input
                    id="renewalDate"
                    type="date"
                    value={formData.renewalDate}
                    onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alertDays">Alert Days Before Expiry</Label>
                  <Input
                    id="alertDays"
                    type="number"
                    value={formData.alertDays}
                    onChange={(e) => setFormData({ ...formData, alertDays: e.target.value })}
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partyA">Party A</Label>
                  <Input
                    id="partyA"
                    value={formData.partyA}
                    onChange={(e) => setFormData({ ...formData, partyA: e.target.value })}
                    placeholder="Your organization"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partyB">Party B</Label>
                  <Input
                    id="partyB"
                    value={formData.partyB}
                    onChange={(e) => setFormData({ ...formData, partyB: e.target.value })}
                    placeholder="Other party"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={formData.autoRenew}
                  onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="autoRenew" className="cursor-pointer">
                  Auto-renewing contract
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Contract</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContracts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeContracts} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.expiringContracts}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Across all contracts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingRenewals}</div>
              <p className="text-xs text-muted-foreground">
                Next 30 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contracts List */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All Contracts</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading contracts...</p>
            </div>
          ) : contracts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No contracts found</h3>
                <p className="text-muted-foreground mb-4">
                  {filter === "all" 
                    ? "Get started by creating your first contract"
                    : `No ${filter} contracts at the moment`
                  }
                </p>
                {filter === "all" && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Contract
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {contracts.map((contract) => (
                <Card key={contract.id} className={contract.isExpiring ? "border-orange-500" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{contract.title}</CardTitle>
                        <CardDescription>
                          {contract.contractType.replace(/_/g, " ")} • {contract.partyA || "N/A"} ↔ {contract.partyB || "N/A"}
                        </CardDescription>
                      </div>
                      {getStatusBadge(contract)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Start Date</p>
                        <p className="font-medium">{formatDate(contract.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">End Date</p>
                        <p className="font-medium">{formatDate(contract.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Value</p>
                        <p className="font-medium">{formatCurrency(contract.value)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Days Until Expiry</p>
                        <p className={`font-medium ${contract.isExpiring ? "text-orange-500" : ""}`}>
                          {contract.daysUntilExpiry !== null 
                            ? `${contract.daysUntilExpiry} days`
                            : "N/A"
                          }
                        </p>
                      </div>
                    </div>
                    {contract.autoRenew && (
                      <div className="mt-4 flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        Auto-renewing contract
                        {contract.renewalDate && ` • Renewal: ${formatDate(contract.renewalDate)}`}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

