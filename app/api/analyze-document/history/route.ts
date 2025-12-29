import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const GET = withAuthAndPermission(
  Permission.DOCUMENT_READ,
  async (context, request: NextRequest) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/analyze-document/history?user_id=${context.user.clerkId}&tenant_id=${context.tenantId || ''}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Id": context.tenantId || "",
            "X-Clerk-User-Id": context.user.clerkId || "",
          },
        }
      )

        if (!response.ok) {
            return NextResponse.json([], { status: 200 }) // Return empty if error or not found
        }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("History API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)
