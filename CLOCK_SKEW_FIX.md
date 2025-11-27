# Fixing Clerk Clock Skew Issues

## Problem
Your system clock is behind by ~10 seconds, causing JWT validation to fail with errors like:
```
JWT cannot be used prior to not before date claim (nbf)
Infinite redirect loop
```

## Quick Fix (Windows)

### Method 1: Automatic Sync
1. Right-click the time in the system tray
2. Select **"Adjust date/time"**
3. Turn **OFF** "Set time automatically"
4. Wait 2 seconds
5. Turn **ON** "Set time automatically" again
6. Click **"Sync now"** button

### Method 2: Command Line (Run as Administrator)
```powershell
# Open PowerShell as Administrator, then run:
w32tm /resync
```

### Method 3: Manual Settings
1. Press `Win + I` to open Settings
2. Go to **Time & Language** → **Date & time**
3. Click **"Sync now"** under "Synchronize your clock"

## After Fixing
1. **Clear browser data** for localhost:
   - Chrome/Edge: Press `F12` → Application → Storage → Clear site data
   - Or use Incognito/Private mode
2. **Restart the dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```
3. **Visit** `http://localhost:3000` - it should redirect to `/sign-in` if not authenticated

## Verify Clock is Fixed
Check if your system time matches internet time:
```powershell
# In PowerShell
Get-Date
# Compare with: https://time.is
```

## If Issues Persist
1. **Verify Clerk Keys** in `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
2. **Check Clerk Dashboard** - ensure keys match your application
3. **Try Incognito Mode** - to rule out cookie issues

## Temporary Workaround (Development Only)
If you need to test without fixing the clock, you can temporarily disable auth in middleware (NOT recommended for production):

```typescript
// In middleware.ts - TEMPORARY ONLY
export default clerkMiddleware(async (auth, req) => {
  // Temporarily allow all routes in development
  if (process.env.NODE_ENV === 'development') {
    return // Skip auth check
  }
  // ... rest of code
})
```

**⚠️ Warning:** Never disable auth in production!

