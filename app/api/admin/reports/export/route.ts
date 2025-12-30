import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const GET = withAuthAndPermission(
  Permission.USER_MANAGE,
  async (context, request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams
      const reportType = searchParams.get("report_type") || "organizations"
      const format = searchParams.get("format") || "json"
      
      const response = await fetch(
        `${BACKEND_URL}/admin/reports/export?report_type=${reportType}&format=${format}`,
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
        const errorText = await response.text()
        return NextResponse.json(
          { error: "Failed to export report", details: errorText },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Admin report export error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

