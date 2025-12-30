import { getCurrentUser } from './auth'
import { User } from './models'

/**
 * Check if user needs to select a role
 * Returns true if user hasn't explicitly selected a role
 * Can be used with a User object directly (for middleware) or fetches current user
 */
export async function needsRoleSelection(user?: User | null): Promise<boolean> {
  let userToCheck = user
  
  // If user not provided, fetch current user
  if (!userToCheck) {
    userToCheck = await getCurrentUser()
  }
  
  if (!userToCheck) {
    return false // Not authenticated, will be handled by auth
  }
  
  // Admin roles are set separately, so they don't need role selection
  if (userToCheck.role === 'ADMIN' || userToCheck.role === 'SUPER_ADMIN') {
    return false
  }
  
  // Check if user has explicitly selected a role
  const attrs = userToCheck.attrs as any
  const hasSelectedRole = attrs?.roleSelected === true
  
  // If role is LAWYER (default) and hasn't been explicitly selected, need selection
  if (userToCheck.role === 'LAWYER' && !hasSelectedRole) {
    return true
  }
  
  // If role is JUDGE or STUDENT, assume they've selected it (or it was set by admin)
  // But if roleSelected flag is false, they still need to confirm
  return false
}

/**
 * Get user by Clerk ID (for use in middleware)
 * Uses backend API instead of direct database access
 */
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
    
    const response = await fetch(`${BACKEND_URL}/users/me`, {
      method: "GET",
      headers: {
        "X-Clerk-User-Id": clerkId,
        "Content-Type": "application/json"
      }
    })

    if (response.ok) {
      return await response.json()
    } else if (response.status === 404) {
      return null
    } else {
      console.error('Error fetching user by Clerk ID:', response.status, await response.text())
      return null
    }
  } catch (error) {
    console.error('Error fetching user by Clerk ID:', error)
    return null
  }
}

/**
 * Get the role selection status
 */
export async function getRoleSelectionStatus(): Promise<{
  needsSelection: boolean
  currentRole: string | null
  hasSelected: boolean
}> {
  const user = await getCurrentUser()
  
  if (!user) {
    return {
      needsSelection: false,
      currentRole: null,
      hasSelected: false,
    }
  }
  
  const attrs = user.attrs as any
  const hasSelected = attrs?.roleSelected === true
  
  return {
    needsSelection: await needsRoleSelection(),
    currentRole: user.role,
    hasSelected,
  }
}

