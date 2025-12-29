import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const POST = withAuthAndPermission(
  Permission.DOCUMENT_WRITE,
  async (context, request: NextRequest) => {
    try {
      // Check trial usage
      const { checkTrial, recordTrialUsage } = await import("@/lib/trial-helpers")
      const trialCheck = await checkTrial(context, 'analyze_document')
      if (trialCheck) {
        return trialCheck
      }

      const contentType = request.headers.get("content-type") || ""

      if (contentType.includes("multipart/form-data")) {
        // Handle file upload
        const formData = await request.formData()
        const file = formData.get("file")
        const documentType = formData.get("document_type")

        if (!file) {
          return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Forward to backend
        const backendFormData = new FormData()
        backendFormData.append("file", file)
        const clientName = formData.get("client_name")
        if (clientName) {
          backendFormData.append("client_name", clientName)
        }
        if (context.user.clerkId) {
          backendFormData.append("user_id", context.user.clerkId)
        }
        if (context.tenantId) {
          backendFormData.append("tenant_id", context.tenantId)
        }
        if (documentType) {
          backendFormData.append("document_type", documentType)
        }

        const response = await fetch(`${BACKEND_URL}/analyze-document/upload`, {
          method: "POST",
          headers: {
            "X-Tenant-Id": context.tenantId || "",
            "X-Clerk-User-Id": context.user.clerkId || "",
          },
          body: backendFormData,
          // no Content-Type header, fetch sets it with boundary
        })

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json(
          { error: "Document analysis failed", details: errorText },
          { status: response.status }
        )
      }

        const data = await response.json()
        // Record trial usage after successful analysis
        await recordTrialUsage(context, 'analyze_document')
        return NextResponse.json(data)
      } else {
        // Handle JSON text input
        const body = await request.json()
        const { document_text, document_type, client_name } = body

        if (!document_text || typeof document_text !== "string") {
          return NextResponse.json(
            { error: "Document text is required" },
            { status: 400 }
          )
        }

        const response = await fetch(`${BACKEND_URL}/analyze-document`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Id": context.tenantId || "",
            "X-Clerk-User-Id": context.user.clerkId || "",
          },
          body: JSON.stringify({
            document_text: document_text.trim(),
            document_type: document_type || null,
            client_name: client_name || "Text Analysis",
            user_id: context.user.clerkId,
            tenant_id: context.tenantId, // Pass tenant_id for backend filtering
          }),
        })

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json(
          { error: "Document analysis failed", details: errorText },
          { status: response.status }
        )
      }

        const data = await response.json()
        // Record trial usage after successful analysis
        await recordTrialUsage(context, 'analyze_document')
        return NextResponse.json(data)
      }
    } catch (error) {
      console.error("Document analysis API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

