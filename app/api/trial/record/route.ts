import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-helpers"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const POST = withAuth(async (context, request: NextRequest) => {
  try {
    const body = await request.json()
    const { service } = body

    if (!service) {
      return NextResponse.json(
        { error: "Service parameter is required" },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/trial/record`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": context.tenantId || "",
        "X-Clerk-User-Id": context.user.clerkId || "",
      },
      body: JSON.stringify({
        user_id: context.user.clerkId,
        service,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: "Failed to record trial usage", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Trial record API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
})

