import { LegalSearch } from "@/components/legal-search"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Home - AI-Powered Legal Document Search",
  description: "Search through Indian laws, acts, and legal precedents with AI-powered answers. Get instant legal information with citations from High Court judgements, Central Code, and State Acts.",
  openGraph: {
    title: "LegalAI Search - AI-Powered Legal Document Search Engine",
    description: "Search through Indian laws, acts, and legal precedents with AI-powered answers. Get instant legal information with citations.",
    type: "website",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "LegalAI Search",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LegalAI Search - AI-Powered Legal Document Search Engine",
    description: "Search through Indian laws, acts, and legal precedents with AI-powered answers.",
    images: ["/android-chrome-512x512.png"],
  },
}

export default function HomePage() {
  return <LegalSearch />
}
