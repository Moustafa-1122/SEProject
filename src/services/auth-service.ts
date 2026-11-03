import bcrypt from "bcryptjs";
import InvalidCredentialsException from "@/exceptions/invalid-credentials-exception";
import { authRepository } from "@/repository/auth-repository";
import {
  signToken,
  signResetToken,
  verifyResetToken,
  matchesPasswordFingerprint,
} from "@/lib/jwt";
import { sendPasswordResetEmail } from "@/lib/email";
import { logError } from "@/lib/logger";
import { Login } from "@/types/auth";

export class AuthService {
  static async login(data: Login) {
    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw new InvalidCredentialsException("email or password is incorrect");
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password_hash);
    if (!passwordMatches) {
      throw new InvalidCredentialsException("email or password is incorrect");
    }

    const token = signToken(user.user_id);
    return token;
  }

  // Request a password reset for the given email. If the email exists, a reset link will be sent to the user's email. If the email does not exist, nothing will happen.
  static async requestPasswordReset(email: string) {
    const user = await authRepository.findByEmail(email);
    if (!user) return;

    try {
      const appUrl = process.env.APP_URL;
      if (!appUrl) throw new Error("APP_URL is not set");

      const token = signResetToken(user.user_id, user.password_hash);
      const resetUrl = `${appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;

      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (error) {
      logError("AuthService.requestPasswordReset failed:", error);
    }
  }

  static async resetPassword(token: string, newPassword: string) {
    const invalid = () =>
      new InvalidCredentialsException("Reset link is invalid or has expired");

    let payload: { user_id: number; pwd: string };
    try {
      payload = verifyResetToken(token);
    } catch {
      throw invalid();
    }

    const user = await authRepository.findById(payload.user_id);
    if (!user || !matchesPasswordFingerprint(payload.pwd, user.password_hash)) {
      throw invalid();
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await authRepository.updatePassword(user.user_id, password_hash);
  }
}
