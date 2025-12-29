# Migration Guide: Adding clerkId to Existing Database

## Problem
Your database already has tables, but Prisma doesn't have migration history. This is called "drift."

## Solution Options

### Option 1: Use `db push` (Recommended for Development)

This syncs your schema without creating migration files:

```bash
npx prisma db push
```

This will:
- Add the `clerkId` column to the `User` table
- Add the unique constraint on `clerkId`
- Add the index on `clerkId`
- **Won't create migration files** (good for existing databases)

### Option 2: Create Baseline Migration (For Production)

If you want proper migration history:

1. **First, create a baseline migration that matches current state:**

```bash
# This creates a migration file that represents the current database state
npx prisma migrate dev --create-only --name baseline
```

2. **Edit the migration file** to only include the `clerkId` addition (remove all the existing table creation)

3. **Mark it as applied:**
```bash
npx prisma migrate resolve --applied baseline
```

4. **Then create the clerkId migration:**
```bash
npx prisma migrate dev --name add_clerk_id
```

### Option 3: Manual SQL (If db push doesn't work)

Run this SQL directly in Supabase:

```sql
-- Add clerkId column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "clerkId" TEXT;

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId");

-- Add index
CREATE INDEX IF NOT EXISTS "User_clerkId_idx" ON "User"("clerkId");

-- Make it NOT NULL after backfilling (if needed)
-- ALTER TABLE "User" ALTER COLUMN "clerkId" SET NOT NULL;
```

Then mark the migration as applied:
```bash
npx prisma migrate resolve --applied add_clerk_id
```

## Recommended: Use db push

For your situation, I recommend **Option 1** (`db push`) because:
- ✅ Works with existing databases
- ✅ No migration history needed
- ✅ Simple and fast
- ✅ Safe (only adds the new field)

After running `db push`, regenerate Prisma client:
```bash
npx prisma generate
```

