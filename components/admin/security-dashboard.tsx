"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Shield, AlertTriangle, Lock, Unlock, User, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SecurityEvent {
  id: string
  type: "failed_login" | "suspicious_activity" | "unauthorized_access" | "account_lockout"
  user: string
  ipAddress: string
  location: string
  timestamp: string
  severity: "low" | "medium" | "high" | "critical"
  details: string
}

interface SecurityMetrics {
  failedLogins24h: number
  suspiciousActivities: number
  accountLockouts: number
  uniqueIPsBlocked: number
  recentEvents: SecurityEvent[]
  topThreats: {
    type: string
    count: number
  }[]
}

export function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSecurityMetrics = async () => {
      try {
        const response = await fetch("/api/admin/security/metrics")
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error("Failed to fetch security metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSecurityMetrics()
    // Refresh every 30 seconds
    const interval = setInterval(fetchSecurityMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-500">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-500">Medium</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "failed_login":
        return <Lock className="h-4 w-4" />
      case "unauthorized_access":
        return <Shield className="h-4 w-4" />
      case "suspicious_activity":
        return <AlertTriangle className="h-4 w-4" />
      case "account_lockout":
        return <Unlock className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getEventLabel = (type: string) => {
    switch (type) {
      case "failed_login":
        return "Failed Login"
      case "unauthorized_access":
        return "Unauthorized Access"
      case "suspicious_activity":
        return "Suspicious Activity"
      case "account_lockout":
        return "Account Lockout"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
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
          <CardTitle>Security Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Failed to load security metrics
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Security Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Failed Logins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.failedLogins24h}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Suspicious Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.suspiciousActivities}</div>
            <p className="text-xs text-muted-foreground">Active alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Unlock className="h-4 w-4 text-muted-foreground" />
              Account Lockouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.accountLockouts}</div>
            <p className="text-xs text-muted-foreground">Current lockouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Blocked IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uniqueIPsBlocked}</div>
            <p className="text-xs text-muted-foreground">Unique addresses</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {metrics.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="mt-0.5">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{getEventLabel(event.type)}</p>
                      {getSeverityBadge(event.severity)}
                    </div>
                    <p className="text-sm text-muted-foreground">{event.details}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {event.user}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.ipAddress} • {event.location}
                      </span>
                      <span>{new Date(event.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Top Threats */}
      <Card>
        <CardHeader>
          <CardTitle>Top Threat Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.topThreats.map((threat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{getEventLabel(threat.type)}</span>
                <Badge variant="outline">{threat.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

