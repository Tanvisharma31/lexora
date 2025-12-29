"use client"

import { Download, ExternalLink, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SearchSource } from "@/lib/types"

interface DocumentListProps {
  sources: SearchSource[]
  className?: string
}

export function DocumentList({ sources, className }: DocumentListProps) {
  if (!sources.length) return null

  return (
    <div className={cn("space-y-6 animate-fade-in-up stagger-1", className)}>
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-xl font-semibold text-white">Top Documents</h3>
        <span className="text-sm text-white/60 font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10">
          {sources.length} {sources.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {sources.map((source, index) => (
          <DocumentCard 
            key={`${source.act_id}-${source.title}-${index}`} 
            source={source} 
            rank={index + 1} 
          />
        ))}
      </div>
    </div>
  )
}

interface DocumentCardProps {
  source: SearchSource
  rank: number
}

function DocumentCard({ source, rank }: DocumentCardProps) {
  const scorePercentage = Math.round(source.score * 100)

  return (
    <article className={cn(
      "liquid-subtle rounded-xl p-5 transition-all liquid-hover group",
      "hover:border-white/20 hover:shadow-lg hover:shadow-white/5"
    )}>
      <div className="flex gap-4">
        {/* Rank indicator */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/20 shadow-lg shadow-white/5 group-hover:bg-white/15 group-hover:scale-110 transition-all">
          <span className="text-sm font-bold text-white">#{rank}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="font-semibold text-white line-clamp-2 group-hover:text-white transition-colors">
              {source.title}
            </h4>
            <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
              <Star className="h-3.5 w-3.5 text-white fill-white/20" />
              <span className="text-xs font-bold text-white">{scorePercentage}%</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
            <span className="font-mono px-2 py-1 rounded bg-white/5 border border-white/10">{source.act_id}</span>
            <span>•</span>
            <span>{source.year}</span>
          </div>

          {/* Preview */}
          <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">{source.preview}</p>
        </div>
      </div>
    </article>
  )
}
