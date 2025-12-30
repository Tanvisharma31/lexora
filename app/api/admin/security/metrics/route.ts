import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

// GET /api/admin/security/metrics - Get security metrics
export const GET = withAuthAndPermission(
  Permission.USER_MANAGE,
  async (context, request: NextRequest) => {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/security/metrics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": context.tenantId || "",
          "X-Clerk-User-Id": context.user.clerkId || "",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json(
          { error: "Failed to fetch security metrics", details: errorText },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Security metrics API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

