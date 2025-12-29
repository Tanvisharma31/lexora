import { type NextRequest, NextResponse } from "next/server"
import { getTenantContext, ensureTenant } from "@/lib/tenant-isolation"
import { needsRoleSelection } from "@/lib/auth-helpers"

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Check if user needs role selection
 * This endpoint can be called from client components
 */
export async function GET(request: NextRequest) {
  try {
    // Get tenant context (enforces authentication)
    const contextResult = await getTenantContext()
    if (contextResult instanceof NextResponse) {
      return contextResult
    }
    const context = contextResult

    // Ensure user has tenant assigned
    const user = await ensureTenant(context.user)

    // Check if user needs role selection
    const needsSelection = await needsRoleSelection(user)

    return NextResponse.json({
      needsSelection,
      role: user.role,
      hasSelectedRole: (user.attrs as any)?.roleSelected === true,
    })
  } catch (error) {
    console.error("Check role API error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        needsSelection: false, // Default to false on error
      },
      { status: 500 }
    )
  }
}

