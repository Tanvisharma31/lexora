"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Briefcase, GraduationCap, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { UserRole } from "@/lib/models"
import { getRoleDisplayName, getRoleDescription } from "@/lib/rbac-matrix"
import { Building2, UserCheck, ShieldCheck } from "lucide-react"

const roles = [
  {
    id: UserRole.JUDGE,
    name: "Judge",
    description: "Access judgements, issue orders, and review cases",
    icon: Scale,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
  },
  {
    id: UserRole.LAWYER,
    name: "Lawyer / Counsel",
    description: "Full access to documents, cases, contracts, and drafting tools",
    icon: Briefcase,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
  },
  {
    id: UserRole.ASSOCIATE,
    name: "Associate",
    description: "Junior lawyer with guided access and approval-based workflows",
    icon: UserCheck,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10 hover:bg-cyan-500/20",
  },
  {
    id: UserRole.IN_HOUSE_COUNSEL,
    name: "In-House Counsel",
    description: "Company legal with contract review and compliance management",
    icon: Building2,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
  },
  {
    id: UserRole.STUDENT,
    name: "Law Student",
    description: "Access to search, moot court simulator, and learning resources",
    icon: GraduationCap,
    color: "text-green-400",
    bgColor: "bg-green-500/10 hover:bg-green-500/20",
  },
]

export default function RoleSelectionPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Check if user already has role selected
  useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await fetch("/api/user/check-role")
        if (response.ok) {
          const data = await response.json()
          // If user doesn't need role selection, redirect to home
          if (!data.needsSelection) {
            router.push("/")
            return
          }
        }
      } catch (error) {
        console.error("Error checking role:", error)
      } finally {
        setChecking(false)
      }
    }
    checkRole()
  }, [router])

  const handleRoleSelect = async (roleId: string) => {
    if (isLoading) return

    setSelectedRole(roleId)
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: roleId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update role")
      }

      toast.success("Role selected successfully!")
      
      // Redirect to home page
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error selecting role:", error)
      toast.error(error instanceof Error ? error.message : "Failed to select role")
      setSelectedRole(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Choose Your Role
          </h1>
          <p className="text-muted-foreground text-lg">
            Select your role to get started with Lexora
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon
            const isSelected = selectedRole === role.id
            const isProcessing = isLoading && isSelected

            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "hover:shadow-lg"
                } ${role.bgColor}`}
                onClick={() => !isLoading && handleRoleSelect(role.id)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background/50">
                    <Icon className={`h-8 w-8 ${role.color}`} />
                  </div>
                  <CardTitle className="text-xl">{role.name}</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant={isSelected ? "default" : "outline"}
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRoleSelect(role.id)
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isSelected ? (
                      "Selected"
                    ) : (
                      "Select Role"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Note: Admin access is granted separately. Contact your administrator for admin privileges.
          </p>
        </div>
      </div>
    </div>
  )
}

