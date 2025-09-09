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
    const programId = params.id
    const { title, description, category, duration, imageUrl, isRepeat } = await request.json()

    // Check if program exists and belongs to user
    const existingProgram = await db.program.findFirst({
      where: { 
        id: programId,
        userId 
      }
    })

    if (!existingProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    const program = await db.program.update({
      where: { id: programId },
      data: {
        title: title || existingProgram.title,
        description,
        category,
        duration,
        imageUrl,
        isRepeat
      }
    })

    return NextResponse.json(program)

  } catch (error) {
    console.error("Program PUT error:", error)
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
    const programId = params.id

    // Check if program exists and belongs to user
    const existingProgram = await db.program.findFirst({
      where: { 
        id: programId,
        userId 
      }
    })

    if (!existingProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    // Delete associated schedules first
    await db.schedule.deleteMany({
      where: { programId }
    })

    // Delete the program
    await db.program.delete({
      where: { id: programId }
    })

    return NextResponse.json({ message: "Program deleted successfully" })

  } catch (error) {
    console.error("Program DELETE error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}