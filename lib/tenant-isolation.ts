import { getCurrentUser } from './auth'
import { User } from './models'
import { NextResponse } from 'next/server'

/**
 * Tenant context extracted from authenticated user
 */
export interface TenantContext {
  user: User
  tenantId: string | null
  isSuperAdmin: boolean
}

/**
 * Get tenant context from current authenticated user
 * Throws error if user is not authenticated
 */
export async function getTenantContext(): Promise<TenantContext> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  return {
    user,
    tenantId: user.tenantId || null,
    isSuperAdmin: user.role === 'SUPER_ADMIN',
  }
}

/**
 * Middleware helper to enforce tenant isolation
 * Returns tenant context or error response
 */
export async function requireTenantContext(): Promise<TenantContext | NextResponse> {
  try {
    return await getTenantContext()
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'User not authenticated' },
      { status: 401 }
    )
  }
}

/**
 * Verify that a resource belongs to the user's tenant
 * Throws error if access is denied
 */
export function verifyTenantAccess(
  context: TenantContext,
  resourceTenantId: string | null
): void {
  // Super admin can access everything
  if (context.isSuperAdmin) {
    return
  }

  // If resource has no tenant, deny access (unless super admin)
  if (!resourceTenantId) {
    throw new Error('Resource has no tenant assigned')
  }

  // Check tenant match
  if (resourceTenantId !== context.tenantId) {
    throw new Error('Access denied: Resource belongs to different tenant')
  }
}

/**
 * Ensure user has a tenant assigned
 * Deprecated: User sync handled by backend
 */
export async function ensureTenant(user: User): Promise<User> {
  if (!user.tenantId && user.role !== 'SUPER_ADMIN') {
    // In a real scenario, we might want to trigger a sync here or throw
    // Since getCurrentUser calls backend sync, this should rarely happen unless sync failed to create tenant
    console.warn("User has no tenantId in ensureTenant", user.id);
  }
  return user;
}


