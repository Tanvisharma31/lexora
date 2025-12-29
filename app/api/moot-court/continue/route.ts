import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const POST = withAuthAndPermission(
  Permission.MOOT_ACCESS,
  async (context, request: NextRequest) => {
    try {
      const body = await request.json()
      const { session_id, user_argument, ai_role } = body

      if (!session_id || !user_argument) {
        return NextResponse.json(
          { error: "Session ID and user argument are required" },
          { status: 400 }
        )
      }

      const response = await fetch(`${BACKEND_URL}/moot-court/continue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": context.tenantId || "",
          "X-Clerk-User-Id": context.user.clerkId || "",
        },
        body: JSON.stringify({
          session_id,
          user_argument: user_argument.trim(),
          ai_role: ai_role || "judge",
          tenant_id: context.tenantId, // Pass tenant_id for backend filtering
        }),
      })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: "Moot court continue failed", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Moot court continue API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

