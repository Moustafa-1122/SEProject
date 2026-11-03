import InvalidCredentialsException from "@/exceptions/invalid-credentials-exception";
import { logError } from "@/lib/logger";
import { AuthService } from "@/services/auth-service";
import { resetPasswordSchema } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parseData = resetPasswordSchema.safeParse(body);
  if (!parseData.success) {
    return NextResponse.json({ error: parseData.error.issues[0].message }, { status: 400 });
  }

  try {
    await AuthService.resetPassword(parseData.data.token, parseData.data.password);
    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error: any) {
    // رابط غلط أو منتهي أو مستعمل: 400 (مش 401، لأنو مش مشكلة login)
    if (error instanceof InvalidCredentialsException) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("POST /api/auth/reset-password failed:", error);
    return NextResponse.json({ error: "Error resetting password" }, { status: 500 });
  }
}
