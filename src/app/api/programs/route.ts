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

    const programs = await db.program.findMany({
      where: { userId },
      orderBy: { title: 'asc' }
    })

    return NextResponse.json(programs)

  } catch (error) {
    console.error("Programs GET error:", error)
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
    const { title, description, category, duration, imageUrl, isRepeat } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Program title is required" }, { status: 400 })
    }

    const program = await db.program.create({
      data: {
        title,
        description,
        category,
        duration,
        imageUrl,
        isRepeat,
        userId
      }
    })

    return NextResponse.json(program, { status: 201 })

  } catch (error) {
    console.error("Programs POST error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}