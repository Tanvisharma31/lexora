import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getRateLimiter } from "@/lib/rate-limiter"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    // Call backend /llm-search endpoint
    const response = await fetch(`${BACKEND_URL}/llm-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query.trim(),
        top_k,
        source,
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

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("LLM Search API error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

