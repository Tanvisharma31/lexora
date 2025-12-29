# Quick Start: Clerk & Supabase Auth

## Immediate Next Steps

### 1. Add Environment Variables

Create or update `.env.local`:

```env
# Clerk (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase (get from https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Database (from Supabase Settings > Database)
POSTGRES_PRISMA_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true&connection_limit=1
POSTGRES_URL_NON_POOLING=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

### 2. Run Database Migration

```bash
# Generate Prisma client with new clerkId field
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_clerk_id
```

### 3. Set Up Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret to `CLERK_WEBHOOK_SECRET` in `.env.local`

### 4. Test the Integration

1. Start dev server: `npm run dev`
2. Sign up a new user at `/sign-up`
3. Check your database - user should be created automatically

## Usage Examples

### In API Routes

```typescript
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // user is a Prisma User model with clerkId, email, name, role, etc.
  return NextResponse.json({ user })
}
```

### In Server Components

```typescript
import { getCurrentUser } from '@/lib/auth'

export default async function Page() {
  const user = await getCurrentUser()
  
  if (!user) {
    return <div>Please sign in</div>
  }
  
  return <div>Welcome, {user.name}!</div>
}
```

### Check Roles

```typescript
import { hasRole, isAdmin } from '@/lib/auth'

const isLawyer = await hasRole('LAWYER')
const isAdminUser = await isAdmin()
```

## Files Created

- `lib/auth.ts` - Auth utilities (getCurrentUser, syncClerkUser, etc.)
- `lib/prisma.ts` - Prisma client singleton
- `lib/supabase.ts` - Supabase client utilities
- `app/api/webhooks/clerk/route.ts` - Clerk webhook handler
- `prisma/schema.prisma` - Updated with `clerkId` field

## Troubleshooting

**TypeScript errors about `clerkId`?**
- Run `npx prisma generate` to regenerate Prisma client

**Webhook not working?**
- Verify `CLERK_WEBHOOK_SECRET` is correct
- Check webhook URL is publicly accessible
- For local testing, use ngrok: `ngrok http 3000`

**User not syncing?**
- Check database connection strings
- Verify Prisma migration was applied
- Check server logs for errors

