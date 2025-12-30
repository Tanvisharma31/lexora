"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Activity, Server, Database, Cpu, HardDrive, Zap, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  database: {
    connections: number
    maxConnections: number
    queryTime: number
  }
  api: {
    requestsPerSecond: number
    avgLatency: number
    errorRate: number
  }
  uptime: number
  lastUpdated: string
}

export function SystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/admin/system/health")
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error("Failed to fetch system metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    // Refresh every 10 seconds
    const interval = setInterval(fetchMetrics, 10000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge variant="destructive">Critical</Badge>
    if (percentage >= 75) return <Badge className="bg-yellow-500">Warning</Badge>
    return <Badge className="bg-green-500">Healthy</Badge>
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Failed to load system metrics
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Overview
            </CardTitle>
            <Badge variant="outline">
              Uptime: {formatUptime(metrics.uptime)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CPU Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {metrics.cpu.usage.toFixed(1)}% ({metrics.cpu.cores} cores)
                </span>
                {getStatusBadge(metrics.cpu.usage)}
              </div>
            </div>
            <Progress value={metrics.cpu.usage} className="h-2" />
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {metrics.memory.used.toFixed(1)} / {metrics.memory.total.toFixed(1)} GB
                </span>
                {getStatusBadge(metrics.memory.percentage)}
              </div>
            </div>
            <Progress value={metrics.memory.percentage} className="h-2" />
          </div>

          {/* Disk Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Disk Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {metrics.disk.used.toFixed(1)} / {metrics.disk.total.toFixed(1)} GB
                </span>
                {getStatusBadge(metrics.disk.percentage)}
              </div>
            </div>
            <Progress value={metrics.disk.percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Database & API Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />
              Database Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connections</span>
              <span className="text-sm font-medium">
                {metrics.database.connections} / {metrics.database.maxConnections}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Query Time</span>
              <span className="text-sm font-medium">{metrics.database.queryTime}ms</span>
            </div>
            <Progress 
              value={(metrics.database.connections / metrics.database.maxConnections) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              API Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Requests/sec</span>
              <span className="text-sm font-medium">{metrics.api.requestsPerSecond}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Latency</span>
              <span className="text-sm font-medium">{metrics.api.avgLatency}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.api.errorRate.toFixed(2)}%</span>
                {metrics.api.errorRate > 5 ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
      </p>
    </div>
  )
}

