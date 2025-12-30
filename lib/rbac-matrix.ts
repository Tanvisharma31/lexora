/**
 * RBAC Matrix - Who Can Do What
 * Based on Lexora's comprehensive role-based access control system
 */

import { UserRole } from './models'
import { hasPermission } from './rbac'
import type { User } from './models'

/**
 * Feature access matrix
 * ✅ = Full access
 * ⚠️ = Restricted / Approval-based
 * ❌ = No access
 */
export const FEATURE_ACCESS: Record<string, Record<UserRole, '✅' | '⚠️' | '❌'>> = {
  'Upload Docs': {
    SUPER_ADMIN: '✅',
    ADMIN: '✅',
    JUDGE: '❌',
    LAWYER: '✅',
    ASSOCIATE: '⚠️', // Requires approval
    IN_HOUSE_COUNSEL: '✅',
    STUDENT: '❌',
    COMPLIANCE_OFFICER: '❌',
    CLERK: '❌',
    READ_ONLY_AUDITOR: '❌',
  },
  'Search Laws': {
    SUPER_ADMIN: '✅',
    ADMIN: '✅',
    JUDGE: '✅',
    LAWYER: '✅',
    ASSOCIATE: '✅',
    IN_HOUSE_COUNSEL: '✅',
    STUDENT: '✅',
    COMPLIANCE_OFFICER: '✅',
    CLERK: '✅',
    READ_ONLY_AUDITOR: '✅',
  },
  'Draft Generation': {
    SUPER_ADMIN: '✅',
    ADMIN: '✅',
    JUDGE: '⚠️', // Can draft orders but needs review
    LAWYER: '✅',
    ASSOCIATE: '⚠️', // Requires approval
    IN_HOUSE_COUNSEL: '✅',
    STUDENT: '⚠️', // Learning mode only
    COMPLIANCE_OFFICER: '❌',
    CLERK: '❌',
    READ_ONLY_AUDITOR: '❌',
  },
  'Case Timeline': {
    SUPER_ADMIN: '✅',
    ADMIN: '✅',
    JUDGE: '✅',
    LAWYER: '✅',
    ASSOCIATE: '⚠️', // Can view, limited edit
    IN_HOUSE_COUNSEL: '❌',
    STUDENT: '❌',
    COMPLIANCE_OFFICER: '❌',
    CLERK: '⚠️', // Can create entries
    READ_ONLY_AUDITOR: '✅', // Read-only
  },
  'Contract Review': {
    SUPER_ADMIN: '✅',
    ADMIN: '✅',
    JUDGE: '❌',
    LAWYER: '✅',
    ASSOCIATE: '⚠️', // Can review but not approve
    IN_HOUSE_COUNSEL: '✅',
    STUDENT: '❌',
    COMPLIANCE_OFFICER: '⚠️', // Can review for compliance
    CLERK: '❌',
    READ_ONLY_AUDITOR: '✅', // Read-only
  },
  'Compliance Engine': {
    SUPER_ADMIN: '✅',
    ADMIN: '✅',
    JUDGE: '❌',
    LAWYER: '❌',
    ASSOCIATE: '❌',
    IN_HOUSE_COUNSEL: '✅',
    STUDENT: '❌',
    COMPLIANCE_OFFICER: '✅',
    CLERK: '❌',
    READ_ONLY_AUDITOR: '✅', // Read-only
  },
  'Edit / Delete': {
    SUPER_ADMIN: '✅',
    ADMIN: '✅',
    JUDGE: '❌',
    LAWYER: '⚠️', // Own documents only
    ASSOCIATE: '⚠️', // Requires approval
    IN_HOUSE_COUNSEL: '⚠️', // Own documents only
    STUDENT: '❌',
    COMPLIANCE_OFFICER: '❌',
    CLERK: '❌',
    READ_ONLY_AUDITOR: '❌',
  },
  'Export': {
    SUPER_ADMIN: '✅',
    ADMIN: '✅',
    JUDGE: '⚠️', // Limited export
    LAWYER: '⚠️', // Own documents only
    ASSOCIATE: '❌',
    IN_HOUSE_COUNSEL: '⚠️', // Restricted
    STUDENT: '❌',
    COMPLIANCE_OFFICER: '✅',
    CLERK: '❌',
    READ_ONLY_AUDITOR: '✅', // Audit exports
  },
}

/**
 * Check if user can access a feature
 */
export function canAccessFeature(user: User | null, feature: string): boolean {
  if (!user) return false
  
  const access = FEATURE_ACCESS[feature]?.[user.role]
  return access === '✅' || access === '⚠️'
}

/**
 * Check if feature requires approval
 */
export function requiresApproval(user: User | null, feature: string): boolean {
  if (!user) return false
  
  const access = FEATURE_ACCESS[feature]?.[user.role]
  return access === '⚠️'
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Org Admin',
    JUDGE: 'Judge',
    LAWYER: 'Lawyer',
    ASSOCIATE: 'Associate',
    IN_HOUSE_COUNSEL: 'In-House Counsel',
    STUDENT: 'Law Student',
    COMPLIANCE_OFFICER: 'Compliance Officer',
    CLERK: 'Clerk / Assistant',
    READ_ONLY_AUDITOR: 'Read-Only Auditor',
  }
  return names[role] || role
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    SUPER_ADMIN: 'Platform owner (Lexora team)',
    ADMIN: 'Law firm / Company admin',
    JUDGE: 'Judicial user',
    LAWYER: 'Practicing advocate',
    ASSOCIATE: 'Junior lawyer',
    IN_HOUSE_COUNSEL: 'Company legal',
    STUDENT: 'Academic user',
    COMPLIANCE_OFFICER: 'Risk & regulation',
    CLERK: 'Support staff',
    READ_ONLY_AUDITOR: 'Govt / Internal audit',
  }
  return descriptions[role] || ''
}

