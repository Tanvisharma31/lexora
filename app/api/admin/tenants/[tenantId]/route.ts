import { type NextRequest, NextResponse } from "next/server"
import { getTenantContext, ensureTenant } from "@/lib/tenant-isolation"
import { hasPermission, Permission } from "@/lib/rbac"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

// GET /api/admin/tenants/[tenantId] - Get tenant details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    const context = await getTenantContext()
    const user = await ensureTenant(context.user)

    if (!hasPermission(user, Permission.TENANT_MANAGE)) {
      return NextResponse.json(
        { error: "Forbidden", message: "Insufficient permissions" },
        { status: 403 }
      )
    }



    const response = await fetch(`${BACKEND_URL}/admin/tenants/${tenantId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": context.tenantId || "",
        "X-Clerk-User-Id": user.clerkId || "",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: "Failed to fetch tenant", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Admin get tenant API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/tenants/[tenantId] - Update tenant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    const context = await getTenantContext()
    const user = await ensureTenant(context.user)

    if (!hasPermission(user, Permission.TENANT_MANAGE)) {
      return NextResponse.json(
        { error: "Forbidden", message: "Insufficient permissions" },
        { status: 403 }
      )
    }


    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/admin/tenants/${tenantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": context.tenantId || "",
        "X-Clerk-User-Id": user.clerkId || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: "Failed to update tenant", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Admin update tenant API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/tenants/[tenantId] - Delete tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    const context = await getTenantContext()
    const user = await ensureTenant(context.user)

    if (!hasPermission(user, Permission.TENANT_MANAGE)) {
      return NextResponse.json(
        { error: "Forbidden", message: "Insufficient permissions" },
        { status: 403 }
      )
    }



    const response = await fetch(`${BACKEND_URL}/admin/tenants/${tenantId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": context.tenantId || "",
        "X-Clerk-User-Id": user.clerkId || "",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: "Failed to delete tenant", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Admin delete tenant API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

