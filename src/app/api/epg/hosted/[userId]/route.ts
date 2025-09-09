import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId

    // Get the latest EPG file for the user
    const latestEpg = await db.epgFile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    if (!latestEpg) {
      return NextResponse.json({ error: "EPG not found" }, { status: 404 })
    }

    // Return XML content
    return new NextResponse(latestEpg.content, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })

  } catch (error) {
    console.error("Hosted EPG error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}