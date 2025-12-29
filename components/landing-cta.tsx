"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

export function LandingCTA() {
  const router = useRouter()
  const { isSignedIn } = useUser()

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0a0a0a] to-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-white/3 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-white/3 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm shadow-lg shadow-white/5 hover:bg-white/15 transition-all">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">Early Access Available</span>
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Ready to Transform Your
            <br />
            <span className="gradient-text-glow">Legal Practice?</span>
          </h2>

          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Join thousands of legal professionals using Nyayik to streamline their work. 
            Get started with 5 free trials for each service.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6">
            <Button
              size="lg"
              onClick={() => router.push(isSignedIn ? "/" : "/sign-up")}
              className="group liquid-glow px-10 py-7 text-lg font-semibold text-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/20"
            >
              <span className="flex items-center gap-2 text-white">
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/#features")}
              className="px-10 py-7 text-lg font-semibold border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/5"
            >
              Learn More
            </Button>
          </div>

          <p className="text-sm text-white/50 pt-6 font-medium">
            No credit card required • 5 free trials per service • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  )
}

