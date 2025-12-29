import { type NextRequest, NextResponse } from "next/server"
import { getTenantContext } from "@/lib/tenant-isolation"
import { canAccessCase } from "@/lib/rbac"
import { auth } from "@clerk/nextjs/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const contextResult = await getTenantContext()
        // If it's a NextResponse (redirect/error), return it
        if ('status' in contextResult && contextResult instanceof NextResponse) {
            return contextResult
        }

        const context = contextResult as any
        const user = context.user
        const { id } = await params

        // Get Clerk user ID for backend authentication
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return NextResponse.json(
                { error: "Unauthorized", message: "User not authenticated" },
                { status: 401 }
            )
        }

        // Build headers for backend
        const headers: Record<string, string> = {
            "Content-Type": "application/json"
        }
        
        // Backend expects X-Tenant-Id and X-Clerk-User-Id headers
        // X-Clerk-User-Id is required - backend will fetch tenantId from User table in Supabase
        // X-Tenant-Id is optional - if provided, backend uses it; otherwise fetches from database
        if (user.tenantId) {
            headers["X-Tenant-Id"] = user.tenantId
        }
        headers["X-Clerk-User-Id"] = clerkUserId

        // Fetch case from backend
        const response = await fetch(`${BACKEND_URL}/workspace/cases/${id}`, {
            headers
        });

        if (response.status === 404) {
            return NextResponse.json({ error: "Case not found" }, { status: 404 })
        }
        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`)
        }

        const case_ = await response.json();

        // Check permission (Client Side check / Proxy check)
        // If case has tenantId, verify it matches
        if (case_.tenant_id && case_.tenant_id !== user.tenantId && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: "Forbidden", message: "Case belongs to another tenant" },
                { status: 403 }
            )
        }

        if (!canAccessCase(user, { tenantId: user.tenantId }, 'read')) {
            return NextResponse.json(
                { error: "Forbidden", message: "Insufficient permissions" },
                { status: 403 }
            )
        }

        return NextResponse.json(case_)
    } catch (error) {
        console.error("Get case API error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
