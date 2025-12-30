"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { getDashboardRoute } from "@/lib/dashboard-routing"
import { UserRole } from "@/lib/models"

export function RoleRedirect() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.push("/landing")
      return
    }

    // Fetch user role from API
    const fetchUserRole = async () => {
      try {
        const response = await fetch("/api/user/role")
        if (response.ok) {
          const data = await response.json()
          const role = data.role as UserRole
          
          if (role) {
            const dashboardRoute = getDashboardRoute(role)
            // Only redirect if not already on a dashboard page
            const currentPath = window.location.pathname
            const dashboardPaths = ['/admin', '/judge', '/lawyer', '/student', '/company', '/workspace']
            
            if (!dashboardPaths.some(path => currentPath.startsWith(path)) && currentPath !== '/') {
              return // Don't redirect if already on a specific page
            }
            
            if (currentPath === '/' || currentPath === '/landing') {
              router.push(dashboardRoute)
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error)
      }
    }

    fetchUserRole()
  }, [isSignedIn, isLoaded, router])

  return null
}

