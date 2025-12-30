import { type NextRequest, NextResponse } from "next/server"
import { getTenantContext } from "@/lib/tenant-isolation"
import { auth } from "@clerk/nextjs/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const contextResult = await getTenantContext()
    if ('status' in contextResult && contextResult instanceof NextResponse) {
      return contextResult
    }

    const context = contextResult as any
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Clerk-User-Id": clerkUserId,
    }
    
    if (context.tenantId) {
      headers["X-Tenant-Id"] = context.tenantId
    }

    const response = await fetch(`${BACKEND_URL}/api/clients/${id}/regenerate-token`, {
      method: "POST",
      headers,
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to regenerate token" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Regenerate token API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

