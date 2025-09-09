import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id
    const { isActive } = await request.json()

    // Don't allow deactivating the current admin
    if (userId === session.user.id && !isActive) {
      return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { isActive }
    })

    return NextResponse.json(user)

  } catch (error) {
    console.error("User toggle error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}