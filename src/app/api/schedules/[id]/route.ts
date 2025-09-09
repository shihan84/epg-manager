import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const scheduleId = params.id
    const { channelId, programId, startTime, endTime, isLive, isNew } = await request.json()

    // Check if schedule exists and belongs to user
    const existingSchedule = await db.schedule.findFirst({
      where: { 
        id: scheduleId,
        channel: {
          userId
        }
      }
    })

    if (!existingSchedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    // Check if channel belongs to user
    if (channelId) {
      const channel = await db.channel.findFirst({
        where: { 
          id: channelId,
          userId 
        }
      })

      if (!channel) {
        return NextResponse.json({ error: "Channel not found" }, { status: 404 })
      }
    }

    // Check if program belongs to user
    if (programId) {
      const program = await db.program.findFirst({
        where: { 
          id: programId,
          userId 
        }
      })

      if (!program) {
        return NextResponse.json({ error: "Program not found" }, { status: 404 })
      }
    }

    // Validate time range if provided
    if (startTime && endTime) {
      const startDate = new Date(startTime)
      const endDate = new Date(endTime)

      if (startDate >= endDate) {
        return NextResponse.json({ error: "End time must be after start time" }, { status: 400 })
      }
    }

    const schedule = await db.schedule.update({
      where: { id: scheduleId },
      data: {
        channelId: channelId || existingSchedule.channelId,
        programId: programId || existingSchedule.programId,
        startTime: startTime ? new Date(startTime) : existingSchedule.startTime,
        endTime: endTime ? new Date(endTime) : existingSchedule.endTime,
        isLive: isLive !== undefined ? isLive : existingSchedule.isLive,
        isNew: isNew !== undefined ? isNew : existingSchedule.isNew
      }
    })

    return NextResponse.json(schedule)

  } catch (error) {
    console.error("Schedule PUT error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const scheduleId = params.id

    // Check if schedule exists and belongs to user
    const existingSchedule = await db.schedule.findFirst({
      where: { 
        id: scheduleId,
        channel: {
          userId
        }
      }
    })

    if (!existingSchedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    // Delete the schedule
    await db.schedule.delete({
      where: { id: scheduleId }
    })

    return NextResponse.json({ message: "Schedule deleted successfully" })

  } catch (error) {
    console.error("Schedule DELETE error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}