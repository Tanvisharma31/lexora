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
      const trialCheck = await checkTrial(context, 'draftgen')
      if (trialCheck) {
        return trialCheck
      }

      const body = await request.json()
      const { template_type, fields, jurisdiction, include_citations } = body

      if (!template_type || !fields) {
        return NextResponse.json(
          { error: "Template type and fields are required" },
          { status: 400 }
        )
      }

      const response = await fetch(`${BACKEND_URL}/draftgen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": context.tenantId || "",
          "X-Clerk-User-Id": context.user.clerkId || "",
        },
        body: JSON.stringify({
          template_type,
          fields,
          jurisdiction: jurisdiction || "India",
          include_citations: include_citations !== false,
          tenant_id: context.tenantId, // Pass tenant_id for backend filtering
        }),
      })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: "Document generation failed", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
      // Record trial usage after successful generation
      await recordTrialUsage(context, 'draftgen')
      return NextResponse.json(data)
    } catch (error) {
      console.error("DraftGen API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

