import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"
import { auth } from "@clerk/nextjs/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const GET = withAuthAndPermission(
  Permission.USER_MANAGE,
  async (context, request: NextRequest) => {
    try {
      const { userId: clerkUserId } = await auth()
      if (!clerkUserId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Clerk-User-Id": clerkUserId,
      }
      
      if (context.tenantId) {
        headers["X-Tenant-Id"] = context.tenantId
      }

      const response = await fetch(`${BACKEND_URL}/admin/analytics`, {
        headers,
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to fetch analytics" },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Admin analytics API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

