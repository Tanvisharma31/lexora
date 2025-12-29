"use client"

import { Brain, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThinkingLoaderProps {
  className?: string
}

export function ThinkingLoader({ className }: ThinkingLoaderProps) {
  return (
    <div className={cn("liquid rounded-2xl p-8 relative overflow-hidden animate-fade-in-up", className)}>
      {/* Shimmer overlay */}
      <div className="absolute inset-0 shimmer pointer-events-none" />

      <div className="relative flex items-center gap-6">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 border border-white/20 shadow-lg shadow-white/5 animate-pulse">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 border border-white/30 shadow-md animate-bounce">
            <Scale className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <p className="text-white font-semibold text-lg">
            Analyzing laws
            <span className="thinking-dots" />
          </p>
          <p className="text-sm text-white/60 mt-2 font-medium">thinking like a judge 🧠⚖️</p>
        </div>

        {/* Moving dots loader */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-white/60 shadow-sm"
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
            opacity: 0.6;
          }
          40% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
