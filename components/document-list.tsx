"use client"

import { Download, ExternalLink, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SearchSource } from "@/lib/mock-data"

interface DocumentListProps {
  sources: SearchSource[]
  className?: string
}

export function DocumentList({ sources, className }: DocumentListProps) {
  if (!sources.length) return null

  return (
    <div className={cn("space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Top Documents</h3>
        <span className="text-sm text-muted-foreground">{sources.length} results</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {sources.map((source, index) => (
          <DocumentCard key={source.act_id} source={source} rank={index + 1} />
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
    <article className={cn("liquid-subtle rounded-xl p-4 transition-all liquid-hover", "hover:bg-primary/5 hover:border-primary/20")}>
      <div className="flex gap-4">
        {/* Rank indicator */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <span className="text-sm font-bold text-accent">#{rank}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-foreground line-clamp-1">{source.title}</h4>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3 w-3 text-accent" />
              <span className="text-xs font-medium text-accent">{scorePercentage}%</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{source.act_id}</span>
            <span>•</span>
            <span>{source.year}</span>
          </div>

          {/* Preview */}
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{source.preview}</p>

          
        </div>
      </div>
    </article>
  )
}
