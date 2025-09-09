import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, companyName } = await request.json()

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyName,
        role: UserRole.CLIENT,
      }
    })

    // Create a demo channel for the user
    await db.channel.create({
      data: {
        name: "demo-channel",
        displayName: "Demo Channel",
        description: "A demo channel for testing",
        userId: user.id,
      }
    })

    // Create a demo program for the user
    await db.program.create({
      data: {
        title: "Demo Program",
        description: "A demo program for testing",
        category: "Entertainment",
        duration: 60,
        userId: user.id,
      }
    })

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}