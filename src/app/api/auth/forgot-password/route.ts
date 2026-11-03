import { logError } from "@/lib/logger";
import { AuthService } from "@/services/auth-service";
import { forgotPasswordSchema } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parseData = forgotPasswordSchema.safeParse(body);
  if (!parseData.success) {
    return NextResponse.json({ error: parseData.error.issues[0].message }, { status: 400 });
  }

  try {
    await AuthService.requestPasswordReset(parseData.data.email);

    // نفس الرد سواء الإيميل موجود أو لا (حتى ما حدا يعرف مين مسجّل عندك)
    return NextResponse.json(
      { message: "If an account exists for that email, a reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    logError("POST /api/auth/forgot-password failed:", error);
    return NextResponse.json({ error: "Error requesting password reset" }, { status: 500 });
  }
}
