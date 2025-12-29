import { type NextRequest, NextResponse } from "next/server"
import { getTenantContext } from "@/lib/tenant-isolation"
import { canAccessCase } from "@/lib/rbac"
import { auth } from "@clerk/nextjs/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
    try {
        // Get tenant context (enforces authentication)
        const contextResult = await getTenantContext()
        // If it's a NextResponse (redirect/error), return it
        if ('status' in contextResult && contextResult instanceof NextResponse) {
            return contextResult
        }
        // Force cast because getTenantContext return type intersection in original code was complex or inferred
        // But here we know it returns a context object if successful.
        // Actually getTenantContext returns TenantContext. requireTenantContext returns Context | Response.
        // The original code used keys to check.
        // Let's assume contextResult is TenantContext based on my reading of lib/tenant-isolation.ts

        const context = contextResult as any
        const user = context.user

        // Check permission
        if (!canAccessCase(user, { tenantId: user.tenantId }, 'read')) {
            return NextResponse.json(
                { error: "Forbidden", message: "Insufficient permissions" },
                { status: 403 }
            )
        }

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

        const response = await fetch(`${BACKEND_URL}/workspace/cases`, {
            headers
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`)
        }

        const cases = await response.json();
        return NextResponse.json(cases)
    } catch (error) {
        console.error("Cases API error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const contextResult = await getTenantContext()
        const context = contextResult as any
        const user = context.user

        // Check permission
        if (!canAccessCase(user, { tenantId: user.tenantId }, 'write')) {
            return NextResponse.json(
                { error: "Forbidden", message: "Insufficient permissions" },
                { status: 403 }
            )
        }

        // Get Clerk user ID for backend authentication
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return NextResponse.json(
                { error: "Unauthorized", message: "User not authenticated" },
                { status: 401 }
            )
        }

        // Check trial usage for workspace case creation
        const { checkTrial, recordTrialUsage } = await import("@/lib/trial-helpers")
        const trialCheck = await checkTrial(context, 'workspace_case')
        if (trialCheck) {
            return trialCheck
        }

        const body = await request.json()
        const { title, description, status, jurisdiction } = body

        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
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

        // Create case via backend
        const response = await fetch(`${BACKEND_URL}/workspace/cases`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                title,
                description,
                status: status || "OPEN",
                jurisdiction
            })
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`)
        }

        const newCase = await response.json()
        // Record trial usage after successful case creation
        await recordTrialUsage(context, 'workspace_case')
        return NextResponse.json(newCase)
    } catch (error) {
        console.error("Create case API error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
