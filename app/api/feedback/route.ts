import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-helpers"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const POST = withAuth(async (context, request: NextRequest) => {
  try {
    const body = await request.json()
    const { service, feedback, type } = body

    if (!feedback || !service) {
      return NextResponse.json(
        { error: "Feedback and service are required" },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": context.tenantId || "",
        "X-Clerk-User-Id": context.user.clerkId || "",
      },
      body: JSON.stringify({
        user_id: context.user.clerkId,
        service,
        feedback,
        type: type || "general",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: "Failed to submit feedback", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Feedback API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
})

