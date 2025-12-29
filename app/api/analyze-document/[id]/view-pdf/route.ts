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

        // Stream PDF from backend (backend verifies ownership and fetches from Cloudinary)
        const response = await fetch(
            `${BACKEND_URL}/analyze-document/${docId}/stream-pdf?user_id=${userId}`
        )

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to load PDF" },
                { status: response.status }
            )
        }

        // Return the PDF stream to the browser
        const pdfBuffer = await response.arrayBuffer()

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline',
            },
        })
    } catch (error) {
        console.error("PDF stream error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
