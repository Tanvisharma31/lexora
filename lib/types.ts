// Type definitions for search functionality
export interface SearchSource {
  title: string
  act_id: string
  year: number
  pdf_path: string
  preview: string
  score: number
}

export interface SearchResponse {
  query: string
  answer?: string | null
  answer_html?: string
  sources: SearchSource[]
  total_results?: number
  meta?: {
    elapsed_ms: number
    model: string
    truncated: boolean
  }
  tokensRemaining?: number
}

// Sample queries for UI suggestions
export const sampleQueries = [
  "RTI process",
  "Property laws",
  "Consumer rights",
  "Labour laws",
  "Motor Vehicle Act",
  "Property registration",
]

