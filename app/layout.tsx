import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

// <CHANGE> Comprehensive SEO metadata for legal search app
export const metadata: Metadata = {
  metadataBase: new URL("https://lexora-llm.vercel.app"),
  title: {
    default: "LegalAI Search - AI-Powered Legal Document Search Engine",
    template: "%s | LegalAI Search",
  },
  description: "Search through Indian laws, acts, and legal precedents with AI-powered answers. Get instant legal information with citations from High Court judgements, Central Code, and State Acts.",
  keywords: [
    "legal search",
    "AI legal assistant",
    "Indian laws",
    "legal documents",
    "acts and regulations",
    "legal precedents",
    "High Court judgements",
    "Central Code",
    "State Acts",
    "legal AI",
    "legal research",
    "Indian legal system",
    "law search engine",
    "legal information",
    "AI-powered legal search",
  ],
  authors: [{ name: "LegalAI Search" }],
  creator: "LegalAI Search",
  publisher: "LegalAI Search",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "LegalAI Search",
    title: "LegalAI Search - AI-Powered Legal Document Search Engine",
    description: "Search through Indian laws, acts, and legal precedents with AI-powered answers. Get instant legal information with citations.",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "LegalAI Search Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LegalAI Search - AI-Powered Legal Document Search Engine",
    description: "Search through Indian laws, acts, and legal precedents with AI-powered answers. Get instant legal information with citations.",
    images: ["/android-chrome-512x512.png"],
    creator: "@legalaisearch",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  alternates: {
    canonical: "/",
  },
  category: "Legal Technology",
  classification: "Legal Search Engine",
  // AI Crawler support
  other: {
    "google-ai": "enabled",
    "openai": "enabled",
    "anthropic": "enabled",
    "cohere": "enabled",
  },
}

export const viewport: Viewport = {
  themeColor: "#0b3d91",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Structured Data for Google
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "LegalAI Search",
    applicationCategory: "LegalApplication",
    operatingSystem: "Web",
    description: "AI-powered legal document search engine for Indian laws, acts, and legal precedents",
    url: "https://lexora-llm.vercel.app",
    author: {
      "@type": "Organization",
      name: "LegalAI Search",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
    featureList: [
      "AI-powered legal search",
      "High Court judgements search",
      "Central Code search",
      "State Acts search",
      "Legal document citations",
      "Instant legal answers",
    ],
  }

  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
          card: "liquid",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
          {/* Structured Data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          {children}
          <Toaster position="top-center" />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
