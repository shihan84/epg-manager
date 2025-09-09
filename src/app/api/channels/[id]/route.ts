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
    const channelId = params.id
    const { name, displayName, description, logoUrl, streamUrl, number, isActive } = await request.json()

    // Check if channel exists and belongs to user
    const existingChannel = await db.channel.findFirst({
      where: { 
        id: channelId,
        userId 
      }
    })

    if (!existingChannel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 })
    }

    // Check if channel name already exists for this user (excluding current channel)
    if (name && name !== existingChannel.name) {
      const nameExists = await db.channel.findFirst({
        where: { 
          userId, 
          name,
          id: { not: channelId }
        }
      })

      if (nameExists) {
        return NextResponse.json({ error: "Channel with this name already exists" }, { status: 400 })
      }
    }

    const channel = await db.channel.update({
      where: { id: channelId },
      data: {
        name: name || existingChannel.name,
        displayName,
        description,
        logoUrl,
        streamUrl,
        number,
        isActive
      }
    })

    return NextResponse.json(channel)

  } catch (error) {
    console.error("Channel PUT error:", error)
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
    const channelId = params.id

    // Check if channel exists and belongs to user
    const existingChannel = await db.channel.findFirst({
      where: { 
        id: channelId,
        userId 
      }
    })

    if (!existingChannel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 })
    }

    // Delete associated schedules first
    await db.schedule.deleteMany({
      where: { channelId }
    })

    // Delete the channel
    await db.channel.delete({
      where: { id: channelId }
    })

    return NextResponse.json({ message: "Channel deleted successfully" })

  } catch (error) {
    console.error("Channel DELETE error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}