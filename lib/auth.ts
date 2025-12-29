import { auth, currentUser } from '@clerk/nextjs/server'
import { User, UserRole } from './models'
import { headers } from 'next/headers'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

/**
 * Syncs Clerk user with database User model
 * Creates or updates the user record based on Clerk user data
 */
export async function syncClerkUser(clerkUserId: string, clerkUserData?: {
  email: string
  firstName?: string | null
  lastName?: string | null
  imageUrl?: string | null
}): Promise<User> {
  try {
    console.log('syncClerkUser: Starting sync for:', clerkUserId, clerkUserData?.email)

    // If clerkUserData is not provided, fetch from Clerk
    if (!clerkUserData) {
      const clerkUser = await currentUser()
      if (!clerkUser) {
        throw new Error('Clerk user not found')
      }

      clerkUserData = {
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      }
    }

    if (!clerkUserData.email) {
      throw new Error('Email is required to sync user')
    }

    const fullName = [clerkUserData.firstName, clerkUserData.lastName]
      .filter(Boolean)
      .join(' ') || null

    console.log('syncClerkUser: Syncing with backend...')

    const response = await fetch(`${BACKEND_URL}/users/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clerk_id: clerkUserId,
        email: clerkUserData.email,
        name: fullName,
        image_url: clerkUserData.imageUrl
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend sync failed: ${response.status} ${errorText}`);
    }

    const user: User = await response.json();

    console.log('syncClerkUser: Sync completed successfully:', {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    })

    return user
  } catch (error) {
    console.error('syncClerkUser: Fatal error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      clerkId: clerkUserId,
      email: clerkUserData?.email,
    })
    throw error // Re-throw so webhook handler can see the error
  }
}

/**
 * Gets the current authenticated user from Clerk and syncs with database
 * Returns the User model
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return null
    }

    // Call backend to get user
    const response = await fetch(`${BACKEND_URL}/users/me`, {
      method: "GET",
      headers: {
        "X-Clerk-User-Id": userId,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      return await response.json();
    } else if (response.status === 404) {
      // If user not found, try sync
      return await syncClerkUser(userId);
    } else {
      console.error("Error getting current user from backend:", response.status, await response.text());
      return null;
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Gets the current user's Clerk ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId } = await auth()
    return userId
  } catch (error) {
    console.error('Error getting current user ID:', error)
    return null
  }
}

/**
 * Checks if the current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === role
}

/**
 * Checks if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN
}

