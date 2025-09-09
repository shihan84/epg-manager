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

    const schedules = await db.schedule.findMany({
      where: {
        channel: {
          userId
        }
      },
      include: {
        channel: true,
        program: true
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    return NextResponse.json(schedules)

  } catch (error) {
    console.error("Schedules GET error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { channelId, programId, startTime, endTime, isLive, isNew } = await request.json()

    if (!channelId || !programId || !startTime || !endTime) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if channel belongs to user
    const channel = await db.channel.findFirst({
      where: { 
        id: channelId,
        userId 
      }
    })

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 })
    }

    // Check if program belongs to user
    const program = await db.program.findFirst({
      where: { 
        id: programId,
        userId 
      }
    })

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    // Validate time range
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)

    if (startDate >= endDate) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 })
    }

    const schedule = await db.schedule.create({
      data: {
        channelId,
        programId,
        startTime: startDate,
        endTime: endDate,
        isLive,
        isNew
      }
    })

    return NextResponse.json(schedule, { status: 201 })

  } catch (error) {
    console.error("Schedules POST error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}