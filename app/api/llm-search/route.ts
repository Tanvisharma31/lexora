import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"
import { getRateLimiter } from "@/lib/rate-limiter"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const POST = withAuthAndPermission(
  Permission.SEARCH_ADVANCED,
  async (context, request: NextRequest) => {
    try {
      // Check trial usage
      const { checkTrial, recordTrialUsage } = await import("@/lib/trial-helpers")
      const trialCheck = await checkTrial(context, 'llm_search')
      if (trialCheck) {
        return trialCheck
      }

      // Check rate limit for LLM search
      const limiter = getRateLimiter()

      if (!limiter.canMakeRequest()) {
        const waitTime = limiter.getSecondsUntilNextToken()
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: `Too many requests. Please wait ${waitTime} seconds before trying again.`,
            waitTime,
            tokensRemaining: limiter.getTokensRemaining(),
          },
          { status: 429 }
        )
      }

      // Consume token
      if (!limiter.consumeToken()) {
        const waitTime = limiter.getSecondsUntilNextToken()
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: `Too many requests. Please wait ${waitTime} seconds before trying again.`,
            waitTime,
            tokensRemaining: limiter.getTokensRemaining(),
          },
          { status: 429 }
        )
      }

      const body = await request.json()
      const { query, top_k = 5, source } = body

      if (!query || typeof query !== "string") {
        return NextResponse.json({ error: "Query is required and must be a string" }, { status: 400 })
      }

      // Call backend /llm-search endpoint with tenant context
      const response = await fetch(`${BACKEND_URL}/llm-search`, {
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
          tenant_id: context.tenantId, // Pass tenant_id for backend filtering
        }),
      })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error:", errorText)
      return NextResponse.json(
        { error: "Backend LLM search failed", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Transform backend response to match frontend format
    const transformedData = {
      query: data.query,
      answer: data.answer,
      answer_html: data.answer ? `<p>${data.answer.replace(/\n/g, '</p><p>')}</p>` : null,
      sources: data.sources.map((result: any) => ({
        title: result.title,
        act_id: result.act_id || "N/A",
        year: result.year ? parseInt(result.year) : new Date().getFullYear(),
        pdf_path: result.pdf_path || "#",
        preview: result.preview || "",
        score: result.score || 0,
      })),
      total_results: data.sources?.length || 0,
      meta: {
        elapsed_ms: 0,
        model: "llama-3.3-70b-versatile",
        truncated: false,
      },
      tokensRemaining: limiter.getTokensRemaining(),
    }

      // Record trial usage after successful search
      await recordTrialUsage(context, 'llm_search')

      return NextResponse.json(transformedData)
    } catch (error) {
      console.error("LLM Search API error:", error)
      return NextResponse.json(
        { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      )
    }
  }
)

