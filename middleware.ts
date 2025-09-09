import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "ADMIN"
    
    // Admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }
    
    // Protected routes
    if (req.nextUrl.pathname.startsWith("/dashboard") || 
        req.nextUrl.pathname.startsWith("/channels") ||
        req.nextUrl.pathname.startsWith("/programs") ||
        req.nextUrl.pathname.startsWith("/schedules") ||
        req.nextUrl.pathname.startsWith("/epg")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes that don't require authentication
        const publicPaths = ["/", "/auth/signin", "/auth/signup"]
        const isPublicPath = publicPaths.some(path => 
          req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(path)
        )
        
        if (isPublicPath) {
          return true
        }
        
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}