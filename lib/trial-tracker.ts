/**
 * Trial Usage Tracker
 * Tracks trial usage for each service (5 uses per service)
 */

import { User } from './models'

export type ServiceType = 
  | 'search' 
  | 'llm_search' 
  | 'analyze_document' 
  | 'draftgen' 
  | 'translate_pdf' 
  | 'moot_court'
  | 'workspace_case'

export interface TrialUsage {
  service: ServiceType
  count: number
  limit: number
  resetAt?: Date
}

const TRIAL_LIMITS: Record<ServiceType, number> = {
  search: 5,
  llm_search: 5,
  analyze_document: 5,
  draftgen: 5,
  translate_pdf: 5,
  moot_court: 5,
  workspace_case: 5,
}

/**
 * Check if user can use a service (trial check)
 */
export async function checkTrialUsage(
  userId: string,
  service: ServiceType
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  try {
    const response = await fetch(`/api/trial/check?service=${service}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      // If API fails, allow usage (graceful degradation)
      return { allowed: true, remaining: TRIAL_LIMITS[service], limit: TRIAL_LIMITS[service] }
    }

    const data = await response.json()
    return {
      allowed: data.allowed,
      remaining: data.remaining || 0,
      limit: data.limit || TRIAL_LIMITS[service],
    }
  } catch (error) {
    console.error('Error checking trial usage:', error)
    // Graceful degradation - allow usage if check fails
    return { allowed: true, remaining: TRIAL_LIMITS[service], limit: TRIAL_LIMITS[service] }
  }
}

/**
 * Record service usage
 */
export async function recordTrialUsage(
  userId: string,
  service: ServiceType
): Promise<void> {
  try {
    await fetch('/api/trial/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service }),
    })
  } catch (error) {
    console.error('Error recording trial usage:', error)
    // Fail silently - don't block user
  }
}

/**
 * Get all trial usage for user
 */
export async function getAllTrialUsage(userId: string): Promise<TrialUsage[]> {
  try {
    const response = await fetch('/api/trial/usage', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.usage || []
  } catch (error) {
    console.error('Error fetching trial usage:', error)
    return []
  }
}

/**
 * Check if user has any remaining trials
 */
export async function hasRemainingTrials(userId: string): Promise<boolean> {
  const usage = await getAllTrialUsage(userId)
  return usage.some((u) => u.count < u.limit)
}

