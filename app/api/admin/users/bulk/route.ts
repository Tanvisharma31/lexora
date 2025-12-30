import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

// PUT /api/admin/users/bulk - Bulk update users
export const PUT = withAuthAndPermission(
  Permission.USER_MANAGE,
  async (context, request: NextRequest) => {
    try {
      const body = await request.json()
      const { userIds, updates } = body

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return NextResponse.json(
          { error: "userIds array is required" },
          { status: 400 }
        )
      }

      if (!updates || typeof updates !== 'object') {
        return NextResponse.json(
          { error: "updates object is required" },
          { status: 400 }
        )
      }

      const response = await fetch(`${BACKEND_URL}/admin/users/bulk`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": context.tenantId || "",
          "X-Clerk-User-Id": context.user.clerkId || "",
        },
        body: JSON.stringify({ userIds, updates }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json(
          { error: "Failed to update users", details: errorText },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Admin bulk update users API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

