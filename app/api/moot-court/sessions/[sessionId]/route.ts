import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  return withAuthAndPermission(
    Permission.MOOT_ACCESS,
    async (context) => {
      try {
        const { sessionId } = await params

        const response = await fetch(`${BACKEND_URL}/moot-court/sessions/${sessionId}`, {
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
            { error: "Failed to fetch session", details: errorText },
            { status: response.status }
          )
        }

        const data = await response.json()
        return NextResponse.json(data)
      } catch (error) {
        console.error("Moot court session API error:", error)
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        )
      }
    }
  )(request)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  return withAuthAndPermission(
    Permission.MOOT_ACCESS,
    async (context) => {
      try {
        const { sessionId } = await params
        const body = await request.json()
        const { conversation, score, feedback } = body

        const response = await fetch(`${BACKEND_URL}/moot-court/sessions/${sessionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Id": context.tenantId || "",
            "X-Clerk-User-Id": context.user.clerkId || "",
          },
          body: JSON.stringify({
            conversation: conversation || [],
            score,
            feedback,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          return NextResponse.json(
            { error: "Failed to update session", details: errorText },
            { status: response.status }
          )
        }

        const data = await response.json()
        return NextResponse.json(data)
      } catch (error) {
        console.error("Moot court session update API error:", error)
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        )
      }
    }
  )(request)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  return withAuthAndPermission(
    Permission.MOOT_ACCESS,
    async (context) => {
      try {
        const { sessionId } = await params

        const response = await fetch(`${BACKEND_URL}/moot-court/sessions/${sessionId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Id": context.tenantId || "",
            "X-Clerk-User-Id": context.user.clerkId || "",
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          return NextResponse.json(
            { error: "Failed to delete session", details: errorText },
            { status: response.status }
          )
        }

        return NextResponse.json({ message: "Session deleted successfully" })
      } catch (error) {
        console.error("Moot court session delete API error:", error)
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        )
      }
    }
  )(request)
}

