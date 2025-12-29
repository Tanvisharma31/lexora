import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-helpers"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const GET = withAuth(async (context, request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const service = searchParams.get("service")

    if (!service) {
      return NextResponse.json(
        { error: "Service parameter is required" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/trial/check?user_id=${context.user.clerkId}&service=${service}`,
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
        { error: "Failed to check trial usage", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Trial check API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
})

