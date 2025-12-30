"use client"

import * as React from "react"
import { useState } from "react"
import { Users, Shield, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  active: boolean
}

interface BulkOperationsProps {
  users: User[]
  selectedUserIds: string[]
  onOperationComplete: () => void
}

export function BulkOperations({ users, selectedUserIds, onOperationComplete }: BulkOperationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [operation, setOperation] = useState<"role" | "status" | "">("")
  const [newRole, setNewRole] = useState("")
  const [newStatus, setNewStatus] = useState<"active" | "inactive" | "">("")
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedUsers = users.filter(u => selectedUserIds.includes(u.id))

  const handleBulkOperation = async () => {
    if (!operation) {
      toast.error("Please select an operation")
      return
    }

    if (operation === "role" && !newRole) {
      toast.error("Please select a new role")
      return
    }

    if (operation === "status" && !newStatus) {
      toast.error("Please select a status")
      return
    }

    setIsProcessing(true)

    try {
      const updates = operation === "role" 
        ? { role: newRole }
        : { active: newStatus === "active" }

      const response = await fetch("/api/admin/users/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: selectedUserIds,
          updates,
        }),
      })

      if (!response.ok) throw new Error("Bulk operation failed")

      const result = await response.json()
      toast.success(`Successfully updated ${result.updated} users`)
      setIsOpen(false)
      onOperationComplete()
    } catch (error) {
      toast.error("Failed to perform bulk operation")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={selectedUserIds.length === 0}
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Bulk Actions ({selectedUserIds.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk User Operations</DialogTitle>
          <DialogDescription>
            Apply changes to {selectedUserIds.length} selected user{selectedUserIds.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Operation Type Selection */}
          <div className="space-y-2">
            <Label>Operation Type</Label>
            <Select value={operation} onValueChange={(value: any) => setOperation(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="role">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Change Role
                  </div>
                </SelectItem>
                <SelectItem value="status">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Change Status
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role Selection (if operation is role) */}
          {operation === "role" && (
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="JUDGE">Judge</SelectItem>
                  <SelectItem value="LAWYER">Lawyer</SelectItem>
                  <SelectItem value="ASSOCIATE">Associate</SelectItem>
                  <SelectItem value="IN_HOUSE_COUNSEL">In-House Counsel</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="COMPLIANCE_OFFICER">Compliance Officer</SelectItem>
                  <SelectItem value="CLERK">Clerk</SelectItem>
                  <SelectItem value="READ_ONLY_AUDITOR">Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status Selection (if operation is status) */}
          {operation === "status" && (
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Selected Users Preview */}
          <div className="space-y-2">
            <Label>Selected Users</Label>
            <ScrollArea className="h-48 rounded-md border p-4">
              <div className="space-y-2">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{user.role}</Badge>
                      <Badge variant={user.active ? "default" : "secondary"}>
                        {user.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleBulkOperation} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Apply Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

