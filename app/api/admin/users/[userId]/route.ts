import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  return withAuthAndPermission(
    Permission.USER_MANAGE,
    async (context) => {
      try {
        const { userId } = await params
        const body = await request.json()
        const { role, tenant_id, active } = body

        const response = await fetch(`${BACKEND_URL}/admin/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Id": context.tenantId || "",
            "X-Clerk-User-Id": context.user.clerkId || "",
          },
          body: JSON.stringify({
            role,
            tenant_id,
            active,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          return NextResponse.json(
            { error: "Failed to update user", details: errorText },
            { status: response.status }
          )
        }

        const data = await response.json()
        return NextResponse.json(data)
      } catch (error) {
        console.error("Admin user update API error:", error)
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        )
      }
    }
  )(request)
}

