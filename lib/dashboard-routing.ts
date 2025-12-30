import { UserRole } from './models'

/**
 * Get the dashboard route for a user role
 */
export function getDashboardRoute(role: UserRole): string {
  const routeMap: Record<UserRole, string> = {
    SUPER_ADMIN: '/admin',
    ADMIN: '/admin',
    JUDGE: '/judge',
    LAWYER: '/lawyer',
    STUDENT: '/student',
    ASSOCIATE: '/lawyer', // Associates use lawyer dashboard
    IN_HOUSE_COUNSEL: '/company',
    COMPLIANCE_OFFICER: '/company', // Compliance officers use company dashboard
    CLERK: '/workspace', // Clerks use workspace
    READ_ONLY_AUDITOR: '/admin', // Auditors can view admin dashboard (read-only)
  }
  
  return routeMap[role] || '/'
}

/**
 * Check if a role should be redirected to dashboard on login
 */
export function shouldRedirectToDashboard(role: UserRole): boolean {
  // All roles except default/unassigned should go to their dashboard
  return role !== 'LAWYER' || (role === 'LAWYER' && true) // For now, all roles go to dashboard
}

