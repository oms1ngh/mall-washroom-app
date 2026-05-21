import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const role = token.role as string

    if (path.startsWith("/dashboard/super-admin")) {
      if (role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    if (path.startsWith("/dashboard/owner")) {
      if (role !== "OWNER") {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    if (path.startsWith("/dashboard/supervisor")) {
      if (role !== "SUPERVISOR") {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    if (path.startsWith("/dashboard/gm")) {
      if (role !== "GENERAL_MANAGER") {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*"],
}