"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle, CheckCircle, Info, FileText, 
  Download, Share2, Eye, Shield 
} from "lucide-react"
import { toast } from "sonner"

interface ContractClause {
  id: string
  title: string
  content: string
  riskLevel: "low" | "medium" | "high"
  category: string
  issues?: string[]
  suggestions?: string[]
  pageNumber?: number
}

interface ContractAnalysis {
  overallRisk: "low" | "medium" | "high"
  riskScore: number
  clauses: ContractClause[]
  summary: {
    highRisk: number
    mediumRisk: number
    lowRisk: number
    totalClauses: number
  }
  recommendations: string[]
}

interface ContractAnalyzerProps {
  analysis?: ContractAnalysis
  documentName?: string
  onReanalyze?: () => void
  onExport?: () => void
  loading?: boolean
}

export function ContractAnalyzer({
  analysis,
  documentName = "Contract.pdf",
  onReanalyze,
  onExport,
  loading = false
}: ContractAnalyzerProps) {
  const [selectedClause, setSelectedClause] = useState<ContractClause | null>(null)
  const [filterRisk, setFilterRisk] = useState<string>("all")

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "text-red-600 dark:text-red-400"
      case "medium": return "text-yellow-600 dark:text-yellow-400"
      case "low": return "text-green-600 dark:text-green-400"
      default: return "text-gray-600"
    }
  }

  const getRiskBadgeVariant = (level: string): "default" | "destructive" | "outline" => {
    switch (level) {
      case "high": return "destructive"
      case "medium": return "default"
      case "low": return "outline"
      default: return "outline"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high": return <AlertTriangle className="h-4 w-4" />
      case "medium": return <Info className="h-4 w-4" />
      case "low": return <CheckCircle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const filteredClauses = analysis?.clauses.filter(clause => 
    filterRisk === "all" || clause.riskLevel === filterRisk
  ) || []

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-pulse space-y-4">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Analyzing contract...</p>
            <Progress value={65} className="w-48 mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No analysis available</p>
          <p className="text-sm text-muted-foreground mt-2">
            Upload a contract to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {documentName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Contract Risk Analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onReanalyze && (
                <Button variant="outline" size="sm" onClick={onReanalyze}>
                  Re-analyze
                </Button>
              )}
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Risk Score */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Risk Score</span>
              <Badge variant={getRiskBadgeVariant(analysis.overallRisk)} className="uppercase">
                {analysis.overallRisk} Risk
              </Badge>
            </div>
            <Progress 
              value={analysis.riskScore} 
              className={`h-3 ${
                analysis.overallRisk === 'high' ? 'bg-red-100' :
                analysis.overallRisk === 'medium' ? 'bg-yellow-100' :
                'bg-green-100'
              }`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Score: {analysis.riskScore}/100
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{analysis.summary.totalClauses}</div>
              <div className="text-xs text-muted-foreground">Total Clauses</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {analysis.summary.highRisk}
              </div>
              <div className="text-xs text-muted-foreground">High Risk</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {analysis.summary.mediumRisk}
              </div>
              <div className="text-xs text-muted-foreground">Medium Risk</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analysis.summary.lowRisk}
              </div>
              <div className="text-xs text-muted-foreground">Low Risk</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="clauses" className="w-full">
        <TabsList>
          <TabsTrigger value="clauses">Risk Clauses</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="clauses" className="space-y-4">
          {/* Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Filter by risk:</span>
                <Button
                  variant={filterRisk === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRisk("all")}
                >
                  All ({analysis.summary.totalClauses})
                </Button>
                <Button
                  variant={filterRisk === "high" ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setFilterRisk("high")}
                >
                  High ({analysis.summary.highRisk})
                </Button>
                <Button
                  variant={filterRisk === "medium" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRisk("medium")}
                >
                  Medium ({analysis.summary.mediumRisk})
                </Button>
                <Button
                  variant={filterRisk === "low" ? "outline" : "outline"}
                  size="sm"
                  onClick={() => setFilterRisk("low")}
                >
                  Low ({analysis.summary.lowRisk})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Clauses List */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredClauses.map((clause) => (
                <Card key={clause.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedClause(clause)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className={getRiskColor(clause.riskLevel)}>
                        {getRiskIcon(clause.riskLevel)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{clause.title}</h4>
                          <Badge variant={getRiskBadgeVariant(clause.riskLevel)}>
                            {clause.riskLevel}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {clause.content}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {clause.category}
                          </Badge>
                          {clause.pageNumber && (
                            <span>Page {clause.pageNumber}</span>
                          )}
                          {clause.issues && clause.issues.length > 0 && (
                            <span>• {clause.issues.length} issue(s)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded View */}
                    {selectedClause?.id === clause.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        {clause.issues && clause.issues.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">Issues Identified:</h5>
                            <ul className="space-y-1">
                              {clause.issues.map((issue, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5 text-red-500" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {clause.suggestions && clause.suggestions.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">Suggestions:</h5>
                            <ul className="space-y-1">
                              {clause.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 flex-shrink-0 mt-0.5 text-green-500" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredClauses.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">
                      No {filterRisk !== "all" ? filterRisk + " risk" : ""} clauses found
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardContent className="pt-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                  
                  {analysis.recommendations.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No specific recommendations</p>
                      <p className="text-sm mt-2">Contract appears to be in good order</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

