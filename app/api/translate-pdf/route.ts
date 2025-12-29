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
      const trialCheck = await checkTrial(context, 'translate_pdf')
      if (trialCheck) {
        return trialCheck
      }

      const formData = await request.formData()
      const file = formData.get("file") as File
      const sourceLang = formData.get("source_lang") as string
      const targetLang = formData.get("target_lang") as string
      const preserveLegalTerms = formData.get("preserve_legal_terms") === "true"

      if (!file) {
        return NextResponse.json({ error: "PDF file is required" }, { status: 400 })
      }

      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
      }

      // Create FormData for backend
      const backendFormData = new FormData()
      backendFormData.append("file", file)
      backendFormData.append("source_lang", sourceLang || "hi")
      backendFormData.append("target_lang", targetLang || "en")
      backendFormData.append("preserve_legal_terms", preserveLegalTerms.toString())
      if (context.tenantId) {
        backendFormData.append("tenant_id", context.tenantId)
      }

      const response = await fetch(
        `${BACKEND_URL}/translate-pdf?source_lang=${sourceLang || "hi"}&target_lang=${targetLang || "en"}&preserve_legal_terms=${preserveLegalTerms}`,
        {
          method: "POST",
          headers: {
            "X-Tenant-Id": context.tenantId || "",
            "X-Clerk-User-Id": context.user.clerkId || "",
          },
          body: backendFormData,
        }
      )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: "PDF translation failed", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
      // Record trial usage after successful translation
      await recordTrialUsage(context, 'translate_pdf')
      return NextResponse.json(data)
    } catch (error) {
      console.error("PDF translation API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

