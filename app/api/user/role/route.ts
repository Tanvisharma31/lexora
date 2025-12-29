import { type NextRequest, NextResponse } from "next/server"
import { getTenantContext } from "@/lib/tenant-isolation"
import { UserRole } from "@/lib/models"

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_ROLES = ["JUDGE", "LAWYER", "STUDENT"] as const

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const contextResult = await getTenantContext()
    if ('status' in contextResult && contextResult instanceof NextResponse) {
      return contextResult
    }
    const context = contextResult as any
    const user = context.user

    const body = await request.json()
    const { role } = body

    if (!role || typeof role !== "string") {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      )
    }

    // Validate role
    if (!ALLOWED_ROLES.includes(role as any)) {
      return NextResponse.json(
        { error: "Invalid role. Admin roles cannot be self-assigned." },
        { status: 400 }
      )
    }

    // Check if user already has a role set (and it's not the default LAWYER if strictly enforced, but here we check admin)
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Admin roles cannot be changed. Contact your administrator." },
        { status: 403 }
      )
    }

    // Call backend to update role
    const response = await fetch(`${BACKEND_URL}/users/me/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Clerk-User-Id": user.clerkId || "" // We need clerk ID to identify user in backend easily
      },
      body: JSON.stringify({ role })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Backend error: ${response.status} ${err}`)
    }

    const updatedUser = await response.json();

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
        email: updatedUser.email,
      },
    })
  } catch (error) {
    console.error("Role selection API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get tenant context (enforces authentication)
    const contextResult = await getTenantContext()
    if (contextResult instanceof NextResponse) {
      return contextResult
    }
    const context = contextResult

    // Return current user's role
    return NextResponse.json({
      role: context.user.role,
      hasSelectedRole: (context.user.attrs as any)?.roleSelected === true,
    })
  } catch (error) {
    console.error("Get role API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

