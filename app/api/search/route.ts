import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"
import { TenantContext } from "@/lib/tenant-isolation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const POST = withAuthAndPermission(
  Permission.SEARCH_BASIC,
  async (context: TenantContext, request: NextRequest) => {
    try {
      // Check trial usage
      const { checkTrial, recordTrialUsage } = await import("@/lib/trial-helpers")
      const trialCheck = await checkTrial(context, 'search')
      if (trialCheck) {
        return trialCheck
      }

      const body = await request.json()
      const { query, top_k = 10, source, alpha = 0.7, beta = 0.3 } = body

      if (!query || typeof query !== "string") {
        return NextResponse.json({ error: "Query is required and must be a string" }, { status: 400 })
      }

      // Call backend /search endpoint with tenant context
      const response = await fetch(`${BACKEND_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": context.tenantId || "",
          "X-Clerk-User-Id": context.user.clerkId || "",
        },
        body: JSON.stringify({
          query: query.trim(),
          top_k,
          source,
          alpha,
          beta,
          tenant_id: context.tenantId, // Pass tenant_id for backend filtering
        }),
      })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error:", errorText)
      return NextResponse.json(
        { error: "Backend search failed", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Transform backend response to match frontend format
    const transformedData = {
      query: data.query,
      answer: null, // Regular search doesn't have answer
      sources: data.results.map((result: any) => ({
        title: result.title,
        act_id: result.act_id || "N/A",
        year: result.year ? parseInt(result.year) : new Date().getFullYear(),
        pdf_path: result.pdf_path || "#",
        preview: result.preview || "",
        score: result.score || 0,
      })),
      total_results: data.total_results,
    }

      // Record trial usage after successful search
      await recordTrialUsage(context, 'search')

      return NextResponse.json(transformedData)
    } catch (error) {
      console.error("Search API error:", error)
      return NextResponse.json(
        { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      )
    }
  }
)
