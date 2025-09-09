import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get system-wide statistics
    const [totalUsers, activeUsers, totalChannels, totalPrograms, totalSchedules, recentUsers] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.channel.count({ where: { isActive: true } }),
      db.program.count(),
      db.schedule.count(),
      db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          companyName: true,
          isActive: true,
          createdAt: true
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalChannels,
      totalPrograms,
      totalSchedules,
      recentUsers
    })

  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}