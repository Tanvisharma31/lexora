import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: docId } = await params

        // Get signed URL from backend (backend verifies ownership and generates signed URL)
        const response = await fetch(
            `${BACKEND_URL}/analyze-document/${docId}/signed-url?user_id=${userId}`
        )

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to get signed URL" },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Signed URL error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

