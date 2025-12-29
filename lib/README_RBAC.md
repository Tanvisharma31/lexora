# RBAC & Tenant Isolation Guide

## Quick Start

### 1. Using Tenant Context in API Routes

```typescript
import { getTenantContext, ensureTenant } from '@/lib/tenant-isolation'
import { canAccessCase } from '@/lib/rbac'

export async function GET(request: NextRequest) {
  // Get tenant context (enforces authentication)
  const contextResult = await getTenantContext()
  if (contextResult instanceof NextResponse) {
    return contextResult // Returns 401 if not authenticated
  }
  const context = contextResult

  // Ensure user has tenant assigned
  const user = await ensureTenant(context.user)

  // Use tenant-scoped queries
  const cases = await prisma.case.findMany({
    where: {
      tenantId: user.tenantId, // Tenant isolation
    },
  })

  return NextResponse.json(cases)
}
```

### 2. Checking Permissions

```typescript
import { hasPermission, Permission } from '@/lib/rbac'

// Check single permission
if (!hasPermission(user, Permission.DOCUMENT_WRITE)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Check multiple permissions (any)
if (!hasAnyPermission(user, [Permission.DOCUMENT_READ, Permission.CASE_READ])) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### 3. Resource Access Control (ABAC)

```typescript
import { canAccessDocument, canAccessCase } from '@/lib/rbac'

// Check document access
const document = await prisma.document.findUnique({ where: { id } })
if (!canAccessDocument(user, document, 'read')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Check case access
const case_ = await prisma.case.findUnique({ where: { id } })
if (!canAccessCase(user, case_, 'write')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### 4. Using API Helpers

```typescript
import { withAuth, withAuthAndPermission, Permission } from '@/lib/api-helpers'

// Simple auth wrapper
export const GET = withAuth(async (context, request) => {
  const { user, tenantId } = context
  // Your handler code here
  return NextResponse.json({ data: 'protected' })
})

// Auth + permission wrapper
export const POST = withAuthAndPermission(
  Permission.DOCUMENT_WRITE,
  async (context, request) => {
    const { user, tenantId } = context
    // Your handler code here
    return NextResponse.json({ success: true })
  }
)
```

## User Roles & Permissions

### SUPER_ADMIN
- All permissions
- Can access all tenants
- Bypasses tenant isolation

### ADMIN
- User management
- Document/case/contract management
- Audit viewing
- Tenant-scoped access

### JUDGE
- Read-only access to documents/cases
- Judgement writing
- Order issuing
- Tenant-scoped access

### LAWYER
- Full document/case/contract permissions
- Search and save searches
- Contract review
- Tenant-scoped access

### STUDENT
- Read-only access
- Moot court access
- Sandbox mode
- Tenant-scoped access

## Tenant Isolation Rules

1. **All queries must include tenant filter** (unless super admin)
2. **Resources belong to a tenant** (tenantId field)
3. **Users belong to a tenant** (tenantId field)
4. **Super admins bypass tenant isolation**
5. **Automatic tenant creation** for users without tenant

## Best Practices

1. **Always use `getTenantContext()`** at the start of API routes
2. **Always use `ensureTenant()`** to ensure user has tenant
3. **Always filter queries by tenantId** (unless super admin)
4. **Always verify tenant access** before returning resources
5. **Use permission checks** before allowing actions
6. **Use ABAC helpers** for resource-level access control

## Common Patterns

### Pattern 1: List Resources with Tenant Isolation

```typescript
const resources = await prisma.resource.findMany({
  where: {
    tenantId: user.tenantId, // Tenant filter
  },
})
```

### Pattern 2: Get Resource with Access Check

```typescript
const resource = await prisma.resource.findUnique({ where: { id } })
if (!resource) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

// Verify tenant access
verifyTenantAccess(context, resource.tenantId)

// Check permission
if (!canAccessResource(user, resource, 'read')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Pattern 3: Create Resource with Tenant

```typescript
const resource = await prisma.resource.create({
  data: {
    // ... other fields
    tenantId: user.tenantId!, // Assign to user's tenant
    ownerId: user.id, // Assign to user
  },
})
```

