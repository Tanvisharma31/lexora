import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

// <CHANGE> Comprehensive SEO metadata for Nyayik - India's Best AI Legal Tech Platform
export const metadata: Metadata = {
  metadataBase: new URL("https://nyvixa.vercel.app"),
  title: {
    default: "Nyayik - India's Best AI Legal Tech Platform",
    template: "%s | Nyayik",
  },
  description: "Nyayik - India's premier AI-powered legal technology platform. Search laws, analyze documents, draft contracts, practice in moot court, and get AI-powered legal assistance. Early access with free trials available.",
  keywords: [
    "Nyayik",
    "AI legal tech",
    "India legal platform",
    "legal AI assistant",
    "Indian laws",
    "legal documents",
    "acts and regulations",
    "legal precedents",
    "High Court judgements",
    "Central Code",
    "State Acts",
    "legal research",
    "Indian legal system",
    "law search engine",
    "legal information",
    "AI-powered legal search",
    "legal tech India",
    "best legal AI platform",
    "lawyer AI tools",
    "judge AI assistant",
    "legal document analysis",
    "contract review AI",
    "moot court simulator",
  ],
  authors: [{ name: "Nyayik" }],
  creator: "Nyayik",
  publisher: "Nyayik",
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
    siteName: "Nyayik",
    title: "Nyayik - India's Best AI Legal Tech Platform",
    description: "India's premier AI-powered legal technology platform. Search laws, analyze documents, draft contracts, and get AI-powered legal assistance. Early access available.",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Nyayik Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nyayik - India's Best AI Legal Tech Platform",
    description: "India's premier AI-powered legal technology platform. Search laws, analyze documents, draft contracts, and get AI-powered legal assistance.",
    images: ["/android-chrome-512x512.png"],
    creator: "@nyayik",
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
  themeColor: "#000000",
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
    name: "Nyayik",
    applicationCategory: "LegalApplication",
    operatingSystem: "Web",
    description: "India's premier AI-powered legal technology platform for lawyers, judges, and legal professionals",
    url: "https://nyvixa.vercel.app",
    author: {
      "@type": "Organization",
      name: "Nyayik",
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
      "Document analysis and review",
      "Contract drafting",
      "Moot court simulator",
      "PDF translation",
      "Legal reasoning assistant",
      "Case management",
      "Compliance checking",
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
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Structured Data for SEO */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            {children}
            <Toaster position="top-center" />
            <Analytics />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
