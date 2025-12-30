"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Scale, Zap, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
export function LandingHero() {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-muted">
        {mounted && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1), transparent 40%)`,
              transition: "background 0.3s ease-out"
            }}
          />
        )}
      </div>

      {/* Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary border border-border backdrop-blur-sm shadow-lg shadow-sm hover:bg-secondary/80 hover:scale-105 transition-all"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">India's Premier AI Legal Tech Platform</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight"
          >
            <span className="gradient-text-glow">Nyayik</span>
            <br />
            <span className="text-foreground">AI-Powered Legal</span>
            <br />
            <span className="text-foreground/90">Intelligence Platform</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Transform your legal practice with AI. Search laws, analyze documents, draft contracts,
            and practice arguments—all powered by advanced AI technology.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              size="lg"
              onClick={() => router.push(isSignedIn ? "/" : "/sign-up")}
              className="group px-10 py-7 text-lg font-semibold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/#features")}
              className="px-10 py-7 text-lg font-semibold border-border bg-secondary hover:bg-secondary/80 hover:border-border/80 backdrop-blur-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-sm"
            >
              Explore Features
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-10 pt-12"
          >
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80 hover:scale-105 transition-all">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Secure & Compliant</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80 hover:scale-105 transition-all">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80 hover:scale-105 transition-all">
              <Scale className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Legal Experts</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center gap-2 text-white/40">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border border-white/20 rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1 h-3 bg-white/40 rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

