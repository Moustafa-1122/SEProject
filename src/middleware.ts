export const runtime = "nodejs";//next.config.js -> experimental: { appDir: true }

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export const config = {
  matcher: [// Match all request paths except for the ones defined below
    "/api/clients/:path*",
    "/api/vehicles/:path*",
    "/api/service-types/:path*",
    "/api/reminders/:path*",
    "/api/dashboard",
  ],
};