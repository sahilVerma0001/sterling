import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes - only system_admin
    if (path.startsWith("/admin")) {
      if (token?.role !== "system_admin") {
        // Redirect agency_admin and others to agency dashboard
        return NextResponse.redirect(new URL("/agency/dashboard", req.url));
      }
    }

    // Agency routes - any authenticated user
    if (path.startsWith("/agency")) {
      if (!token) {
        return NextResponse.redirect(new URL("/signin", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname.startsWith("/api/auth")) {
          return true;
        }

        // Protect /agency and /admin routes
        if (req.nextUrl.pathname.startsWith("/agency") || req.nextUrl.pathname.startsWith("/admin")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/agency/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};

