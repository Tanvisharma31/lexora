"use client"

import { Brain, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThinkingLoaderProps {
  className?: string
}

export function ThinkingLoader({ className }: ThinkingLoaderProps) {
  return (
    <div className={cn("glass rounded-2xl p-6 relative overflow-hidden", className)}>
      {/* Shimmer overlay */}
      <div className="absolute inset-0 shimmer pointer-events-none" />

      <div className="relative flex items-center gap-4">
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
            <Brain className="h-6 w-6 text-accent animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
            <Scale className="h-3 w-3 text-accent-foreground" />
          </div>
        </div>

        <div className="flex-1">
          <p className="text-foreground font-medium">
            Analyzing laws
            <span className="thinking-dots" />
          </p>
          <p className="text-sm text-muted-foreground mt-1">thinking like a judge 🧠⚖️</p>
        </div>

        {/* Moving dots loader */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-accent"
              style={{
                animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  )
}
