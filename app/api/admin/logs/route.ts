import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const GET = withAuthAndPermission(
  Permission.AUDIT_VIEW,
  async (context, request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const limit = searchParams.get("limit") || "100"
      const offset = searchParams.get("offset") || "0"

      const response = await fetch(`${BACKEND_URL}/admin/logs?limit=${limit}&offset=${offset}`, {
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
          { error: "Failed to fetch admin logs", details: errorText },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Admin logs API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

