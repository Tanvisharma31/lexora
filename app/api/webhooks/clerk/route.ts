import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { syncClerkUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Force Node.js runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(req: Request) {
  try {
    // Get the Svix headers for verification
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Webhook: Missing Svix headers')
      return NextResponse.json(
        { error: 'Missing webhook headers' },
        { status: 400 }
      )
    }

    // Check if webhook secret is configured
    if (!process.env.CLERK_WEBHOOK_SECRET) {
      console.error('Webhook: CLERK_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Get the body as text first (to avoid reading twice)
    const bodyText = await req.text()
    const body = JSON.parse(bodyText)

    // Create a new Svix instance with your secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    let evt: WebhookEvent

    // Verify the payload with the headers
    try {
      evt = wh.verify(bodyText, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent
    } catch (err) {
      console.error('Webhook verification failed:', {
        error: err instanceof Error ? err.message : String(err),
        svix_id,
      })
      return NextResponse.json(
        { error: 'Webhook verification failed', message: err instanceof Error ? err.message : String(err) },
        { status: 400 }
      )
    }

    // Handle the webhook
    const eventType = evt.type
    console.log('Webhook received:', eventType, evt.data.id)

    // Handle different event types
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data

      // Get primary email (first verified email, or first email if none verified)
      const primaryEmail = email_addresses?.find((e: any) => e.verification?.status === 'verified')?.email_address
        || email_addresses?.[0]?.email_address
        || ''

      if (!primaryEmail) {
        console.warn('Webhook: No email found for user:', id)
        // Return 200 - user might add email later, will sync then
        return NextResponse.json(
          { message: 'User has no email - will sync when email is added' },
          { status: 200 }
        )
      }

      try {
        console.log('Webhook: Syncing user:', {
          clerkId: id,
          email: primaryEmail,
          eventType,
        })

        // Record sign-up attempt for rate limiting (only for new users)
        if (eventType === 'user.created') {
          try {
            const { recordSignUpAttempt, getClientIP } = await import('@/lib/session-tracker')
            // Get IP from request headers
            const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                             req.headers.get('x-real-ip') || 
                             'unknown'
            const mockRequest = new Request('http://localhost', {
              headers: { 'x-forwarded-for': ipAddress },
            })
            await recordSignUpAttempt(mockRequest as any, id)
          } catch (error) {
            console.error('Error recording sign-up attempt:', error)
            // Don't fail the webhook - this is non-critical
          }
        }

        // Use the auth helper which calls the backend
        const user = await syncClerkUser(id, {
          email: primaryEmail,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        })

        console.log('Webhook: User synced successfully:', {
          userId: user.id,
          email: user.email,
        })

        return NextResponse.json(
          {
            message: 'User synced successfully',
            userId: user.id,
            email: user.email,
            verified: true,
          },
          { status: 200 }
        )
      } catch (error) {
        console.error('Webhook: Error syncing user:', {
          clerkId: id,
          error: error instanceof Error ? error.message : String(error),
        })

        return NextResponse.json(
          {
            error: 'Error syncing user',
            message: error instanceof Error ? error.message : String(error),
            retry: true,
          },
          { status: 500 }
        )
      }
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data
      console.log('Webhook: Deleting user:', id)
      // TODO: Implement delete user in backend
      // For now we just acknowledge
      return NextResponse.json(
        { message: 'User deletion acknowledged (not implemented)' },
        { status: 200 }
      )
    }

    // Handle session events - enforce single session per user
    if (eventType === 'session.created') {
      const { id: sessionId, user_id: userId } = evt.data
      console.log('Webhook: Session created:', { sessionId, userId })
      
      // Immediately revoke all other active sessions when new session is created
      try {
        const { clerkClient } = await import('@clerk/nextjs/server')
        const client = await clerkClient()
        
        // Get all active sessions for this user
        const sessions = await client.sessions.getSessionList({ userId })
        const activeSessions = sessions.data?.filter(s => s.status === 'active') || []
        
        // Revoke all sessions except the newly created one
        const sessionsToRevoke = activeSessions.filter(s => s.id !== sessionId)
        
        for (const session of sessionsToRevoke) {
          try {
            await client.sessions.revokeSession(session.id)
            console.log(`Webhook: Revoked old session ${session.id} when new session ${sessionId} was created`)
          } catch (error) {
            console.error(`Error revoking session ${session.id}:`, error)
          }
        }
        
        if (sessionsToRevoke.length > 0) {
          console.log(`Webhook: Enforced single session - revoked ${sessionsToRevoke.length} old session(s) for user: ${userId}`)
        }
      } catch (error) {
        console.error('Error enforcing single session in webhook:', error)
      }
      
      return NextResponse.json(
        { message: 'Session created and other sessions revoked' },
        { status: 200 }
      )
    }

    if (eventType === 'session.ended' || eventType === 'session.revoked') {
      const { id: sessionId, user_id: userId } = evt.data
      console.log('Webhook: Session ended/revoked:', { sessionId, userId })
      return NextResponse.json(
        { message: 'Session event processed' },
        { status: 200 }
      )
    }

    // For any other event types, acknowledge but don't process
    console.log('Webhook: Unhandled event type:', eventType)
    return NextResponse.json(
      { message: `Event ${eventType} received but not processed` },
      { status: 200 }
    )
  } catch (error) {
    // Catch any unexpected errors
    console.error('Webhook: Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
