"use client"

import { useState } from "react"
import { Copy, Share2, Check, Clock, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SearchResponse } from "@/lib/types"
import { toast } from "sonner"

interface AnswerCardProps {
  response: SearchResponse
  className?: string
}

export function AnswerCard({ response, className }: AnswerCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const textContent = (response.answer_html || response.answer || "").replace(/<[^>]*>/g, "")
    await navigator.clipboard.writeText(textContent)
    setCopied(true)
    toast.success("Answer copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      const textContent = (response.answer_html || response.answer || "").replace(/<[^>]*>/g, "")
      await navigator.share({
        title: "Legal AI Answer",
        text: textContent.slice(0, 200) + "...",
        url: window.location.href,
      })
    } else {
      handleCopy()
    }
  }

  const getConfidenceLevel = () => {
    const avgScore = response.sources.reduce((acc, s) => acc + s.score, 0) / response.sources.length
    if (avgScore >= 0.9) return { label: "High Confidence", color: "text-green-400 bg-green-400/10" }
    if (avgScore >= 0.7) return { label: "Good Confidence", color: "text-accent bg-accent/10" }
    return { label: "Moderate", color: "text-amber-400 bg-amber-400/10" }
  }

  const confidence = getConfidenceLevel()

  return (
    <div
      className={cn(
        "liquid rounded-2xl overflow-hidden animate-fade-in-up liquid-hover",
        className,
      )}
      role="article"
      aria-label="AI Generated Answer"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-gradient-to-r from-white/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 shadow-lg shadow-white/5">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">AI Answer</h3>
            {response.meta && (
              <div className="flex items-center gap-2 text-xs text-white/50 mt-1">
                <Clock className="h-3 w-3" />
                <span>{response.meta.elapsed_ms}ms</span>
                <span>•</span>
                <span>{response.meta.model}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Confidence Badge */}
          <span className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold border backdrop-blur-sm transition-all hover:scale-105",
            confidence.color,
            "border-white/10"
          )}>
            {confidence.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {response.answer_html ? (
          <div
            className="prose prose-invert prose-sm max-w-none text-white/90 leading-relaxed"
            style={{
              '--tw-prose-headings': '#FFFFFF',
              '--tw-prose-links': '#FFFFFF',
              '--tw-prose-bold': '#FFFFFF',
            } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: response.answer_html }}
          />
        ) : response.answer ? (
          <div className="prose prose-invert prose-sm max-w-none text-white/90 leading-relaxed">
            <p className="whitespace-pre-wrap">{response.answer}</p>
          </div>
        ) : (
          <div className="text-white/60">
            <p>No answer available. Please check the source documents below.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-gradient-to-r from-transparent to-white/5">
        {/* Provenance Strip */}
        <div className="flex items-center gap-3 text-xs text-white/60">
          <span className="font-medium">Sources:</span>
          <div className="flex items-center gap-1.5">
            {response.sources.slice(0, 3).map((source, i) => (
              <span
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/20 text-[10px] font-semibold text-white hover:bg-white/20 hover:scale-110 transition-all cursor-pointer"
                title={source.title}
              >
                {i + 1}
              </span>
            ))}
            {response.sources.length > 3 && (
              <span className="text-white/50 ml-1">+{response.sources.length - 3}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy} 
            className="h-9 gap-2 text-xs text-white/80 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare} 
            className="h-9 gap-2 text-xs text-white/80 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}
