/**
 * Session Tracker - Enforces single device/session per user
 * Prevents multiple browser sessions for the same user
 */

import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export interface SessionInfo {
  sessionId: string
  userId: string
  deviceInfo: string
  ipAddress: string
  createdAt: string
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for IP (handles proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback - no IP found
  return 'unknown'
}

/**
 * Get device/browser info from request
 */
export function getDeviceInfo(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || 'unknown'
  // Extract browser and OS info
  const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)?.[0] || 'Unknown Browser'
  const os = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/)?.[0] || 'Unknown OS'
  return `${browser} on ${os}`
}

/**
 * Check if user has active sessions and enforce single session
 * Returns true if current session should be allowed, false if should be revoked
 * 
 * @param request - NextRequest object
 * @param userId - Clerk user ID
 * @param sessionId - Current session ID (passed from middleware to avoid auth() call)
 */
export async function checkAndEnforceSingleSession(
  request: NextRequest,
  userId: string,
  sessionId?: string | null
): Promise<{ allowed: boolean; reason?: string; activeSessions?: number }> {
  try {
    if (!sessionId) {
      return { allowed: false, reason: 'No active session' }
    }

    // Get all active sessions for this user from Clerk
    const client = await clerkClient()
    const sessions = await client.sessions.getSessionList({
      userId,
    })

    const activeSessions = sessions.data?.filter(s => s.status === 'active') || []

    // If user has more than one active session, revoke ALL others except current
    if (activeSessions.length > 1) {
      // Find current session in the list
      const currentSession = activeSessions.find(s => s.id === sessionId)
      
      if (!currentSession) {
        // Current session not found in active sessions - might be stale
        return {
          allowed: false,
          reason: 'Session not found. Please sign in again.',
          activeSessions: activeSessions.length
        }
      }

      // Revoke ALL other sessions except the current one
      const sessionsToRevoke = activeSessions.filter(s => s.id !== sessionId)
      
      let revokedCount = 0
      for (const session of sessionsToRevoke) {
        try {
          await client.sessions.revokeSession(session.id)
          revokedCount++
          console.log(`Revoked session: ${session.id} for user: ${userId} (keeping only current session)`)
        } catch (error) {
          console.error(`Error revoking session ${session.id}:`, error)
        }
      }

      if (revokedCount > 0) {
        console.log(`Enforced single session: Revoked ${revokedCount} session(s), kept current session for user: ${userId}`)
      }
    }

    return { allowed: true, activeSessions: activeSessions.length }
  } catch (error) {
    console.error('Error checking sessions:', error)
    // On error, allow access (fail open) but log the error
    return { allowed: true, reason: 'Session check failed' }
  }
}

/**
 * Track IP-based sign-up attempts to prevent multiple account creation
 */
export async function checkSignUpRateLimit(
  request: NextRequest
): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
  try {
    const ipAddress = getClientIP(request)
    
    // Call backend to check rate limit
    const response = await fetch(`${BACKEND_URL}/auth/check-signup-rate-limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip_address: ipAddress,
      }),
    })

    if (!response.ok) {
      // If backend check fails, allow (fail open) but log
      console.error('Rate limit check failed:', response.status)
      return { allowed: true }
    }

    const data = await response.json()
    
    if (!data.allowed) {
      return {
        allowed: false,
        reason: data.reason || 'Too many sign-up attempts from this IP address. Please try again later.',
        remaining: data.remaining
      }
    }

    return { allowed: true, remaining: data.remaining }
  } catch (error) {
    console.error('Error checking sign-up rate limit:', error)
    // On error, allow (fail open) but log
    return { allowed: true }
  }
}

/**
 * Record sign-up attempt for rate limiting
 */
export async function recordSignUpAttempt(
  request: NextRequest,
  userId: string
): Promise<void> {
  try {
    const ipAddress = getClientIP(request)
    
    // Call backend to record sign-up
    await fetch(`${BACKEND_URL}/auth/record-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip_address: ipAddress,
        user_id: userId,
      }),
    })
  } catch (error) {
    console.error('Error recording sign-up attempt:', error)
    // Don't throw - this is non-critical
  }
}

