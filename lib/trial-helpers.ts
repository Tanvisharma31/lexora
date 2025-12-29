/**
 * Trial Helpers for API Routes
 * Check and record trial usage in API handlers
 */

import { NextResponse } from 'next/server'
import { TenantContext } from './tenant-isolation'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export type ServiceType = 
  | 'search' 
  | 'llm_search' 
  | 'analyze_document' 
  | 'draftgen' 
  | 'translate_pdf' 
  | 'moot_court'
  | 'workspace_case'

/**
 * Check if user can use a service (trial check)
 * Returns null if allowed, or NextResponse with error if not allowed
 */
export async function checkTrial(
  context: TenantContext,
  service: ServiceType
): Promise<NextResponse | null> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/trial/check?user_id=${context.user.clerkId}&service=${service}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": context.tenantId || "",
          "X-Clerk-User-Id": context.user.clerkId || "",
        },
      }
    )

    if (!response.ok) {
      // If check fails, allow usage (graceful degradation)
      return null
    }

    const data = await response.json()
    
    if (!data.allowed) {
      return NextResponse.json(
        {
          error: "Trial expired",
          message: `You've used all 5 free trials for ${service}. Please provide feedback or join our waiting list for early access.`,
          trial_expired: true,
          service,
          remaining: data.remaining || 0,
          limit: data.limit || 5,
        },
        { status: 403 }
      )
    }

    return null // Allowed
  } catch (error) {
    console.error("Error checking trial:", error)
    // Graceful degradation - allow usage if check fails
    return null
  }
}

/**
 * Record service usage after successful operation
 */
export async function recordTrialUsage(
  context: TenantContext,
  service: ServiceType
): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/trial/record`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": context.tenantId || "",
        "X-Clerk-User-Id": context.user.clerkId || "",
      },
      body: JSON.stringify({
        user_id: context.user.clerkId,
        service,
      }),
    })
  } catch (error) {
    console.error("Error recording trial usage:", error)
    // Fail silently - don't block user
  }
}

