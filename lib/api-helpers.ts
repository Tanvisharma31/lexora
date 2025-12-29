import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext, ensureTenant, TenantContext } from './tenant-isolation'
import { hasPermission, Permission } from './rbac'

/**
 * API route handler wrapper that enforces authentication and tenant isolation
 * Returns a Next.js route handler function
 */
export function withAuth<T extends NextResponse | Response>(
  handler: (context: TenantContext, request: NextRequest) => Promise<T>
): (request: NextRequest) => Promise<T | NextResponse> {
  return async (request: NextRequest) => {
    try {
      const context = await getTenantContext()
      const user = await ensureTenant(context.user)
      const updatedContext = { ...context, user }
      
      return await handler(updatedContext, request)
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

/**
 * API route handler wrapper that enforces authentication and permission check
 * Returns a Next.js route handler function
 */
export function withAuthAndPermission<T extends NextResponse | Response>(
  permission: Permission,
  handler: (context: TenantContext, request: NextRequest) => Promise<T>
): (request: NextRequest) => Promise<T | NextResponse> {
  return async (request: NextRequest) => {
    try {
      const context = await getTenantContext()
      const user = await ensureTenant(context.user)
      
      if (!hasPermission(user, permission)) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Insufficient permissions' },
          { status: 403 }
        )
      }
      
      const updatedContext = { ...context, user }
      return await handler(updatedContext, request)
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

/**
 * Helper to extract and validate request body
 */
export function validateBody<T>(
  body: unknown,
  validator: (body: unknown) => body is T
): T | NextResponse {
  if (!validator(body)) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
  return body
}

/**
 * Helper to handle API errors consistently
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API error:', error)
  
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('Access denied') || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Forbidden', message: error.message },
        { status: 403 }
      )
    }
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Not Found', message: error.message },
        { status: 404 }
      )
    }
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

