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

export const mockResponses: Record<string, SearchResponse> = {
  "What are the laws in Delhi?": {
    query: "What are the laws in Delhi?",
    answer_html: `
      <p>Delhi, as the National Capital Territory of India, operates under a unique constitutional framework with both central and local governance structures.</p>
      <h4>Key Legislative Framework:</h4>
      <ul>
        <li><strong>Government of NCT of Delhi Act, 1991</strong> - Establishes the legislative assembly and governance structure</li>
        <li><strong>Delhi Municipal Corporation Act, 1957</strong> - Governs local municipal bodies</li>
        <li><strong>Delhi Rent Control Act, 1958</strong> - Regulates tenant-landlord relationships</li>
        <li><strong>Delhi Police Act, 1978</strong> - Governs law enforcement in the territory</li>
      </ul>
      <p>The Lieutenant Governor represents the President of India and has special powers over land, police, and public order matters.</p>
    `,
    sources: [
      {
        title: "Government of NCT of Delhi Act, 1991",
        act_id: "GNCTD1991",
        year: 1991,
        pdf_path: "/docs/gnctd-act-1991.pdf",
        preview:
          "An Act to supplement the Constitution as regards the Legislative Assembly and the Council of Ministers for the National Capital Territory of Delhi...",
        score: 0.94,
      },
      {
        title: "Delhi Municipal Corporation Act, 1957",
        act_id: "DMC1957",
        year: 1957,
        pdf_path: "/docs/dmc-act-1957.pdf",
        preview: "An Act to consolidate and amend the law relating to the Municipal Government of Delhi...",
        score: 0.87,
      },
      {
        title: "Delhi Rent Control Act, 1958",
        act_id: "DRC1958",
        year: 1958,
        pdf_path: "/docs/drc-act-1958.pdf",
        preview: "An Act to provide for the control of rents and evictions, and for the lease of vacant premises...",
        score: 0.82,
      },
    ],
    meta: {
      elapsed_ms: 1247,
      model: "gpt-4-turbo",
      truncated: false,
    },
  },
  "How to file an RTI?": {
    query: "How to file an RTI?",
    answer_html: `
      <p>Filing a Right to Information (RTI) application is a straightforward process guaranteed under the <strong>Right to Information Act, 2005</strong>.</p>
      <h4>Steps to File RTI:</h4>
      <ol>
        <li><strong>Identify the Public Authority</strong> - Determine which government department holds the information</li>
        <li><strong>Draft Your Application</strong> - Write a clear, specific request for information</li>
        <li><strong>Pay the Fee</strong> - ₹10 for Central Government (BPL cardholders exempted)</li>
        <li><strong>Submit to PIO</strong> - Send to the Public Information Officer of the relevant department</li>
        <li><strong>Await Response</strong> - Response due within 30 days (48 hours for life/liberty matters)</li>
      </ol>
      <p>You can file online through the RTI Portal at <code>rtionline.gov.in</code> for central government departments.</p>
    `,
    sources: [
      {
        title: "Right to Information Act, 2005",
        act_id: "RTI2005",
        year: 2005,
        pdf_path: "/docs/rti-act-2005.pdf",
        preview:
          "An Act to provide for setting out the practical regime of right to information for citizens to secure access to information...",
        score: 0.96,
      },
      {
        title: "RTI Rules, 2012",
        act_id: "RTIR2012",
        year: 2012,
        pdf_path: "/docs/rti-rules-2012.pdf",
        preview: "Rules framed under Section 27 of the Right to Information Act, 2005...",
        score: 0.88,
      },
    ],
    meta: {
      elapsed_ms: 982,
      model: "gpt-4-turbo",
      truncated: false,
    },
  },
  "What is the Consumer Protection Act?": {
    query: "What is the Consumer Protection Act?",
    answer_html: `
      <p>The <strong>Consumer Protection Act, 2019</strong> replaced the earlier 1986 Act to provide enhanced protection to consumers in the digital age.</p>
      <h4>Key Features:</h4>
      <ul>
        <li><strong>Central Consumer Protection Authority (CCPA)</strong> - New regulatory body with powers to recall products and impose penalties</li>
        <li><strong>E-commerce Coverage</strong> - Explicit provisions for online and electronic transactions</li>
        <li><strong>Product Liability</strong> - Manufacturers, sellers, and service providers held accountable for defective products</li>
        <li><strong>Mediation</strong> - Alternative dispute resolution mechanism introduced</li>
        <li><strong>Unfair Contracts</strong> - Protection against one-sided contract terms</li>
      </ul>
      <p>Consumers can file complaints electronically, and the pecuniary jurisdiction has been revised upward for all consumer forums.</p>
    `,
    sources: [
      {
        title: "Consumer Protection Act, 2019",
        act_id: "CPA2019",
        year: 2019,
        pdf_path: "/docs/cpa-2019.pdf",
        preview:
          "An Act to provide for protection of the interests of consumers and for the said purpose, to establish authorities...",
        score: 0.97,
      },
      {
        title: "Consumer Protection Rules, 2020",
        act_id: "CPR2020",
        year: 2020,
        pdf_path: "/docs/cp-rules-2020.pdf",
        preview: "Rules for the Consumer Protection (E-Commerce) Rules, 2020...",
        score: 0.84,
      },
      {
        title: "Consumer Protection Act, 1986 (Repealed)",
        act_id: "CPA1986",
        year: 1986,
        pdf_path: "/docs/cpa-1986.pdf",
        preview: "An Act to provide for better protection of the interests of consumers... [Historical Reference]",
        score: 0.72,
      },
    ],
    meta: {
      elapsed_ms: 1089,
      model: "gpt-4-turbo",
      truncated: false,
    },
  },
}

export const sampleQueries = [
  "What are the laws in Delhi?",
  "How to file an RTI?",
  "What is the Consumer Protection Act?",
  "Motor Vehicle Act penalties",
  "Property registration process",
]

export function generateMockResponse(query: string): SearchResponse {
  // Check for exact match first
  if (mockResponses[query]) {
    return mockResponses[query]
  }

  // Generate a generic response
  return {
    query,
    answer_html: `
      <p>Based on the analysis of Indian legal documents, here's what I found regarding "<em>${query}</em>":</p>
      <p>This query relates to various provisions under Indian law. The specific legal framework depends on the jurisdiction and nature of the matter.</p>
      <h4>Relevant Areas:</h4>
      <ul>
        <li>Constitutional provisions and fundamental rights</li>
        <li>Applicable central and state legislation</li>
        <li>Relevant rules and regulations</li>
        <li>Judicial precedents and interpretations</li>
      </ul>
      <p>For specific legal advice, please consult a qualified legal professional.</p>
    `,
    sources: [
      {
        title: "Constitution of India",
        act_id: "COI1950",
        year: 1950,
        pdf_path: "/docs/constitution-india.pdf",
        preview: "The Constitution of India is the supreme law of India. It frames fundamental political principles...",
        score: 0.78,
      },
      {
        title: "General Clauses Act, 1897",
        act_id: "GCA1897",
        year: 1897,
        pdf_path: "/docs/general-clauses-1897.pdf",
        preview:
          "An Act to consolidate the provisions for the construction of expressions used in Acts of Parliament...",
        score: 0.65,
      },
    ],
    meta: {
      elapsed_ms: Math.floor(Math.random() * 500) + 800,
      model: "gpt-4-turbo",
      truncated: false,
    },
  }
}
