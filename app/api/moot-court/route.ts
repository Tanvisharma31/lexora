import { type NextRequest, NextResponse } from "next/server"
import { withAuthAndPermission } from "@/lib/api-helpers"
import { Permission } from "@/lib/rbac"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const POST = withAuthAndPermission(
  Permission.MOOT_ACCESS,
  async (context, request: NextRequest) => {
    try {
      // Check trial usage
      const { checkTrial, recordTrialUsage } = await import("@/lib/trial-helpers")
      const trialCheck = await checkTrial(context, 'moot_court')
      if (trialCheck) {
        return trialCheck
      }

      const body = await request.json()
      const { case_problem, mode, role } = body

      if (!case_problem || typeof case_problem !== "string") {
        return NextResponse.json(
          { error: "Case problem is required" },
          { status: 400 }
        )
      }

      const response = await fetch(`${BACKEND_URL}/moot-court`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": context.tenantId || "",
          "X-Clerk-User-Id": context.user.clerkId || "",
        },
        body: JSON.stringify({
          case_problem: case_problem.trim(),
          mode: mode || "oral",
          role: role || "advocate",
          tenant_id: context.tenantId, // Pass tenant_id for backend filtering
        }),
      })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: "Moot court session failed", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
      // Record trial usage after successful moot court session
      await recordTrialUsage(context, 'moot_court')
      return NextResponse.json(data)
    } catch (error) {
      console.error("Moot court API error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
)

