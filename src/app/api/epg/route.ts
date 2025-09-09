import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get the latest EPG file for the user
    const latestEpg = await db.epgFile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    if (!latestEpg) {
      return NextResponse.json({
        xmlContent: null,
        hostedUrl: null,
        lastGenerated: new Date().toISOString(),
        totalChannels: 0,
        totalPrograms: 0
      })
    }

    // Get user's channels and schedules count
    const [totalChannels, totalPrograms] = await Promise.all([
      db.channel.count({ where: { userId, isActive: true } }),
      db.schedule.count({
        where: {
          channel: {
            userId
          }
        }
      })
    ])

    return NextResponse.json({
      xmlContent: latestEpg.content,
      hostedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/epg/hosted/${userId}`,
      lastGenerated: latestEpg.createdAt.toISOString(),
      totalChannels,
      totalPrograms
    })

  } catch (error) {
    console.error("EPG GET error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}