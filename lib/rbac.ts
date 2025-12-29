import { User, UserRole } from './models'

/**
 * Permission definitions for RBAC
 */
export enum Permission {
  // Document permissions
  DOCUMENT_READ = 'document:read',
  DOCUMENT_WRITE = 'document:write',
  DOCUMENT_DELETE = 'document:delete',
  DOCUMENT_SHARE = 'document:share',

  // Case/Matter permissions
  CASE_READ = 'case:read',
  CASE_WRITE = 'case:write',
  CASE_DELETE = 'case:delete',
  CASE_MANAGE = 'case:manage',

  // Search permissions
  SEARCH_BASIC = 'search:basic',
  SEARCH_ADVANCED = 'search:advanced',
  SEARCH_SAVE = 'search:save',

  // CLM permissions
  CONTRACT_READ = 'contract:read',
  CONTRACT_WRITE = 'contract:write',
  CONTRACT_APPROVE = 'contract:approve',
  CONTRACT_REVIEW = 'contract:review',

  // Admin permissions
  USER_MANAGE = 'user:manage',
  TENANT_MANAGE = 'tenant:manage',
  AUDIT_VIEW = 'audit:view',
  AUDIT_EXPORT = 'audit:export',
  SYSTEM_CONFIG = 'system:config',

  // Judge-specific permissions
  JUDGEMENT_READ = 'judgement:read',
  JUDGEMENT_WRITE = 'judgement:write',
  ORDER_ISSUE = 'order:issue',

  // Student permissions
  MOOT_ACCESS = 'moot:access',
  SANDBOX_ACCESS = 'sandbox:access',
  
  // Compliance permissions
  COMPLIANCE_VIEW = 'compliance:view',
  COMPLIANCE_MANAGE = 'compliance:manage',
  
  // Export permissions
  EXPORT_DATA = 'export:data',
  
  // Timeline permissions
  TIMELINE_VIEW = 'timeline:view',
  TIMELINE_CREATE = 'timeline:create',
  
  // Approval-based permissions (⚠️ = restricted)
  DRAFT_APPROVE = 'draft:approve',
  DOCUMENT_APPROVE = 'document:approve',
}

/**
 * Role-to-Permission mapping
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    // All permissions
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE,
    Permission.DOCUMENT_DELETE,
    Permission.DOCUMENT_SHARE,
    Permission.CASE_READ,
    Permission.CASE_WRITE,
    Permission.CASE_DELETE,
    Permission.CASE_MANAGE,
    Permission.SEARCH_BASIC,
    Permission.SEARCH_ADVANCED,
    Permission.SEARCH_SAVE,
    Permission.CONTRACT_READ,
    Permission.CONTRACT_WRITE,
    Permission.CONTRACT_APPROVE,
    Permission.CONTRACT_REVIEW,
    Permission.USER_MANAGE,
    Permission.TENANT_MANAGE,
    Permission.AUDIT_VIEW,
    Permission.AUDIT_EXPORT,
    Permission.SYSTEM_CONFIG,
    Permission.JUDGEMENT_READ,
    Permission.JUDGEMENT_WRITE,
    Permission.ORDER_ISSUE,
    Permission.MOOT_ACCESS,
    Permission.SANDBOX_ACCESS,
  ],
  ADMIN: [
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE,
    Permission.DOCUMENT_DELETE,
    Permission.DOCUMENT_SHARE,
    Permission.CASE_READ,
    Permission.CASE_WRITE,
    Permission.CASE_DELETE,
    Permission.CASE_MANAGE,
    Permission.SEARCH_BASIC,
    Permission.SEARCH_ADVANCED,
    Permission.SEARCH_SAVE,
    Permission.CONTRACT_READ,
    Permission.CONTRACT_WRITE,
    Permission.CONTRACT_APPROVE,
    Permission.CONTRACT_REVIEW,
    Permission.USER_MANAGE,
    Permission.AUDIT_VIEW,
    Permission.MOOT_ACCESS,
  ],
  JUDGE: [
    Permission.DOCUMENT_READ,
    Permission.CASE_READ,
    Permission.SEARCH_BASIC,
    Permission.SEARCH_ADVANCED,
    Permission.SEARCH_SAVE,
    Permission.JUDGEMENT_READ,
    Permission.JUDGEMENT_WRITE,
    Permission.ORDER_ISSUE,
    Permission.AUDIT_VIEW,
  ],
  LAWYER: [
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE,
    Permission.DOCUMENT_SHARE,
    Permission.CASE_READ,
    Permission.CASE_WRITE,
    Permission.CASE_MANAGE,
    Permission.SEARCH_BASIC,
    Permission.SEARCH_ADVANCED,
    Permission.SEARCH_SAVE,
    Permission.CONTRACT_READ,
    Permission.CONTRACT_WRITE,
    Permission.CONTRACT_REVIEW,
    Permission.MOOT_ACCESS,
  ],
  STUDENT: [
    Permission.DOCUMENT_READ,
    Permission.CASE_READ,
    Permission.SEARCH_BASIC,
    Permission.MOOT_ACCESS,
    Permission.SANDBOX_ACCESS,
  ],
  ASSOCIATE: [
    // Junior lawyer - restricted permissions
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE, // ⚠️ Approval-based
    Permission.CASE_READ,
    Permission.CASE_WRITE, // ⚠️ Approval-based
    Permission.SEARCH_BASIC,
    Permission.SEARCH_ADVANCED,
    Permission.SEARCH_SAVE,
    Permission.CONTRACT_READ,
    Permission.CONTRACT_REVIEW, // ⚠️ Can review but not approve
    Permission.MOOT_ACCESS,
  ],
  IN_HOUSE_COUNSEL: [
    // Company legal - full contract and compliance access
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE,
    Permission.DOCUMENT_SHARE,
    Permission.SEARCH_BASIC,
    Permission.SEARCH_ADVANCED,
    Permission.SEARCH_SAVE,
    Permission.CONTRACT_READ,
    Permission.CONTRACT_WRITE,
    Permission.CONTRACT_REVIEW,
    Permission.CONTRACT_APPROVE, // ⚠️ Approval-based
    Permission.COMPLIANCE_VIEW,
    Permission.COMPLIANCE_MANAGE,
    Permission.EXPORT_DATA, // ⚠️ Restricted
  ],
  COMPLIANCE_OFFICER: [
    // Risk & regulation specialist
    Permission.DOCUMENT_READ,
    Permission.CASE_READ,
    Permission.SEARCH_BASIC,
    Permission.SEARCH_ADVANCED,
    Permission.SEARCH_SAVE,
    Permission.CONTRACT_READ,
    Permission.CONTRACT_REVIEW,
    Permission.COMPLIANCE_VIEW,
    Permission.COMPLIANCE_MANAGE,
    Permission.AUDIT_VIEW,
    Permission.AUDIT_EXPORT,
    Permission.EXPORT_DATA,
  ],
  CLERK: [
    // Support staff - limited access
    Permission.DOCUMENT_READ,
    Permission.CASE_READ,
    Permission.SEARCH_BASIC,
    Permission.CASE_WRITE, // ⚠️ Can create but not delete
  ],
  READ_ONLY_AUDITOR: [
    // Audit-only access
    Permission.DOCUMENT_READ,
    Permission.CASE_READ,
    Permission.SEARCH_BASIC,
    Permission.AUDIT_VIEW,
    Permission.AUDIT_EXPORT,
    Permission.EXPORT_DATA,
  ],
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false

  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  return userPermissions.includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false
  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Get all permissions for a user role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if user can access a resource based on ownership
 * ABAC (Attribute-Based Access Control) helper
 */
export function canAccessResource(
  user: User | null,
  resourceOwnerId: string,
  resourceTenantId: string | null,
  requiredPermission: Permission
): boolean {
  if (!user) return false

  // Check permission first
  if (!hasPermission(user, requiredPermission)) {
    return false
  }

  // Super admin can access everything
  if (user.role === 'SUPER_ADMIN') {
    return true
  }

  // Check tenant isolation
  if (resourceTenantId && user.tenantId !== resourceTenantId) {
    return false
  }

  // Owner can always access their own resources
  if (user.id === resourceOwnerId) {
    return true
  }

  // Admins can access resources in their tenant
  if (user.role === 'ADMIN' && resourceTenantId === user.tenantId) {
    return true
  }

  // Judges can read all documents in their tenant
  if (user.role === 'JUDGE' && resourceTenantId === user.tenantId) {
    if (requiredPermission === Permission.DOCUMENT_READ ||
      requiredPermission === Permission.CASE_READ) {
      return true
    }
  }

  return false
}

/**
 * Check if user can perform action on document
 */
export function canAccessDocument(
  user: User | null,
  document: { ownerId: string; tenantId: string | null },
  action: 'read' | 'write' | 'delete' | 'share'
): boolean {
  const permissionMap = {
    read: Permission.DOCUMENT_READ,
    write: Permission.DOCUMENT_WRITE,
    delete: Permission.DOCUMENT_DELETE,
    share: Permission.DOCUMENT_SHARE,
  }

  return canAccessResource(
    user,
    document.ownerId,
    document.tenantId,
    permissionMap[action]
  )
}

/**
 * Check if user can perform action on case
 */
export function canAccessCase(
  user: User | null,
  case_: { tenantId: string | null },
  action: 'read' | 'write' | 'delete' | 'manage'
): boolean {
  const permissionMap = {
    read: Permission.CASE_READ,
    write: Permission.CASE_WRITE,
    delete: Permission.CASE_DELETE,
    manage: Permission.CASE_MANAGE,
  }

  // For cases, we check tenant isolation and permission
  if (!user) return false

  if (!hasPermission(user, permissionMap[action])) {
    return false
  }

  // Super admin can access everything
  if (user.role === 'SUPER_ADMIN') {
    return true
  }

  // Check tenant isolation
  if (case_.tenantId && user.tenantId !== case_.tenantId) {
    return false
  }

  return true
}

