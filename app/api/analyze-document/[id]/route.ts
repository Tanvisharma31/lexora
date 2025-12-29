import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const response = await fetch(`${BACKEND_URL}/analyze-document/${id}?user_id=${userId}`, {
            method: "DELETE",
        })

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to delete" }, { status: response.status })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete document API error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
