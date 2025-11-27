import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { query, top_k = 10, source, alpha = 0.7, beta = 0.3 } = body

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required and must be a string" }, { status: 400 })
    }

    // Call backend /search endpoint
    const response = await fetch(`${BACKEND_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query.trim(),
        top_k,
        source,
        alpha,
        beta,
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

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
