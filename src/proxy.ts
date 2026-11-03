import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

function isValidToken(token?: string) {
  if (!token) return false;
  try {
    verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = isValidToken(request.cookies.get("session_token")?.value);

  // Public routes are always allowed to access without authentication 
  if (pathname === "/" || pathname === "/login") {
    if (authed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return pathname === "/"
      ? NextResponse.redirect(new URL("/login", request.url))
      : NextResponse.next();
  }

  // If the user is authenticated, allow access to all other routes. If not, redirect to login or return 401 for API routes. 
  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/",
    "/login",
    // API
    "/api/clients/:path*",
    "/api/vehicles/:path*",
    "/api/service-types/:path*",
    "/api/reminders/:path*",
    "/api/dashboard",
    // Pages
    "/dashboard",
    "/clients/:path*",
    "/vehicles/:path*",
    "/service-types/:path*",
  ],
};