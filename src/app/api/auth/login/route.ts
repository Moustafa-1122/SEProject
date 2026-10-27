import InvalidCredentialsException from "@/exceptions/invalid-credentials-exception";
import { logError } from "@/lib/logger";
import { AuthService } from "@/services/auth-service";
import { loginSchema } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parseData = loginSchema.safeParse(body);
  if (!parseData.success) {
    return NextResponse.json({ error: parseData.error.issues[0].message }, { status: 400 });
  }

  try {
    const token = await AuthService.login(parseData.data);

    const response = NextResponse.json({ message: "Logged in successfully" }, { status: 200 });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 12, // 12h in seconds
      path: "/",
    });

    return response;
  } catch (error: any) {
    if (error instanceof InvalidCredentialsException) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    logError("POST /api/auth/login failed:", error);
    return NextResponse.json({ error: "Error logging in" }, { status: 500 });
  }
}