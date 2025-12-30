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
      const topic = searchParams.get("topic")
      const difficulty = searchParams.get("difficulty")

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Clerk-User-Id": clerkUserId,
      }
      
      if (context.tenantId) {
        headers["X-Tenant-Id"] = context.tenantId
      }

      let url = `${BACKEND_URL}/api/student/bare-acts`
      const params = new URLSearchParams()
      if (topic) params.append("topic", topic)
      if (difficulty) params.append("difficulty", difficulty)
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url, { headers })

      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to fetch bare acts" },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Bare acts API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

