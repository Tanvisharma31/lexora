"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Gavel, Calendar, MapPin, User, BookOpen, 
  Eye, Download, Bookmark, Share2 
} from "lucide-react"
import { toast } from "sonner"

interface CaseCardProps {
  id: string
  title: string
  citation?: string
  court?: string
  judgeName?: string
  year?: number
  date?: string
  jurisdiction?: string
  summary?: string
  topics?: string[]
  relevance?: number
  isLandmark?: boolean
  onClick?: () => void
  onBookmark?: () => void
  onShare?: () => void
  onDownload?: () => void
  compact?: boolean
  showActions?: boolean
}

export function CaseCard({
  id,
  title,
  citation,
  court,
  judgeName,
  year,
  date,
  jurisdiction,
  summary,
  topics = [],
  relevance,
  isLandmark = false,
  onClick,
  onBookmark,
  onShare,
  onDownload,
  compact = false,
  showActions = true
}: CaseCardProps) {
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onBookmark) {
      onBookmark()
    }
    toast.success("Case bookmarked")
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onShare) {
      onShare()
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(`${title} - ${citation || ''}`)
      toast.success("Citation copied to clipboard")
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDownload) {
      onDownload()
    }
    toast.success("Download started")
  }

  return (
    <Card 
      className={`hover:bg-muted/50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className={compact ? "pb-2" : "pb-3"}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Gavel className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <h3 className="font-semibold text-base leading-tight line-clamp-2">
                {title}
              </h3>
            </div>
            
            {citation && (
              <p className="text-sm text-muted-foreground font-mono mb-2">
                {citation}
              </p>
            )}
            
            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {court && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {court}
                </span>
              )}
              {judgeName && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {judgeName}
                </span>
              )}
              {(year || date) && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {year || date}
                </span>
              )}
              {jurisdiction && (
                <Badge variant="outline" className="h-5 text-xs">
                  {jurisdiction}
                </Badge>
              )}
            </div>
          </div>

          {/* Right Side Badges */}
          <div className="flex flex-col items-end gap-2">
            {isLandmark && (
              <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                Landmark
              </Badge>
            )}
            {relevance !== undefined && relevance > 0 && (
              <Badge variant="outline" className="font-mono">
                {relevance}% match
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {!compact && (
        <CardContent className="pt-0">
          {/* Summary */}
          {summary && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {summary}
            </p>
          )}

          {/* Topics */}
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {topics.slice(0, 4).map((topic, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
              {topics.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{topics.length - 4} more
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClick}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBookmark}
              >
                <Bookmark className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              {onDownload && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

