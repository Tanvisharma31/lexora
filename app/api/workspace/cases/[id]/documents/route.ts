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

        // Check permission if user can read case documents
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

        const response = await fetch(`${BACKEND_URL}/workspace/cases/${id}/documents`, {
            headers
        });

        if (response.status === 404) {
            return NextResponse.json({ error: "Case not found" }, { status: 404 })
        }
        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`)
        }

        const documents = await response.json();
        return NextResponse.json(documents)
    } catch (error) {
        console.error("Get documents API error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function POST(
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

        // Check permission if user can write case documents
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

        const contentType = request.headers.get("content-type") || ""
        let title: string
        let content: string | null = null
        let fileUrl: string | null = null
        let fileType: string | null = null
        let source: string | null = null

        // Handle file upload (multipart/form-data)
        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData()
            const file = formData.get("file") as File | null
            title = formData.get("title") as string || "Untitled Document"
            
            if (file) {
                // Upload file to backend analyze-document endpoint which handles Cloudinary upload
                const uploadFormData = new FormData()
                uploadFormData.append("file", file)
                uploadFormData.append("client_name", `Case ${id}`)
                uploadFormData.append("document_type", file.type || "application/pdf")
                
                const uploadResponse = await fetch(`${BACKEND_URL}/analyze-document/upload`, {
                    method: "POST",
                    headers: {
                        "X-Tenant-Id": user.tenantId || "",
                        "X-Clerk-User-Id": clerkUserId,
                    },
                    body: uploadFormData,
                })

                if (!uploadResponse.ok) {
                    throw new Error("File upload failed")
                }

                const uploadData = await uploadResponse.json()
                fileUrl = uploadData.file_url || uploadData.public_id
                fileType = file.type || "application/pdf"
                source = "workspace_upload"
            } else {
                // Text content provided
                content = formData.get("content") as string || null
                fileType = "text/plain"
            }
        } else {
            // Handle JSON request
            const body = await request.json()
            title = body.title
            content = body.content || null
            fileUrl = body.fileUrl || null
            fileType = body.fileType || null
            source = body.source || null
        }

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
        if (user.tenantId) {
            headers["X-Tenant-Id"] = user.tenantId
        }
        headers["X-Clerk-User-Id"] = clerkUserId

        const response = await fetch(`${BACKEND_URL}/workspace/cases/${id}/documents`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                title,
                content,
                file_url: fileUrl, // Backend expects snake_case for some fields
                file_type: fileType,
                source
            })
        });

        if (response.status === 404) {
            return NextResponse.json({ error: "Case not found" }, { status: 404 })
        }
        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`)
        }

        const document = await response.json();
        return NextResponse.json(document)
    } catch (error) {
        console.error("Create document API error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
