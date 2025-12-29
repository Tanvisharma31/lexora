import { type NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { syncClerkUser } from "@/lib/auth"

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Manual sync endpoint - useful for testing or when webhook fails
 * This endpoint allows users to manually sync their Clerk account to the database
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get current user from Clerk
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Clerk user not found" },
        { status: 404 }
      )
    }

    // Get primary email
    const primaryEmail = clerkUser.emailAddresses?.find(
      (e) => e.verification?.status === 'verified'
    )?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || ''

    if (!primaryEmail) {
      return NextResponse.json(
        { error: "No email found. Please add an email to your account." },
        { status: 400 }
      )
    }

    // Sync user
    const user = await syncClerkUser(userId, {
      email: primaryEmail,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    })

    return NextResponse.json({
      success: true,
      message: "User synced successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    })
  } catch (error) {
    console.error("Manual sync error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check sync status
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get current user from Clerk
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Clerk user not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      clerkId: userId,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || 'No email',
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    })
  } catch (error) {
    console.error("Get sync status error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

