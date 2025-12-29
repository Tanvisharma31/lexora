# Clerk & Supabase Integration Setup

This document explains how Clerk and Supabase are integrated for authentication and user management.

## Overview

- **Clerk**: Handles authentication (sign-in, sign-up, user sessions)
- **Supabase**: Provides PostgreSQL database (via Prisma) and additional services
- **Integration**: Clerk users are automatically synced to the database User model

## Prerequisites

1. **Clerk Account**: Set up at [clerk.com](https://clerk.com)
2. **Supabase Project**: Set up at [supabase.com](https://supabase.com)

## Environment Variables

Add these to your `.env.local` file:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...  # Get this from Clerk Dashboard > Webhooks

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # For admin operations (server-side only)

# Database (Supabase PostgreSQL)
POSTGRES_PRISMA_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true&connection_limit=1
POSTGRES_URL_NON_POOLING=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

## Setup Steps

### 1. Run Database Migration

After updating the Prisma schema with the `clerkId` field, run:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_clerk_id

# Or if you prefer to push without migration
npx prisma db push
```

### 2. Configure Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) > Webhooks
2. Click "Add Endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
4. Select events to listen to:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** and add it to `.env.local` as `CLERK_WEBHOOK_SECRET`

### 3. Verify Integration

1. Sign up a new user through Clerk
2. Check your database - a new User record should be created automatically
3. The user should have:
   - `clerkId`: Clerk user ID
   - `email`: User's email
   - `name`: User's full name
   - `role`: Default role (LAWYER)

## Usage

### Get Current User

```typescript
import { getCurrentUser } from '@/lib/auth'

// In a server component or API route
const user = await getCurrentUser()
if (user) {
  console.log(user.email, user.role)
}
```

### Check User Role

```typescript
import { hasRole, isAdmin } from '@/lib/auth'

const isLawyer = await hasRole('LAWYER')
const isAdminUser = await isAdmin()
```

### Sync User Manually

```typescript
import { syncClerkUser } from '@/lib/auth'

// Sync a specific Clerk user
const user = await syncClerkUser(clerkUserId, {
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
})
```

### Use Supabase Client

```typescript
import { supabase } from '@/lib/supabase'

// Client-side (uses anon key)
const { data, error } = await supabase
  .from('your_table')
  .select('*')

// Server-side admin operations
import { createSupabaseAdmin } from '@/lib/supabase'
const adminClient = createSupabaseAdmin()
```

## File Structure

```
lexora/
├── lib/
│   ├── auth.ts          # Auth utilities (getCurrentUser, syncClerkUser, etc.)
│   ├── prisma.ts        # Prisma client singleton
│   └── supabase.ts      # Supabase client utilities
├── app/
│   └── api/
│       └── webhooks/
│           └── clerk/
│               └── route.ts  # Clerk webhook handler
└── prisma/
    └── schema.prisma    # Database schema (includes clerkId field)
```

## How It Works

1. **User Signs Up**: User creates account via Clerk
2. **Webhook Triggered**: Clerk sends webhook to `/api/webhooks/clerk`
3. **User Synced**: Webhook handler calls `syncClerkUser()` to create/update User in database
4. **Session Management**: Clerk handles sessions, tokens, and authentication
5. **Database Access**: Use `getCurrentUser()` to get the Prisma User model for database operations

## Troubleshooting

### Webhook Not Working

- Verify `CLERK_WEBHOOK_SECRET` is set correctly
- Check Clerk Dashboard > Webhooks for delivery logs
- Ensure webhook URL is publicly accessible (use ngrok for local testing)

### User Not Syncing

- Check if Prisma migration was run (`npx prisma generate`)
- Verify database connection strings
- Check server logs for errors

### TypeScript Errors

- Run `npx prisma generate` after schema changes
- Restart TypeScript server in your IDE

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Always verify webhook signatures using `CLERK_WEBHOOK_SECRET`
- Use `getCurrentUser()` to ensure user is authenticated before database operations

