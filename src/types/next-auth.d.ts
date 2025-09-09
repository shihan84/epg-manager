import { UserRole } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      companyName?: string
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    companyName?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    companyName?: string
  }
}