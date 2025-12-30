import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

// GET /api/admin/tenants - List all tenants
export const GET = withAuthAndPermission(
  Permission.TENANT_MANAGE,
  async (context, request: NextRequest) => {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/tenants`, {
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
          { error: "Failed to fetch tenants", details: errorText },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Admin tenants API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

// POST /api/admin/tenants - Create new tenant
export const POST = withAuthAndPermission(
  Permission.TENANT_MANAGE,
  async (context, request: NextRequest) => {
    try {
      const body = await request.json()

      const response = await fetch(`${BACKEND_URL}/admin/tenants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": context.tenantId || "",
          "X-Clerk-User-Id": context.user.clerkId || "",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json(
          { error: "Failed to create tenant", details: errorText },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Admin create tenant API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

