# Session Security & Rate Limiting

## Overview
This document describes the security measures implemented to:
1. **Enforce single device/browser session per user** - Users can only be logged in on one device at a time
2. **Prevent multiple account creation from same IP** - Rate limiting for sign-ups

## Features Implemented

### 1. Single Session Enforcement

**Location**: `lexora/lib/session-tracker.ts` & `lexora/middleware.ts`

**How it works:**
- Middleware checks active Clerk sessions for each authenticated user
- If multiple active sessions detected:
  - Keeps only the most recent session
  - Automatically revokes older sessions
  - Redirects user to sign-in with error message if their session was revoked

**Implementation:**
```typescript
// Middleware automatically checks on every request
checkAndEnforceSingleSession(request, userId)
```

**User Experience:**
- If user tries to login from second device/browser:
  - First session remains active
  - Second login attempt revokes first session
  - User sees: "Another session is active. Please use only one device/browser."

### 2. IP-Based Sign-Up Rate Limiting

**Location**: 
- Frontend: `lexora/middleware.ts`
- Backend: `Search Engine/backend/routers/auth_users.py`

**How it works:**
- Tracks sign-up attempts by IP address
- Limits: **3 accounts per IP per 24 hours**
- Blocks sign-up if limit exceeded
- Records all sign-up attempts in database

**Implementation:**
```typescript
// Middleware checks before allowing sign-up page access
checkSignUpRateLimit(request)
```

**Database Table:**
```sql
CREATE TABLE "SignUpAttempt" (
    id TEXT PRIMARY KEY,
    ip_address TEXT NOT NULL,
    user_id TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

**User Experience:**
- If user tries to create more than 3 accounts from same IP:
  - Returns 429 Too Many Requests
  - Message: "Too many account creation attempts from this IP address. Maximum 3 accounts per 24 hours allowed."

### 3. Session Tracking in Webhooks

**Location**: `lexora/app/api/webhooks/clerk/route.ts`

**Events Handled:**
- `session.created` - Enforces single session when new session created
- `user.created` - Records sign-up attempt for rate limiting

## Configuration

### Rate Limits

**Sign-Up Rate Limit:**
- **Max accounts per IP**: 3
- **Time window**: 24 hours
- **Configurable in**: `Search Engine/backend/routers/auth_users.py` (line ~200)

To change limit, modify:
```python
max_signups = 3  # Change this value
```

### Session Enforcement

**Behavior:**
- Automatically revokes older sessions
- Keeps most recent session active
- No configuration needed - works automatically

## API Endpoints

### Backend Endpoints

#### `POST /auth/check-signup-rate-limit`
Check if IP can create new account.

**Request:**
```json
{
  "ip_address": "192.168.1.1"
}
```

**Response:**
```json
{
  "allowed": true,
  "remaining": 2
}
```

#### `POST /auth/record-signup`
Record a sign-up attempt.

**Request:**
```json
{
  "ip_address": "192.168.1.1",
  "user_id": "user_abc123"
}
```

## Testing

### Test Single Session Enforcement

1. Login from Chrome browser
2. Try to login from Firefox browser (same account)
3. First session should be revoked
4. User should see error message

### Test Rate Limiting

1. Create 3 accounts from same IP
2. Try to create 4th account
3. Should get 429 error with rate limit message

## Security Benefits

✅ **Prevents Account Abuse:**
- Stops users from creating multiple accounts
- Reduces system load from fake accounts

✅ **Enhances Security:**
- Single session reduces risk of account hijacking
- Makes it harder for attackers to maintain multiple sessions

✅ **System Performance:**
- Reduces database load from multiple sessions
- Prevents resource exhaustion from account spam

## Troubleshooting

### Issue: User can't login even with single device
**Solution**: Check Clerk session status. User might need to clear cookies and try again.

### Issue: Rate limit blocking legitimate users
**Solution**: 
1. Check IP address - might be behind shared proxy
2. Increase rate limit in backend code
3. Add IP whitelist for known good IPs

### Issue: Sessions not being revoked
**Solution**: 
1. Check Clerk API access
2. Verify `CLERK_SECRET_KEY` is set correctly
3. Check webhook logs for errors

## Future Enhancements

- [ ] Add IP whitelist for trusted IPs
- [ ] Configurable rate limits per environment
- [ ] Session activity monitoring dashboard
- [ ] Email notifications for suspicious activity
- [ ] Device fingerprinting for better tracking

---

**Last Updated**: After implementing single session and rate limiting

