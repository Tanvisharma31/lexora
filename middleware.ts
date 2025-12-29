import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { checkAndEnforceSingleSession, checkSignUpRateLimit, getClientIP } from '@/lib/session-tracker'

const isPublicRoute = createRouteMatcher([
  '/',  // Home page is public
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)', // Onboarding routes are public (but require auth)
  '/api/webhooks/clerk', // Webhook routes should be public (they use their own auth)
  '/api/test-db', // Test endpoint
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const pathname = req.nextUrl.pathname

  // Check sign-up rate limiting (prevent multiple accounts from same IP)
  if (pathname.startsWith('/sign-up')) {
    const rateLimitCheck = await checkSignUpRateLimit(req)
    if (!rateLimitCheck.allowed) {
      console.log(`Rate limit exceeded for sign-up from IP: ${getClientIP(req)}`)
      return NextResponse.json(
        { 
          error: 'Too many sign-up attempts',
          message: rateLimitCheck.reason || 'Too many account creation attempts from this IP address. Please try again later.',
          remaining: rateLimitCheck.remaining
        },
        { status: 429 }
      )
    }
  }

  // Only protect API routes and other non-public routes
  // Home page is public, but API routes require auth
  if (!isPublicRoute(req) && pathname.startsWith('/api')) {
    const { userId } = await auth()
    console.log(`Middleware: Checking auth for ${pathname}. UserId: ${userId}`)
    if (!userId) {
      console.log("Middleware: 401 Unauthorized - No userId found")
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Enforce single session per user (prevent multiple browser logins)
  if (userId && !pathname.startsWith('/sign-in') && !pathname.startsWith('/sign-up') && !pathname.startsWith('/api/webhooks')) {
    // Get sessionId from auth context (available in middleware)
    const { sessionId } = await auth()
    const sessionCheck = await checkAndEnforceSingleSession(req, userId, sessionId)
    
    if (!sessionCheck.allowed) {
      console.log(`Multiple session detected for user: ${userId}. Active sessions: ${sessionCheck.activeSessions}`)
      
      // Redirect to sign-in with message
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('error', 'multiple_sessions')
      signInUrl.searchParams.set('message', sessionCheck.reason || 'Only one device/browser session is allowed at a time.')
      
      return NextResponse.redirect(signInUrl)
    }
  }

  // Note: Role selection check is now handled in the onboarding page itself
  // We don't check database in middleware because:
  // 1. Middleware runs on Edge Runtime (Prisma doesn't work there)
  // 2. Webhook will sync user to database (Node.js runtime)
  // 3. User sync will happen automatically when they access any page via getCurrentUser()

  // If user is on onboarding page, let them through
  // The onboarding page will check if they need role selection
  if (pathname.startsWith('/onboarding')) {
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

