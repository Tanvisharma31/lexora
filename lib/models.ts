export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',      // Platform owner (Lexora team)
    ADMIN = 'ADMIN',                  // Org Admin (Law firm / Company admin)
    JUDGE = 'JUDGE',                  // Judicial user
    LAWYER = 'LAWYER',                // Practicing advocate
    ASSOCIATE = 'ASSOCIATE',          // Junior lawyer
    IN_HOUSE_COUNSEL = 'IN_HOUSE_COUNSEL',  // Company legal
    STUDENT = 'STUDENT',              // Academic user (Law Student)
    COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',  // Risk & regulation
    CLERK = 'CLERK',                  // Support staff (Clerk / Assistant)
    READ_ONLY_AUDITOR = 'READ_ONLY_AUDITOR',    // Govt / Internal audit
}

export interface User {
    id: string
    clerkId: string | null
    email: string
    name: string | null
    role: UserRole
    tenantId: string | null
    createdAt: Date
    updatedAt: Date
    attrs: any
}

export interface Tenant {
    id: string
    name: string
    jurisdictionPrefs: any
    dataResidency: string | null
    createdAt: Date
    updatedAt: Date
}

export interface Case {
    id: string
    title: string
    description: string | null
    status: string
    jurisdiction: string | null
    tenantId: string | null
    createdAt: Date
    updatedAt: Date
}

export interface Document {
    id: string
    title: string
    content: string | null
    fileUrl: string | null
    fileType: string | null
    vectorId: string | null
    layoutJson: any
    ownerId: string
    tenantId: string | null
    caseId: string | null
    createdAt: Date
    updatedAt: Date
    source: string | null
}

export interface Filing {
    id: string
    title: string
    date: Date
    caseId: string
}
