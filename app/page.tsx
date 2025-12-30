"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LegalSearch } from "@/components/legal-search"
import { Navigation } from "@/components/navigation"
import { QuickTour } from "@/components/quick-tour"
import { RoleRedirect } from "@/components/role-redirect"
import { getDashboardRoute } from "@/lib/dashboard-routing"
import { UserRole } from "@/lib/models"

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [shouldShowSearch, setShouldShowSearch] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/landing")
      return
    }

    if (isSignedIn && isLoaded) {
      // Check if user should be redirected to dashboard
      const checkRoleAndRedirect = async () => {
        try {
          const response = await fetch("/api/user/role")
          if (response.ok) {
            const data = await response.json()
            const role = data.role as UserRole
            
            if (role) {
              const dashboardRoute = getDashboardRoute(role)
              // For some roles, redirect to dashboard; for others, show search
              const rolesWithDashboards = ['SUPER_ADMIN', 'ADMIN', 'JUDGE', 'STUDENT', 'IN_HOUSE_COUNSEL', 'COMPLIANCE_OFFICER']
              
              if (rolesWithDashboards.includes(role)) {
                router.replace(dashboardRoute)
                return
              }
            }
          }
          // If no redirect needed, show search page
          setShouldShowSearch(true)
        } catch (error) {
          console.error("Failed to check user role:", error)
          // On error, show search page as fallback
          setShouldShowSearch(true)
        }
      }

      checkRoleAndRedirect()
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  // Show search page for lawyers and other roles without specific dashboards
  if (shouldShowSearch) {
    return (
      <>
        <Navigation />
        <LegalSearch />
        <QuickTour />
      </>
    )
  }

  // Show loading while checking role
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
  )
}
