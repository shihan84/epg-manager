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

    const channels = await db.channel.findMany({
      where: { userId },
      orderBy: { number: 'asc', name: 'asc' }
    })

    return NextResponse.json(channels)

  } catch (error) {
    console.error("Channels GET error:", error)
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
    const { name, displayName, description, logoUrl, streamUrl, number, isActive } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Channel name is required" }, { status: 400 })
    }

    // Check if channel name already exists for this user
    const existingChannel = await db.channel.findFirst({
      where: { 
        userId, 
        name 
      }
    })

    if (existingChannel) {
      return NextResponse.json({ error: "Channel with this name already exists" }, { status: 400 })
    }

    const channel = await db.channel.create({
      data: {
        name,
        displayName,
        description,
        logoUrl,
        streamUrl,
        number,
        isActive,
        userId
      }
    })

    return NextResponse.json(channel, { status: 201 })

  } catch (error) {
    console.error("Channels POST error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}