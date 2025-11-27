import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

// <CHANGE> Updated metadata for legal search app
export const metadata: Metadata = {
  title: "LegalAI Search - Find Legal Documents Instantly",
  description: "AI-powered legal document search. Get instant answers from Indian laws, acts, and legal precedents.",
  generator: "v0.app",
  keywords: ["legal search", "AI legal", "Indian laws", "legal documents", "acts"],
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
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
          {children}
          <Toaster position="top-center" />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
