import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-helpers"
import { auth } from "@clerk/nextjs/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const GET = withAuth(
  async (context, request: NextRequest) => {
    try {
      const { userId: clerkUserId } = await auth()
      if (!clerkUserId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const searchParams = request.nextUrl.searchParams
      const period = searchParams.get("period") || "month"

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Clerk-User-Id": clerkUserId,
      }
      
      if (context.tenantId) {
        headers["X-Tenant-Id"] = context.tenantId
      }

      const response = await fetch(`${BACKEND_URL}/api/time-tracking/stats?period=${period}`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to fetch time tracking stats" },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Time tracking stats API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

