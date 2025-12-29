import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const GET = withAuthAndPermission(
  Permission.MOOT_ACCESS,
  async (context, request: NextRequest) => {
    try {
      const response = await fetch(`${BACKEND_URL}/moot-court/sessions`, {
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
          { error: "Failed to fetch sessions", details: errorText },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Moot court sessions API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

export const POST = withAuthAndPermission(
  Permission.MOOT_ACCESS,
  async (context, request: NextRequest) => {
    try {
      const body = await request.json()
      const { case_problem, mode, user_role, ai_role, session_id } = body

      if (!case_problem || !mode || !user_role || !ai_role) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        )
      }

      const response = await fetch(`${BACKEND_URL}/moot-court/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": context.tenantId || "",
          "X-Clerk-User-Id": context.user.clerkId || "",
        },
        body: JSON.stringify({
          case_problem,
          mode,
          user_role,
          ai_role,
          session_id,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json(
          { error: "Failed to create session", details: errorText },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Moot court sessions API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

