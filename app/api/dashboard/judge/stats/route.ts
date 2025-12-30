import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"
import { auth } from "@clerk/nextjs/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const GET = withAuth(
  async (context, request: NextRequest) => {
    try {
      // Check if user is JUDGE, SUPER_ADMIN, or ADMIN
      const allowedRoles = ['JUDGE', 'SUPER_ADMIN', 'ADMIN']
      if (!allowedRoles.includes(context.user.role)) {
        return NextResponse.json(
          { error: "Forbidden", message: "Access denied" },
          { status: 403 }
        )
      }

      // Get Clerk user ID for backend authentication
      const { userId: clerkUserId } = await auth()
      if (!clerkUserId) {
        return NextResponse.json(
          { error: "Unauthorized", message: "User not authenticated" },
          { status: 401 }
        )
      }

      // Build headers - only include X-Tenant-Id if it exists
      // Backend will fetch tenantId from User table using X-Clerk-User-Id if not provided
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Clerk-User-Id": clerkUserId,
      }
      
      if (context.tenantId) {
        headers["X-Tenant-Id"] = context.tenantId
      }

      const response = await fetch(`${BACKEND_URL}/dashboard/judge/stats`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json(
          { error: "Failed to fetch judge dashboard stats", details: errorText },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Judge dashboard stats API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

